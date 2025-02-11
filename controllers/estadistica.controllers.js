const Reporte = require('../models/reporte.model');
const EstadoReporte = require('../models/estadoreporte.model');
const Equipo = require('../models/equipo.model');
const Ubicacion = require('../models/ubicacion.model');
const Usuario = require('../models/usuario.model');
const TipoDanio = require('../models/tipodanio.model');
const DetalleDanio = require('../models/detalledanio.model');

async function getTotalReportes(req, res) {
    try {
        const totalReportes = await Reporte.countDocuments();
        res.json(totalReportes);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error en el servidor!' });
    }
}

async function getTotalReportesAbiertos(req, res) {
    try {
        const estado = await EstadoReporte.findOne({ descripcioner: 'Abierto' });
        const totalAbiertos = await Reporte.countDocuments({ idestadoreporte: estado.idestadoreporte });
        res.json(totalAbiertos);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error en el servidor!' });
    }
}

async function getTotalReportesCerrados(req, res) {
    try {
        const estado = await EstadoReporte.findOne({ descripcioner: 'Cerrado' });
        const totalCerrados = await Reporte.countDocuments({ idestadoreporte: estado.idestadoreporte });
        res.json(totalCerrados);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error en el servidor!' });
    }
}

async function getGraficoReportesPorEquipo(req, res) {
    try {
        const data = await Reporte.aggregate([
            {
                $group: {
                    _id: "$idequipo", // Agrupamos por idequipo
                    cantidad: { $sum: 1 } // Contamos la cantidad de reportes por equipo
                }
            },
            {
                $lookup: {
                    from: "equipo", // Nombre de la colección en MongoDB
                    localField: "_id", // idequipo en Reporte
                    foreignField: "idequipo", // idequipo en Equipo
                    as: "equipo"
                }
            },
            {
                $unwind: "$equipo" // Desanidar el array resultado del lookup
            },
            {
                $project: {
                    _id: 0, // Ocultar el _id de MongoDB
                    x: "$equipo.nombreequipo", // Nombre del equipo
                    y: "$cantidad" // Cantidad de reportes
                }
            },
            { $sort: { y: -1 } } // Ordenar por cantidad en orden descendente
        ]);

        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error en el servidor!" });
    }
}

async function getGraficoEstadoReportes(req, res) {
    try {
        // Agregación en MongoDB para contar reportes por estado
        const resultado = await Reporte.aggregate([
            {
                $lookup: {
                    from: "estadoreporte", // Nombre de la colección en MongoDB
                    localField: "idestadoreporte",
                    foreignField: "idestadoreporte",
                    as: "estado"
                }
            },
            { $unwind: "$estado" }, // Desanidar el array de estado
            {
                $group: {
                    _id: "$estado.descripcioner",
                    cantidad: { $sum: 1 }
                }
            },
            { $sort: { cantidad: -1 } } // Ordenar por cantidad descendente
        ]);

        // Formatear la respuesta como { x: estado, y: cantidad }
        const data = resultado.map(row => ({
            x: row._id,
            y: row.cantidad
        }));

        res.json(data);
    } catch (err) {
        console.error("Error al obtener gráfico de estados de reportes:", err);
        res.status(500).json({ error: "Error en el servidor!" });
    }
}

async function getGraficoReportesPorUbicacion(req, res) {
    try {
        // Agrupar reportes por idubicacion y contar cantidad
        const resultado = await Reporte.aggregate([
            {
                $group: {
                    _id: "$idubicacion",
                    cantidad: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: "ubicacion", // Nombre de la colección en MongoDB
                    localField: "_id",
                    foreignField: "idubicacion",
                    as: "ubicacion"
                }
            },
            { $unwind: "$ubicacion" }, // Desanidar el array de ubicaciones
            {
                $project: {
                    x: {
                        $substrCP: ["$ubicacion.lugarubi", 0, 9] // Obtener los primeros 9 caracteres
                    },
                    y: "$cantidad"
                }
            },
            { $sort: { y: -1 } } // Ordenar por cantidad descendente
        ]);

        res.json(resultado);
    } catch (err) {
        console.error("Error al obtener gráfico de reportes por ubicación:", err);
        res.status(500).json({ error: "Error en el servidor!" });
    }
}

async function getGraficoReportesPorMes(req, res) {
    try {
        const resultado = await Reporte.aggregate([
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m", date: { $toDate: "$fecha" } } // Convertir fecha a formato "YYYY-MM"
                    },
                    cantidad: { $sum: 1 } // Contar reportes por mes
                }
            },
            {
                $project: {
                    x: "$_id", // Asignar el mes formateado a 'x'
                    y: "$cantidad"
                }
            },
            { $sort: { x: 1 } } // Ordenar por mes ascendente
        ]);

        res.json(resultado);
    } catch (err) {
        console.error("Error al obtener gráfico de reportes por mes:", err);
        res.status(500).json({ error: "Error en el servidor!" });
    }
}

async function getGraficoReportesPorUsuario(req, res) {
    try {
        const reportes = await Reporte.aggregate([
            {
                $group: {
                    _id: "$idusuario", // Agrupar por idusuario
                    cantidad: { $sum: 1 } // Contar reportes por usuario
                }
            },
            { $sort: { cantidad: -1 } } // Ordenar de mayor a menor
        ]);

        // Función para generar iniciales y agregar ID
        function generarEtiqueta(nombres, apellidos, idusuario) {
            if (!nombres || !apellidos) return `Desconocido (ID: ${idusuario})`;

            const palabras = `${nombres} ${apellidos}`.split(" ");
            let iniciales = palabras.map(p => p[0].toUpperCase()).join("");

            if (iniciales.length > 4) {
                iniciales = iniciales.substring(0, 4); // Máximo 4 letras
            }

            return `${iniciales} (ID: ${idusuario})`;
        }

        const data = await Promise.all(reportes.map(async ({ _id, cantidad }) => {
            const usuario = await Usuario.findOne({ idusuario: _id }, "nombres apellidos idusuario");

            return {
                x: usuario ? generarEtiqueta(usuario.nombres, usuario.apellidos, usuario.idusuario) : `Desconocido (ID: ${_id})`,
                y: cantidad
            };
        }));

        res.json(data);
    } catch (err) {
        console.error("Error al obtener gráfico de reportes por usuario:", err);
        res.status(500).json({ error: "Error en el servidor!" });
    }
}


async function getGraficoTotalReportesPorTipoDanio(req, res) {
    try {
        // 1. Contar los reportes agrupados por idtipodanio
        const reportes = await Reporte.aggregate([
            {
                $group: {
                    _id: "$iddetalledanio", // Agrupar por iddetalledanio
                    cantidad: { $sum: 1 } // Contar reportes por tipo de daño
                }
            }
        ]);

        // 2. Obtener la relación con TipoDaño
        const data = await Promise.all(reportes.map(async ({ _id, cantidad }) => {
            const detalle = await DetalleDanio.findOne({ iddetalledanio: _id }, "idtipodanio");
            if (!detalle) return null; // Si no hay detalle, omitir
            const tipoDanio = await TipoDanio.findOne({ idtipodanio: detalle.idtipodanio }, "tipodanio");
            return tipoDanio ? { tipo_danio: tipoDanio.tipodanio, cantidad } : null;
        }));

        // 3. Filtrar nulos y ordenar por cantidad descendente
        const resultado = data.filter(item => item !== null).sort((a, b) => b.cantidad - a.cantidad);

        res.json(resultado);
    } catch (err) {
        console.error("Error al obtener gráfico de reportes por tipo de daño:", err);
        res.status(500).json({ error: "Error en el servidor!" });
    }
}

module.exports = {
    getTotalReportes,
    getTotalReportesAbiertos,
    getTotalReportesCerrados,
    getGraficoReportesPorEquipo,
    getGraficoEstadoReportes,
    getGraficoReportesPorUbicacion,
    getGraficoReportesPorMes,
    getGraficoReportesPorUsuario,
    getGraficoTotalReportesPorTipoDanio
};
