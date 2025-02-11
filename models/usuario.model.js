const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
    idusuario: Number,
    idtipousu: Number,
    nombres: String,
    apellidos: String,
    email: String,
    pass: String,
    avatar: String,
    verificado: { type: Boolean, default: false },
    tokenVerificacion: String,
    verificaciondospasos: { type: Boolean, default: true }
});

module.exports = mongoose.model('Usuario', usuarioSchema);
