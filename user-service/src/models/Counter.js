const mongoose = require('mongoose');

// Agregar este modelo para el contador
const counterSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    sequence_value: { type: Number, default: 0 }
});

const Counter = mongoose.model('Counter', counterSchema);
module.exports = Counter;