const mongoose = require('mongoose');

const reporteSchema = new mongoose.Schema({
    idreporte: Number,
    idusuario: Number,
    idequipo: Number,
    idubicacion: Number,
    iddetalledanio: Number,
    idestadoreporte: Number, // Cambiado a Number en lugar de ObjectId
    fecha: {
        type: String, // Guardar la fecha como String en formato "YYYY-MM-DD"
        set: (v) => new Date(v).toISOString().split('T')[0] // Formatea antes de guardar
    },
    descripcion: String,
    evidencia: String
});

module.exports = mongoose.model('Reporte', reporteSchema);

