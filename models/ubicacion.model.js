const mongoose = require('mongoose');

const ubicacionSchema = new mongoose.Schema({
    idubicacion: Number,
    lugarubi: String
});

const Ubicacion = mongoose.model('Ubicacion', ubicacionSchema, 'ubicacion');

module.exports = Ubicacion;
