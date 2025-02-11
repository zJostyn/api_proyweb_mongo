const { Router } = require('express');
const router = new Router();

var { getUsuarios, createUsuario, verificarUsuario, verCorreosRegistrados, verificarTokenUsuario, verificarCodigo, actualizarVerificacionDosPasos } = require('../controllers/usuarios.controllers');

var { getReportes, getReportesPorLab, getReportesUsuario, getUltimosReportesUsuario, getReportesUsuario, getDetallesReporte, createReporte, getDetallesReporteSolucionUsuario, getDetallesReporteUsuario, getNumeroReporteNuevo, getReportesAbiertosUsuarioC, getReportesCerradosUsuarioC, getReportesAbiertosUsuario, getReportesCerradosUsuario, getUsuariodeunReporte } = require('../controllers/reportes.controllers');

var { getSolucionesEncargado, getUltimasSolucionesEncargado, getSolucionesLogradasEncargado, getSolucionesNoLogradasEncargado, getDetallesSolucion, createSolucion } = require('../controllers/soluciones.controllers');

var { getTipoDaños } = require('../controllers/tipodaños.controllers');

var { getDetallesDanio } = require('../controllers/detallesdaños.controllers');

var { getUbicaciones } = require('../controllers/ubicaciones.controllers');

var {  getTotalReportes,
    getTotalReportes,
    getTotalReportesAbiertos,
    getTotalReportesCerrados,
    getGraficoReportesPorEquipo,
    getGraficoEstadoReportes,
    getGraficoReportesPorUbicacion,
    getGraficoReportesPorMes,
    getGraficoReportesPorUsuario, getGraficoTotalReportesPorTipoDanio } = require('../controllers/estadistica.controllers');
const { getEquipos } = require('../controllers/equipos.controllers');


//rutas de los endpoint
router.get('/usuarios', getUsuarios);
router.post('/usuario', createUsuario);
router.post('/verificarusuario', verificarUsuario);
router.post('/verificarcorreo', verCorreosRegistrados);
router.get('/verificartoken/:token', verificarTokenUsuario);
router.post('/verificar-codigo', verificarCodigo);
router.put("/usuario/:idusuario/verificacion-dos-pasos", actualizarVerificacionDosPasos);

router.get('/reportesab', getReportes);
router.get('/reportsabpl/:id', getReportesPorLab);
router.get('/reportesusuario/:id', getReportesUsuario);
router.get('/ultimosreportes/:id', getUltimosReportesUsuario);
router.get('/reportesabiertosusuario/:id', getReportesAbiertosUsuario);
router.get('/reportescerradosusuario/:id', getReportesCerradosUsuario);
router.get('/reportesabiertosusuarioc/:id', getReportesAbiertosUsuarioC);
router.get('/reportescerradosusuarioc/:id', getReportesCerradosUsuarioC);
router.post('/detallesreporteusuario/:id', getDetallesReporteUsuario);
router.post('/detallesreporteusuariosolu/:id', getDetallesReporteSolucionUsuario);
router.get('/detallesreporte/:id', getDetallesReporte);
router.get('/numeroreportenuevo', getNumeroReporteNuevo);
router.post('/crearreporte', createReporte);
router.get('/usuariodeunreporte/:id', getUsuariodeunReporte);

router.get('/solucionesen/:id', getSolucionesEncargado);
router.get('/ultimassolucionesen/:id', getUltimasSolucionesEncargado);
router.get('/solucioneslogradasen/:id', getSolucionesLogradasEncargado);
router.get('/solucionesnologradasen/:id', getSolucionesNoLogradasEncargado);
router.post('/detallessolucionencargado/:id', getDetallesSolucion);
router.post('/crearsolucion', createSolucion)

router.get('/tiposdanio', getTipoDaños);
router.get('/detallesdanio/:id', getDetallesDanio);

router.get('/ubicaciones', getUbicaciones);
router.get('/equipos', getEquipos);

// Ruta para obtener el total de reportes
router.get('/estadistica/totalReportes', getTotalReportes);

// Ruta para obtener el total de reportes abiertos
router.get('/estadistica/totalReportesAbiertos', getTotalReportesAbiertos);

// Ruta para obtener el total de reportes cerrados
router.get('/estadistica/totalReportesCerrados', getTotalReportesCerrados);

// Ruta para obtener el gráfico de reportes por equipo
router.get('/estadistica/graficoReportesPorEquipo', getGraficoReportesPorEquipo);

// Ruta para obtener el gráfico de reportes por estado
router.get('/estadistica/graficoEstadoReportes', getGraficoEstadoReportes);

// Ruta para obtener el gráfico de reportes por ubicación
router.get('/estadistica/graficoReportesPorUbicacion', getGraficoReportesPorUbicacion);

// Ruta para obtener el gráfico de reportes por mes
router.get('/estadistica/graficoReportesPorMes', getGraficoReportesPorMes);

// Ruta para obtener el gráfico de reportes por usuario
router.get('/estadistica/graficoReportesPorUsuario', getGraficoReportesPorUsuario);

router.get('/estadistica/reportesPorTipoDanio', getGraficoTotalReportesPorTipoDanio);



module.exports = router;