const Reporte = require('../models/reporte.model'); // Asegúrate de crear el modelo correspondiente en Mongoose
const Usuario = require('../models/usuario.model');
const Equipo = require('../models/equipo.model');
const Ubicacion = require('../models/ubicacion.model');
const DetalleDanio = require('../models/detalledanio.model');
const EstadoReporte = require('../models/estadoreporte.model');
const Solucion = require('../models/solucion.model');
const EstadoSolucion = require('../models/estadosolucion.model');

// Obtener todos los reportes abiertos

async function getReportes(req, res) {
    try {
        // 1️⃣ Buscar los reportes con `idestadoreporte = 1`
        const reportes = await Reporte.find({ idestadoreporte: 1 }).lean();
        if (!reportes.length) {
            return res.status(400).json({ message: 'No se encontraron reportes con este estado!' });
        }

        // 2️⃣ Buscar todos los estados de reporte (para la descripción)
        const estados = await EstadoReporte.find().lean();

        // 3️⃣ Recorrer cada reporte y buscar la información relacionada
        const reportesDetallados = await Promise.all(reportes.map(async (reporte) => {
            const usuario = await Usuario.findOne({ idusuario: reporte.idusuario }).lean();
            const equipo = await Equipo.findOne({ idequipo: reporte.idequipo }).lean();
            const ubicacion = await Ubicacion.findOne({ idubicacion: reporte.idubicacion }).lean();
            const detalledanio = await DetalleDanio.findOne({ iddetalledanio: reporte.iddetalledanio }).lean();
            const estado = estados.find(e => e.idestadoreporte === reporte.idestadoreporte);

            return {
                idreporte: reporte.idreporte,
                usuario: usuario ? `${usuario.nombres} ${usuario.apellidos}` : 'No encontrado',
                equipo: equipo ? equipo.nombreequipo : 'No encontrado',
                ubicacion: ubicacion ? ubicacion.lugarubi : 'No encontrada',
                detalledanio: detalledanio ? detalledanio.detalledanio : 'No encontrado',
                estadoreporte: estado ? estado.descripcioner : 'Estado desconocido',
                fecha: reporte.fecha,
                descripcion: reporte.descripcion,
                evidencia: reporte.evidencia
            };
        }));

        // 4️⃣ Enviar la respuesta con los datos completos
        res.json(reportesDetallados);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error en el servidor!' });
    }
}

// Obtener todos los reportes abiertos por laboratorio
async function getReportesPorLab(req, res) {
    const { id } = req.params;
    try {
        // 1️⃣ Buscar reportes con idubicacion y estado "Abierto"
        const estados = await EstadoReporte.find().lean();
        const estadoAbierto = estados.find(e => e.descripcioner === 'Abierto');

        if (!estadoAbierto) {
            return res.status(400).json({ message: 'No se encontró el estado "Abierto"!' });
        }

        const reportes = await Reporte.find({ idubicacion: id, idestadoreporte: estadoAbierto.idestadoreporte })
            .sort('idreporte')
            .lean();

        if (!reportes.length) {
            return res.status(400).json({ message: 'No se encontraron reportes para este laboratorio!' });
        }

        // 2️⃣ Recorrer cada reporte y obtener los datos relacionados manualmente
        const reportesDetallados = await Promise.all(reportes.map(async (reporte) => {
            const usuario = await Usuario.findOne({ idusuario: reporte.idusuario }).lean();
            const equipo = await Equipo.findOne({ idequipo: reporte.idequipo }).lean();
            const ubicacion = await Ubicacion.findOne({ idubicacion: reporte.idubicacion }).lean();
            const detalledanio = await DetalleDanio.findOne({ iddetalledanio: reporte.iddetalledanio }).lean();

            return {
                idreporte: reporte.idreporte,
                usuario: usuario ? `${usuario.nombres} ${usuario.apellidos}` : 'No encontrado',
                equipo: equipo ? equipo.nombreequipo : 'No encontrado',
                ubicacion: ubicacion ? ubicacion.lugarubi : 'No encontrada',
                detalledanio: detalledanio ? detalledanio.detalledanio : 'No encontrado',
                estadoreporte: estadoAbierto.descripcioner, // Estado ya filtrado antes
                fecha: reporte.fecha,
                descripcion: reporte.descripcion,
                evidencia: reporte.evidencia
            };
        }));

        // 3️⃣ Enviar la respuesta con los datos completos
        res.json(reportesDetallados);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error en el servidor!' });
    }
}

// Obtener los reportes de un usuario
async function getReportesUsuario(req, res) {
    const { id } = req.params;
    try {
        // 1️⃣ Buscar los reportes del usuario
        const reportes = await Reporte.find({ idusuario: id }).sort('idreporte').lean();
        if (!reportes.length) {
            return res.status(400).json({ message: 'No se encontraron reportes para este usuario!' });
        }

        // 2️⃣ Buscar información relacionada
        const estados = await EstadoReporte.find().lean();

        // 3️⃣ Recorrer cada reporte y obtener los datos relacionados manualmente
        const reportesDetallados = await Promise.all(reportes.map(async (reporte) => {
            const usuario = await Usuario.findOne({ idusuario: reporte.idusuario }).lean();
            const equipo = await Equipo.findOne({ idequipo: reporte.idequipo }).lean();
            const ubicacion = await Ubicacion.findOne({ idubicacion: reporte.idubicacion }).lean();
            const detalledanio = await DetalleDanio.findOne({ iddetalledanio: reporte.iddetalledanio }).lean();
            const estado = estados.find(e => e.idestadoreporte === reporte.idestadoreporte);

            return {
                idreporte: reporte.idreporte,
                usuario: usuario ? `${usuario.nombres} ${usuario.apellidos}` : 'No encontrado',
                equipo: equipo ? equipo.nombreequipo : 'No encontrado',
                ubicacion: ubicacion ? ubicacion.lugarubi : 'No encontrada',
                detalledanio: detalledanio ? detalledanio.detalledanio : 'No encontrado',
                estadoreporte: estado ? estado.descripcioner : 'Estado desconocido',
                fecha: reporte.fecha,
                descripcion: reporte.descripcion,
                evidencia: reporte.evidencia
            };
        }));

        // 4️⃣ Enviar la respuesta con los datos completos
        res.json(reportesDetallados);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error en el servidor!' });
    }
}

// Obtener los últimos reportes de un usuario
async function getUltimosReportesUsuario(req, res) {
    const { id } = req.params;
    try {
        const reportes = await Reporte.find({ idusuario: id })
            .sort({ fecha: -1 })
            .limit(5)
            .populate('idusuario', 'nombres apellidos')
            .populate('idequipo', 'nombreequipo')
            .populate('idubicacion', 'lugarubi')
            .populate('iddetalledanio', 'detalledanio')
            .populate('idestadoreporte', 'descripcioner');

        res.json(reportes);
    } catch (err) {
        res.status(500).json({ error: 'Error en el servidor!' });
    }
}

// Obtener detalles de un reporte específico
async function getDetallesReporte(req, res) {
    const { id } = req.params;
    const idReporte = parseInt(id, 10);

    if (isNaN(idReporte)) {
        return res.status(400).json({ error: 'El ID del reporte debe ser un número válido.' });
    }

    try {
        // 1️⃣ Buscar el reporte por idreporte
        const reporte = await Reporte.findOne({ idreporte: idReporte }).lean();
        if (!reporte) {
            return res.status(404).json({ error: 'Reporte no encontrado' });
        }

        const estados = await EstadoReporte.find().lean();

        // 2️⃣ Obtener los datos relacionados manualmente
        const usuario = await Usuario.findOne({ idusuario: reporte.idusuario }).lean();
        const equipo = await Equipo.findOne({ idequipo: reporte.idequipo }).lean();
        const ubicacion = await Ubicacion.findOne({ idubicacion: reporte.idubicacion }).lean();
        const detalledanio = await DetalleDanio.findOne({ iddetalledanio: reporte.iddetalledanio }).lean();
        const estado = estados.find(e => e.idestadoreporte === reporte.idestadoreporte);

        // 3️⃣ Formatear la respuesta con los datos completos
        const reporteDetallado = {
            idreporte: reporte.idreporte,
            usuario: usuario ? `${usuario.nombres} ${usuario.apellidos}` : 'No encontrado',
            equipo: equipo ? equipo.nombreequipo : 'No encontrado',
            ubicacion: ubicacion ? ubicacion.lugarubi : 'No encontrada',
            detalledanio: detalledanio ? detalledanio.detalledanio : 'No encontrado',
            estadoreporte: estado ? estado.descripcioner : 'Estado desconocido',
            fecha: reporte.fecha,
            descripcion: reporte.descripcion,
            evidencia: reporte.evidencia
        };

        // 4️⃣ Enviar la respuesta final
        res.json(reporteDetallado);

    } catch (err) {
        console.error('Error al obtener los detalles del reporte:', err);
        res.status(500).json({ error: 'Error en el servidor!' });
    }
}

// Crear un nuevo reporte
async function createReporte(req, res) {
    try {
        const nuevoReporte = new Reporte(req.body);
        await nuevoReporte.save();
        res.status(201).json(nuevoReporte);
    } catch (err) {
        res.status(500).json({ error: 'Error al crear el reporte' });
    }
}

async function getDetallesReporteSolucionUsuario(req, res) {
    try {
        const { id } = req.params;
        const { idusuario } = req.body;

        // 1️⃣ Buscar el reporte por `idreporte` y `idusuario`
        const reporte = await Reporte.findOne({ idreporte: id, idusuario }).lean();
        if (!reporte) {
            return res.status(400).json({ message: 'No se encontraron los datos del reporte!' });
        }

        // 2️⃣ Buscar la solución relacionada con el reporte
        const solucion = await Solucion.findOne({ idreporte: id }).lean();
        if (!solucion) {
            return res.status(400).json({ message: 'No se encontró una solución para este reporte!' });
        }

        // 3️⃣ Obtener los datos relacionados de cada colección
        const usuario = await Usuario.findOne({ idusuario: solucion.idencargado }).lean();
        const equipo = await Equipo.findOne({ idequipo: reporte.idequipo }).lean();
        const ubicacion = await Ubicacion.findOne({ idubicacion: reporte.idubicacion }).lean();
        const detalledanio = await DetalleDanio.findOne({ iddetalledanio: reporte.iddetalledanio }).lean();
        const estadoreporte = await EstadoReporte.findOne({ idestadoreporte: reporte.idestadoreporte }).lean();
        const estadosolucion = await EstadoSolucion.findOne({ idestadosolucion: solucion.idestadosolucion }).lean();

        // 4️⃣ Formatear la respuesta final
        res.json({
            idreporte: reporte.idreporte,
            descripcionsolucion: solucion.descripcions,
            estadosolucion: estadosolucion ? estadosolucion.descripciones : "No encontrado",
            usuario: usuario ? `${usuario.nombres} ${usuario.apellidos}` : "No encontrado",
            equipo: equipo ? equipo.nombreequipo : "No encontrado",
            ubicacion: ubicacion ? ubicacion.lugarubi : "No encontrada",
            detalledanio: detalledanio ? detalledanio.detalledanio : "No encontrado",
            estadoreporte: estadoreporte ? estadoreporte.descripcioner : "No encontrado",
            fecha: reporte.fecha,
            descripcion: reporte.descripcion,
            evidencia: reporte.evidencia
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error en el servidor!' });
    }
}

async function getDetallesReporteUsuario(req, res) {
    try {
        const { id } = req.params; // ID del reporte
        const { idusuario } = req.body; // ID del usuario

        // 1️⃣ Buscar el reporte por su `idreporte` y `idusuario`
        const reporte = await Reporte.findOne({ idreporte: id, idusuario }).lean();

        if (!reporte) {
            return res.status(400).json({ message: 'No se encontraron los datos!' });
        }

        // 2️⃣ Buscar cada dato relacionado usando su ID (Consultas Manuales)
        const usuario = await Usuario.findOne({ idusuario: reporte.idusuario }).lean();
        const equipo = await Equipo.findOne({ idequipo: reporte.idequipo }).lean();
        const ubicacion = await Ubicacion.findOne({ idubicacion: reporte.idubicacion }).lean();
        const detalledanio = await DetalleDanio.findOne({ iddetalledanio: reporte.iddetalledanio }).lean();
        const estadoreporte = await EstadoReporte.findOne({ idestadoreporte: reporte.idestadoreporte }).lean();

        // 3️⃣ Formatear la respuesta con los nombres correctos
        const respuesta = {
            idreporte: reporte.idreporte,
            usuario: usuario ? `${usuario.nombres} ${usuario.apellidos}` : "No encontrado",
            equipo: equipo ? equipo.nombreequipo : "No encontrado",
            ubicacion: ubicacion ? ubicacion.lugarubi : "No encontrada",
            detalledanio: detalledanio ? detalledanio.detalledanio : "No encontrado",
            estadoreporte: estadoreporte ? estadoreporte.descripcioner : "No encontrado",
            fecha: reporte.fecha,
            descripcion: reporte.descripcion,
            evidencia: reporte.evidencia
        };

        res.json(respuesta);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error en el servidor!' });
    }
}

async function getNumeroReporteNuevo(req, res) {
    try {
        // Contar el número total de reportes y sumarle 1
        const count = await Reporte.countDocuments();
        const nuevoIdReporte = count + 1;

        res.json({ idreporte: nuevoIdReporte });
    } catch (err) {
        console.error('Error al obtener el número de nuevo reporte:', err);
        res.status(500).json({ error: 'Error en el servidor!' });
    }
}

async function getReportesAbiertosUsuarioC(req, res) {
    const { id } = req.params;

    try {
        const cantidad = await Reporte.countDocuments({ idestadoreporte: 1, idusuario: parseInt(id, 10) });

        res.json( cantidad );
    } catch (err) {
        console.error('Error al obtener la cantidad de reportes abiertos:', err);
        res.status(500).json({ error: 'Error en el servidor!' });
    }
}

async function getReportesCerradosUsuarioC(req, res) {
    const { id } = req.params;

    try {
        const cantidad = await Reporte.countDocuments({ idestadoreporte: 2, idusuario: parseInt(id, 10) });

        res.json( cantidad );
    } catch (err) {
        console.error('Error al obtener la cantidad de reportes cerrados:', err);
        res.status(500).json({ error: 'Error en el servidor!' });
    }
}

async function getReportesAbiertosUsuario(req, res) {
    const { id } = req.params;

    try {
        const reportes = await Reporte.find({ idestadoreporte: 1, idusuario: parseInt(id, 10) })
            .populate('idusuario', 'nombres apellidos')
            .populate('idequipo', 'nombreequipo')
            .populate('idubicacion', 'lugarubi')
            .populate('iddetalledanio', 'detalledanio')
            .populate('idestadoreporte', 'descripcionER');

        if (reportes.length > 0) {
            res.json(reportes);
        } else {
            res.status(400).json({ message: 'No se encontraron los datos!' });
        }
    } catch (err) {
        console.error('Error al obtener reportes abiertos:', err);
        res.status(500).json({ error: 'Error en el servidor!' });
    }
}

async function getReportesCerradosUsuario(req, res) {
    const { id } = req.params;

    try {
        const reportes = await Reporte.find({ idestadoreporte: 2, idusuario: parseInt(id, 10) })
            .populate('idusuario', 'nombres apellidos')
            .populate('idequipo', 'nombreequipo')
            .populate('idubicacion', 'lugarubi')
            .populate('iddetalledanio', 'detalledanio')
            .populate('idestadoreporte', 'descripcionER');

        if (reportes.length > 0) {
            res.json(reportes);
        } else {
            res.status(400).json({ message: 'No se encontraron los datos!' });
        }
    } catch (err) {
        console.error('Error al obtener reportes cerrados:', err);
        res.status(500).json({ error: 'Error en el servidor!' });
    }
}

async function getUsuariodeunReporte(req, res) {
    try {
        const { id } = req.params; // ID del reporte

        // 1️⃣ Buscar el reporte por su `idreporte` para obtener el `idusuario`
        const reporte = await Reporte.findOne({ idreporte: id }).lean();

        if (!reporte) {
            return res.status(400).json({ message: 'Reporte no encontrado!' });
        }

        // 2️⃣ Buscar el usuario relacionado usando su `idusuario`
        const usuario = await Usuario.findOne({ idusuario: reporte.idusuario }).lean();

        if (!usuario) {
            return res.status(400).json({ message: 'Usuario no encontrado!' });
        }

        // 3️⃣ Formatear la respuesta con el `email` y el `nombreestudiante`
        const respuesta = {
            email: usuario.email,
            nombreestudiante: `${usuario.nombres} ${usuario.apellidos}` // Concatenación de nombre y apellidos
        };

        res.json(respuesta);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error en el servidor!' });
    }
}


module.exports = {
    getReportes,
    getReportesPorLab,
    getReportesUsuario,
    getUltimosReportesUsuario,
    getDetallesReporte,
    createReporte,
    getDetallesReporteSolucionUsuario,
    getDetallesReporteUsuario,
    getNumeroReporteNuevo,
    getReportesAbiertosUsuarioC,
    getReportesCerradosUsuarioC,
    getReportesAbiertosUsuario,
    getReportesCerradosUsuario,
    getUsuariodeunReporte
};
