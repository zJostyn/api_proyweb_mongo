const DetalleDanio = require('../models/detalledanio.model');;

// Obtener los detalles de daños de un tipo
async function getDetallesDanio(req, res) {
    const { id } = req.params;
    try {
        const detalles = await DetalleDanio.find({ idtipodanio: Number(id) });
        if (detalles.length > 0) {
            res.json(detalles);
        } else {
            res.status(400).json({ message: 'No se encontraron los datos!' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Error en el servidor!' });
    }
}

module.exports = { getDetallesDanio };
