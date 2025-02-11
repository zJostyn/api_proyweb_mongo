const mongoose = require('mongoose');

const solucionSchema = new mongoose.Schema({
    idsolucion: Number,
    idreporte: Number,
    idencargado: Number,
    idestadosolucion: Number,
    fecha: Date,
    descripcions: String
});

module.exports = mongoose.model('Solucion', solucionSchema, 'solucion');
