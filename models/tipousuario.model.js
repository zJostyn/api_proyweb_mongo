const mongoose = require('mongoose');

const tipousuarioSchema = new mongoose.Schema({
    idtipousu: Number,
    nombretipousu: String
});

const TipoUsuario = mongoose.model('TipoUsuario', tipousuarioSchema, 'tipousuario');

module.exports = TipoUsuario;
