const mongoose = require('mongoose');

const equipoSchema = new mongoose.Schema({
    idequipo: Number,
    nombreequipo: String,
    imagenequipo: String
});

const Equipo = mongoose.model('Equipo', equipoSchema, 'equipo');

module.exports = Equipo;
