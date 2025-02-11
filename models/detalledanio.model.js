const mongoose = require('mongoose');

const detalleDanioSchema = new mongoose.Schema({
    iddetalledanio: Number,
    idtipodanio: Number,
    detalledanio: String
});

const DetalleDanio = mongoose.model('DetalleDanio', detalleDanioSchema, 'detalledanio');

module.exports = DetalleDanio;
