const Equipo = require('../models/equipo.model');

// Obtener todas las ubicaciones
async function getEquipos(req, res) {
    try {
        const equipos = await Equipo.find();
        if (equipos.length > 0) {
            res.json(equipos);
        } else {
            res.status(400).json({ message: 'No se encontraron los datos!' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Error en el servidor!' });
    }
}

module.exports = { getEquipos };
