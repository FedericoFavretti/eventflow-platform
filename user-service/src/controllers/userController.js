const Counter = require('../models/Counter');
const User = require('../models/User');

class UserController {
    static async createUser(req, res) {
        try {
            console.log('Iniciando creación de usuario...');
            const { tipo_documento, nro_documento, nombre, apellido, email } = req.body;
            console.log('Datos recibidos:', req.body);
            
            // Validación básica de campos requeridos
            if (!tipo_documento || !nro_documento || !nombre || !apellido || !email) {
                return res.status(400).json({
                    error: 'Todos los campos son requeridos',
                    campos: ['tipo_documento', 'nro_documento', 'nombre', 'apellido', 'email']
                });
            }

            // Validar formato de email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    error: 'Formato de email inválido'
                });
            }

            console.log('Validación básica pasada, verificando duplicados...');

            // VERIFICAR SI EL USUARIO YA EXISTE
            const existingUser = await User.checkExistingUser(email, nro_documento);
            
            if (existingUser) {
                let errorMessage = 'Usuario ya existe';
                let duplicateFields = [];
                
                if (existingUser.byEmail && existingUser.byDocument) {
                    errorMessage = 'Ya existe un usuario con este email y número de documento';
                    duplicateFields = ['email', 'nro_documento'];
                } else if (existingUser.byEmail) {
                    errorMessage = 'Ya existe un usuario con este email';
                    duplicateFields = ['email'];
                } else if (existingUser.byDocument) {
                    errorMessage = 'Ya existe un usuario con este número de documento';
                    duplicateFields = ['nro_documento'];
                }

                return res.status(400).json({
                    error: errorMessage,
                    campos_duplicados: duplicateFields,
                    usuario_existente: {
                        id: existingUser.byEmail ? existingUser.emailUser._id : existingUser.documentUser._id,
                        nombre: existingUser.byEmail ? existingUser.emailUser.nombre : existingUser.documentUser.nombre
                    }
                });
            }

            console.log('No hay duplicados, creando usuario en MongoDB...');

            // Crear usuario en MongoDB
            const newUser = new User({
                tipo_documento,
                nro_documento,
                nombre,
                apellido,
                email
            });

            await newUser.save();
            console.log('Usuario creado con ID:', newUser._id);

            res.status(201).json({
                message: 'Usuario creado exitosamente',
                user: {
                    id: newUser._id,
                    tipo_documento: newUser.tipo_documento,
                    nro_documento: newUser.nro_documento,
                    nombre: newUser.nombre,
                    apellido: newUser.apellido,
                    email: newUser.email,
                    fecha_creacion: newUser.createdAt
                }
            });

        } catch (error) {
            console.error('Error en createUser:', error);
            
            // Manejar error de duplicado de MongoDB (por si acaso)
            if (error.code === 11000) {
                const field = Object.keys(error.keyPattern)[0];
                return res.status(400).json({
                    error: `Usuario ya existe`,
                    campo_duplicado: field
                });
            }
            
            res.status(500).json({ 
                error: 'Error interno del servidor',
                detalle: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    static async getAllUsers(req, res) {
        try {
            // Usar método cacheado
            const users = await User.findAllCached();
            
            res.json({
                count: users.length,
                users: users,
                source: 'mongodb' // Podríamos indicar si vino de cache o DB
            });
        } catch (error) {
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    static async exportUsers(req, res) { 
        try { 
            // Usar método cacheado
            const users = await User.findAllCached();
            //Anonimizar datos personales 
            const anonymizedUsers = users.map(user => ({ 
                id: user.id,
                tipo_documento: user.tipo_documento, 
                nro_documento: 'ANONYMIZED', 
                nombre: 'ANONYMIZED',
                apellido: 'ANONYMIZED', 
                email: 'ANONYMIZED', 
                historial_compras: user.historial_compras
            })); 

            res.json({
                count: anonymizedUsers.length, 
                users: anonymizedUsers 
            }); 
        } catch (error) { 
            res.status(500).json({ error: 'Error interno del servidor'}); 
        } 
    }

    static async getUserById(req, res) {
        try {
            const user = await User.findByCachedId(req.params.id);
            if (!user) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }else{
                res.json({
                    user: user
                });
            }
        } catch (error) {
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }


    static async updateUser(req, res) {
        try {
            const { nro_documento } = req.params;
            const updateData = req.body;

            const user = await User.findByDocumentoAndUpdate(nro_documento, updateData, { 
                new: true, 
                runValidators: true 
            });

            if (!user) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            res.json({
                message: 'Usuario actualizado exitosamente',
                user: user
            });
        } catch (error) {
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    static async deleteUser(req, res) {
        try {
            const { id } = req.params;
            
            // Convertir id a número (porque _id es numérico)
            const userId = parseInt(id);
            if (isNaN(userId)) {
                return res.status(400).json({ error: 'ID inválido' });
            }

            const user = await User.findByCachedId(userId);
            if (!user) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            await User.deleteUserById(userId);
            
            res.json({ 
                message: 'Usuario eliminado exitosamente',
                usuario_eliminado: {
                    id: user._id,
                    nombre: user.nombre,
                    email: user.email
                }
            });
        } catch (error) {
            console.error('Error en deleteUser:', error);
            res.status(500).json({ 
                error: 'Error interno del servidor',
                detalle: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
}

module.exports = UserController;