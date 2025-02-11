const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
const { sendEmail } = require('./controllers/enviarcorreos.controllers'); // Asegúrate de que esta ruta es correcta

app.set('trust proxy', true);

// Rutas
var proyweb_routes = require('./routes/proyweb.routes');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Configuración para la subida de archivos
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    },
});

const upload = multer({ storage: storage });

// Ruta para subir archivos
app.post('/upload', upload.single('file'), (req, res) => {
    res.status(200).json(req.file.path.split('uploads').pop());
    res.sendStatus(200);
});

// Ruta para obtener imágenes subidas
app.get('/get-image/:filename', (req, res) => {
    const filename = req.params.filename;
    const imagePath = path.join(__dirname, 'uploads', filename);
    res.sendFile(imagePath);
});

app.post('/send-email', (req, res) => {
    const { to, subject, html } = req.body;
  
    sendEmail(to, subject, html)
      .then(() => {
        res.status(200).json({ message: 'Correo enviado correctamente' });
      })
      .catch((error) => {
        res.status(500).json({ message: 'Error al enviar el correo', error: error.message });
      });
  });
  

// Conexión a MongoDB usando Mongoose
mongoose.connect('mongodb+srv://zjostyn:jostyn001@cluster0.krawz.mongodb.net/proy_web?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Conectado a MongoDB'))
    .catch((error) => console.log('Error al conectar a MongoDB:', error));

// Rutas de la API
app.use('/api', proyweb_routes);

// Levantar el servidor en el puerto 3000
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
