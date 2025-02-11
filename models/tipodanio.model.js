const mongoose = require('mongoose');

const tipoDanioSchema = new mongoose.Schema({
    idtipodanio: { type: Number, required: true, unique: true },
    tipodanio: { type: String, required: true }
});

module.exports = mongoose.model('TipoDanio', tipoDanioSchema, 'tipodanio');
