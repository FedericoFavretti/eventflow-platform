const mongoose = require('mongoose');
const database = require('../config/database');
const Counter = require('./Counter.js');

// Schema de MongoDB
const userSchema = new mongoose.Schema({
    _id: { 
        type: Number
    },
    tipo_documento: {
        type: String,
        required: true,
        enum: ['DNI', 'Pasaporte', 'Cédula']
    },
    nro_documento: {
        type: String,
        required: true,
        unique: true
    },
    nombre: {
        type: String,
        required: true
    },
    apellido: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    historial_compras: [{
        evento_id: String,
        fecha_compra: Date,
        cantidad_entradas: Number,
        monto_total: Number
    }]
}, {
    timestamps: true
});


// Métodos para Redis caching
userSchema.statics.findByCachedId = async function(id) {
    const cacheKey = `user:${id}`;
    
    // Intentar obtener de Redis primero
    try {
        const cachedUser = await database.redisClient.get(cacheKey);
        if (cachedUser) {
            console.log('📦 Usuario obtenido de Redis cache');
            return JSON.parse(cachedUser);
        }
    } catch (error) {
        console.warn('Error al leer de Redis:', error);
    }

    console.log('Usuario no encontrado en cache, obteniendo de MongoDB...');
    // Si no está en cache, obtener de MongoDB
    const user = await this.findById(id);
    if (user) {
        // Guardar en Redis por 1 hora
        try {
            console.log('Guardando usuario en Redis cache');
            await database.redisClient.setEx(cacheKey, 3600, JSON.stringify(user));
        } catch (error) {
            console.warn('Error al guardar en Redis:', error);
        }
    }
    
    return user;
};

userSchema.statics.findAllCached = async function() {
    const cacheKey = 'users:all';
    
    // Intentar obtener de Redis primero
    try {
        const cachedUsers = await database.redisClient.get(cacheKey);
        if (cachedUsers) {
            console.log('📦 Lista de usuarios obtenida de Redis cache');
            return JSON.parse(cachedUsers);
        }
    } catch (error) {
        console.warn('Error al leer de Redis:', error);
    }

    console.log('Lista de usuarios no encontrada en cache, obteniendo de MongoDB...');
    // Si no está en cache, obtener de MongoDB
    const users = await this.find().sort({ createdAt: -1 })//.lean();//.lean hace que sean objetos planos como los de redis
    
    // Guardar en Redis por 30 minutos
    try {
        console.log('Guardando lista de usuarios en Redis cache');
        await database.redisClient.setEx(cacheKey, 1800, JSON.stringify(users));
    } catch (error) {
        console.warn('Error al guardar en Redis:', error);
    }
    
    return users;
};

// Middleware para generar ID autoincremental
userSchema.pre('save', async function(next) {
    try{
        if (this.isNew) {
            console.log('Generando nuevo ID autoincremental para usuario...');
            const counter = await Counter.findByIdAndUpdate(
                { _id: 'user_id' },
                { $inc: { sequence_value: 1 } },
                { new: true, upsert: true }
            );
            this._id = counter.sequence_value;
            console.log('Nuevo ID asignado:', this._id);
        }
        next();
    }catch(error){
        console.error('Error al generar ID autoincremental:', error);
        next(error);
    }
});

// Middleware para invalidar cache cuando se actualiza un usuario
userSchema.post('save', function() {
    const cacheKeys = [`user:${this._id}`, 'users:all'];
    cacheKeys.forEach(async (key) => {
        try {
            await database.redisClient.del(key);
            console.log(`🗑️ Cache invalidado: ${key}`);
        } catch (error) {
            console.warn('Error al invalidar cache:', error);
        }
    });
});

userSchema.statics.findByDocumentoAndUpdate = async function(nro_documento, updateData, options = {}) {
    // Buscar el usuario por nro_documento
    const user = await this.findOne({ nro_documento });
    if (!user){
        return null;
    } else{
            // Actualizar los campos del usuario
        Object.keys(updateData).forEach(key => {
            user[key] = updateData[key];
        });

        // Guardar el usuario actualizado
        await user.save(options);

        // Invalidar cache para este usuario y la lista de usuarios
        const cacheKeys = [`user:${user._id}`, 'users:all'];
        cacheKeys.forEach(async (key) => {
            try {
                await database.redisClient.del(key);
                console.log(`🗑️ Cache invalidado: ${key}`);
            } catch (error) {
                console.warn('Error al invalidar cache:', error);
            }
        });
        return user;
    }
};

userSchema.statics.deleteUserById = async function(id) {
    const user = await this.findOne({ id });
    if (!user) {
        return null;
    }else{
        await user.deleteOne();

        const cacheKeys = [`user:${user._id}`, 'users:all'];
        cacheKeys.forEach(async (key) => {
            try {
                await database.redisClient.del(key);
                console.log(`🗑️ Cache invalidado: ${key}`);
            } catch (error) {
                console.warn('Error al invalidar cache:', error);
            }
        });   
        return user;
    }

};

userSchema.statics.checkExistingUser = async function(email, nro_documento) {
    try {
        console.log(`🔍 Verificando existencia de usuario: email=${email}, doc=${nro_documento}`);
        
        // Buscar usuarios que coincidan con email O nro_documento
        const existingUsers = await this.find({
            $or: [
                { email: email },
                { nro_documento: nro_documento }
            ]
        });

        if (existingUsers.length === 0) {
            console.log('✅ No se encontraron usuarios duplicados');
            return null;
        }

        // Analizar qué campos están duplicados
        const result = {
            exists: true,
            byEmail: false,
            byDocument: false,
            existingUsers: existingUsers
        };

        existingUsers.forEach(user => {
            if (user.email === email) {
                result.byEmail = true;
                result.emailUser = user;
            }
            if (user.nro_documento === nro_documento) {
                result.byDocument = true;
                result.documentUser = user;
            }
        });

        console.log(`❌ Usuario duplicado encontrado: email=${result.byEmail}, doc=${result.byDocument}`);
        return result;
    } catch (error) {
        console.error('❌ Error verificando usuario existente:', error);
        throw error;
    }
};


const User = mongoose.model('User', userSchema);
module.exports = User;