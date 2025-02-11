
const TipoDanio = require('../models/tipodanio.model');

// Obtener los tipos de daños
async function getTipoDaños(req, res) {
    try {
        const tiposDanio = await TipoDanio.find();
        if (tiposDanio.length > 0) {
            res.json(tiposDanio);
        } else {
            res.status(400).json({ message: 'No se encontraron los datos!' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Error en el servidor!' });
    }
}

module.exports = { getTipoDaños };
