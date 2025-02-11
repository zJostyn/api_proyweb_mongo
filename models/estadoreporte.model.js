const mongoose = require('mongoose');

const estadoReporteSchema = new mongoose.Schema({
    idestadoreporte: Number, // Este será el identificador de relación
    descripcioner: String
});

module.exports = mongoose.model('EstadoReporte', estadoReporteSchema, 'estadoreporte');
