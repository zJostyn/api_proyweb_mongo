const mongoose = require('mongoose');

const EstadoSolucion = require('../models/estadosolucion.model');
const Solucion = require('../models/solucion.model');
const Usuario = require('../models/usuario.model');
const Reporte = require('../models/reporte.model');
const EstadoReporte = require('../models/estadoreporte.model');

// Obtener soluciones de un encargado
async function getSolucionesEncargado(req, res) {
    const { id } = req.params;

    try {
        const usuario = await Usuario.findOne({ idusuario: Number(id) }).select('idusuario nombres apellidos');
        const soluciones = await Solucion.find({ idencargado: usuario.idusuario });

        if (soluciones.length > 0) {
            const estadosSolucion = await EstadoSolucion.find({
                idestadosolucion: { $in: soluciones.map(solucion => solucion.idestadosolucion) }
            });

            const estadoMap = estadosSolucion.reduce((acc, estado) => {
                acc[estado.idestadosolucion] = estado.descripciones;
                return acc;
            }, {});

            const resultadosConEvidencia = await Promise.all(soluciones.map(async (solucion) => {
                let evidencia = 'Sin evidencia';
                if (solucion.idreporte) {
                    const reporte = await Reporte.findOne({ idreporte: solucion.idreporte });
                    if (reporte) {
                        evidencia = reporte.evidencia || 'Evidencia no disponible';
                    }
                }

                const estadoDescripcion = estadoMap[solucion.idestadosolucion] || 'Sin estado';

                return {
                    idsolucion: solucion.idsolucion,
                    idreporte: solucion.idreporte,
                    encargado: `${usuario.nombres} ${usuario.apellidos}`,
                    estadosolucion: estadoDescripcion,
                    fecha: solucion.fecha ? solucion.fecha.toISOString().split('T')[0] : null,
                    descripcions: solucion.descripcions,
                    evidencia: evidencia.replace(/\\\\/g, '\\')
                };
            }));
            res.json(resultadosConEvidencia);
        } else {
            res.status(400).json({ message: 'No se encontraron soluciones para este encargado!' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Error en el servidor!' });
    }
}




// Obtener las 3 últimas soluciones de un encargado
async function getUltimasSolucionesEncargado(req, res) {
    try {
        const soluciones = await Solucion.find({ idencargado: req.params.id }).sort({ fecha: -1 }).limit(3);
        res.json(soluciones.length > 0 ? soluciones : { message: 'No se encontraron los datos!' });
    } catch (err) {
        res.status(500).json({ error: 'Error en el servidor!' });
    }
}

// Obtener cantidad de soluciones logradas de un encargado
async function getSolucionesLogradasEncargado(req, res) {
    try {
        const count = await Solucion.countDocuments({ idencargado: req.params.id, idestadosolucion: 1 });
        res.json( count );
    } catch (err) {
        res.status(500).json({ error: 'Error en el servidor!' });
    }
}

// Obtener cantidad de soluciones no logradas de un encargado
async function getSolucionesNoLogradasEncargado(req, res) {
    try {
        const count = await Solucion.countDocuments({ idencargado: req.params.id, idestadosolucion: 2 });
        res.json(count);
    } catch (err) {
        res.status(500).json({ error: 'Error en el servidor!' });
    }
}

// Obtener detalles de una solución
async function getDetallesSolucion(req, res) {
    try {
        // Buscar la solución usando idreporte proporcionado en los parámetros
        const solucion = await Solucion.findOne({ idreporte: req.params.id });

        if (!solucion) {
            return res.status(400).json({ message: 'No se encontraron los datos!' });
        }

        // Obtener el reporte asociado con la solución
        const reporte = await Reporte.findOne({ idreporte: solucion.idreporte });
        
        // Obtener el usuario asociado con el idusuario del reporte
        const usuario = await Usuario.findOne({ idusuario: reporte.idusuario });

        // Obtener el estado de la solución
        const estadoSolucion = await EstadoSolucion.findOne({ idestadosolucion: solucion.idestadosolucion });

        // Obtener el estado del reporte
        const estadoReporte = await EstadoReporte.findOne({ idestadoreporte: reporte.idestadoreporte });

        // Obtener la evidencia relacionada al reporte
        let evidencia = reporte ? reporte.evidencia : 'Evidencia no disponible';

        // Formatear la fecha en el formato adecuado
        const fechaFormateada = solucion.fecha ? solucion.fecha.toISOString().split('T')[0] : null;

        // Construir el objeto de respuesta
        const detalle = {
            idsolucion: solucion.idsolucion,
            idreporte: solucion.idreporte,
            estudiante: usuario ? `${usuario.nombres} ${usuario.apellidos}` : 'Estudiante no encontrado',
            estadoreporte: estadoReporte ? estadoReporte.descripcioner : 'Estado reporte no encontrado',
            estadosolucion: estadoSolucion ? estadoSolucion.descripciones : 'Estado solución no encontrado',
            fecha: fechaFormateada,
            descripcions: solucion.descripcions,
            evidencia: evidencia.replace(/\\\\/g, '\\') // Reemplazar las barras invertidas dobles
        };

        // Retornar los detalles con la evidencia corregida
        res.json(detalle);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error en el servidor!' });
    }
}

// Crear una nueva solución
async function createSolucion(req, res) {
    const { idreporte, idencargado, idestadosolucion, fecha, descripcions } = req.body;

    try {
        // Obtener el último idsolucion y sumarle 1
        const lastSolucion = await Solucion.findOne({}, {}, { sort: { idsolucion: -1 } });
        const newIdSolucion = lastSolucion ? lastSolucion.idsolucion + 1 : 1;

        // Crear una nueva solución con el nuevo idsolucion
        const solucion = new Solucion({
            idsolucion: newIdSolucion,
            idreporte,
            idencargado,
            idestadosolucion,
            fecha,
            descripcions
        });

        // Guardar la solución en la colección `solucion`
        await solucion.save();

        // Actualizar el estado del reporte
        const reporte = await Reporte.findOneAndUpdate(
            { idreporte },
            { idestadoreporte: 2 }, // Cambiar el estado del reporte a "2" (por ejemplo, "Cerrado")
            { new: true }
        );

        if (!reporte) {
            return res.status(404).json({ message: 'Reporte no encontrado!' });
        }

        // Responder con éxito
        res.status(200).json({ message: 'Solución registrada correctamente!', idsolucion: newIdSolucion });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error en el servidor!' });
    }
}


module.exports = { getSolucionesEncargado, getUltimasSolucionesEncargado, getSolucionesLogradasEncargado, getSolucionesNoLogradasEncargado, getDetallesSolucion, createSolucion };