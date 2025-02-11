const mongoose = require('mongoose');

const estadoSolucionSchema = new mongoose.Schema({
    idestadosolucion: Number,
    descripciones: String
});

const EstadoSolucion = mongoose.model('EstadoSolucion', estadoSolucionSchema, 'estadosolucion');

module.exports = EstadoSolucion;
