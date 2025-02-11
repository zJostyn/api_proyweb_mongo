const Ubicacion = require('../models/ubicacion.model');

// Obtener todas las ubicaciones
async function getUbicaciones(req, res) {
    try {
        const ubicaciones = await Ubicacion.find();
        if (ubicaciones.length > 0) {
            res.json(ubicaciones);
        } else {
            res.status(400).json({ message: 'No se encontraron los datos!' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Error en el servidor!' });
    }
}

module.exports = { getUbicaciones };
