const Usuario = require('../models/usuario.model');
const { sendEmail } = require('./enviarcorreos.controllers.js');
const crypto = require('crypto');
//const bcrypt = require('bcrypt');

let codigoVerificacion = null;
let emailtemp = null;

// Obtener todos los usuarios
async function getUsuarios(req, res) {
    try {
        const usuarios = await Usuario.find();
        res.status(200).json(usuarios);
    } catch (err) {
        res.status(500).json({ error: 'Error en el servidor!' });
    }
}

// Verificar si el correo ya está registrado
async function verCorreosRegistrados(req, res) {
    const { email } = req.body;
    try {
        const usuario = await Usuario.findOne({ email });
        if (usuario) {
            res.status(400).json({ message: 'Ya existe un usuario con este correo!' });
        } else {
            res.status(200).json({ message: 'Correo no registrado!' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Error en el servidor!' });
    }
}

// Crear un nuevo usuario
async function createUsuario(req, res) {
    const { idtipousu, nombres, apellidos, email, pass, avatar } = req.body;

    try {
        const usuarioExistente = await Usuario.findOne({ email });
        if (usuarioExistente) {
            return res.status(400).json({ message: 'El correo ya está registrado.' });
        }

        const ultimoUsuario = await Usuario.findOne().sort({ idusuario: -1 }).limit(1);
        const idusuario = ultimoUsuario ? ultimoUsuario.idusuario + 1 : 1;

        // Generar un token único de verificación
        const tokenVerificacion = crypto.randomBytes(32).toString('hex');
        
        // Encriptar la contraseña
        //const passEncriptada = await bcrypt.hash(pass, 10);

        // Crear usuario sin activar
        const nuevoUsuario = new Usuario({
            idusuario, idtipousu, nombres, apellidos, email, pass, avatar,
            verificado: false,
            tokenVerificacion,
            verificaciondedospasos: true
        });

        await nuevoUsuario.save();

        // Obtener la URL del frontend desde req.headers['origin'] o usar un valor por defecto
        const clientURL = req.headers['origin'] || "http://localhost:4200";

        // Enlace de verificación con la URL del frontend como parámetro
        const urlVerificacion = `http://localhost:3000/api/verificartoken/${tokenVerificacion}?client=${encodeURIComponent(clientURL)}`;

        const mensajeHTML = `
            <div id="formatoNotificaciones" style="text-align: center; font-family: Arial, sans-serif;">
                <img src="https://univercimas.com/wp-content/uploads/2021/04/Universidad-Tecnica-de-Machala.png" 
                    alt="Logo UTMACH" style="max-width: 300px; height: auto; margin: 0 auto; display: block;">
                
                <h1 style="font-weight: bold; color: #19457C !important; font-style: italic; text-align: center; margin-top: 20px;">
                    ¡Bienvenido/a estudiante a HELP DESK REPORT de la Universidad Técnica de Machala!
                </h1>
                
                <h3 style="font-weight: bold; text-align: center; margin-bottom: 10px;">
                    Estimado/a <span style="color: #0056b3; font-weight: bold;">${nombres} ${apellidos}</span>, <br>
                    Para activar tu cuenta, por favor haz clic en el siguiente enlace:
                </h3>
                
                <a href="${urlVerificacion}" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; font-size: 18px; font-weight: bold;">
                    Activar Cuenta
                </a>

                <p style="font-size: 16px; color: #333; margin-top: 20px; text-align: center;">
                    Si no solicitaste esta cuenta, puedes ignorar este mensaje.
                </p>

                <footer style="text-align: center; margin-top: 30px; font-size: 14px; color: #888;">
                    <p>Atentamente,</p>
                    <p><strong>Equipo de Seguridad UTMACH</strong></p>
                    <p>Universidad Técnica de Machala</p>
                </footer>
            </div>
        `;


        await sendEmail(email, "Verifica tu cuenta", mensajeHTML);

        res.status(200).json({ message: 'Se creó el usuario. Revisa tu correo para activarlo.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error en el servidor!' });
    }
}



async function verificarTokenUsuario(req, res) {
    try {
        const { token } = req.params;
        const usuario = await Usuario.findOne({ tokenVerificacion: token });
        const clientURL = req.query.client || "http://localhost:4200"; // Si no se pasa, usa localhost:4200

        if (!usuario) {
            return res.status(400).json({ message: "Token inválido o expirado." });
        }

        // Activar la cuenta
        usuario.verificado = true;
        usuario.tokenVerificacion = null; // Eliminar el token después de usarlo
        await usuario.save();

        // Construcción del mensaje de correo
        const mensajeHTML = `
            <div id="formatoNotificaciones" style="text-align: center; font-family: Arial, sans-serif;">
                <img src="https://univercimas.com/wp-content/uploads/2021/04/Universidad-Tecnica-de-Machala.png" 
                     alt="Logo UTMACH" style="max-width: 300px; height: auto; margin: 0 auto; display: block;">
                
                <h1 style="font-weight: bold; color: #19457C !important; font-style: italic; text-align: center; margin-top: 20px;">
                    ¡Cuenta Verificada Exitosamente!
                </h1>
                
                <h3 style="font-weight: bold; text-align: center; margin-bottom: 10px;">
                    Estimado/a <span style="color: #0056b3; font-weight: bold;">${usuario.nombres} ${usuario.apellidos}</span>, <br>
                    ¡Tu cuenta ha sido verificada correctamente!
                </h3>
                
                <p style="font-size: 16px; color: #333; margin-top: 20px; text-align: center;">
                    Ya puedes iniciar sesión en nuestra plataforma utilizando tu correo y contraseña.
                </p>

                <footer style="text-align: center; margin-top: 30px; font-size: 14px; color: #888;">
                    <p>Atentamente,</p>
                    <p><strong>Equipo de Seguridad UTMACH</strong></p>
                    <p>Universidad Técnica de Machala</p>
                </footer>
            </div>
        `;

        await sendEmail(usuario.email, "Cuenta Verificada", mensajeHTML);

        const redirectURL = `${clientURL}/verificacion-exitosa`;

        console.log("Redirigiendo a:", redirectURL);

        res.redirect(redirectURL);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error en el servidor!" });
    }
}


// Verificar usuario por email y contraseña
async function verificarUsuario(req, res) {
    const { email, pass } = req.body;

    try {
        const usuario = await Usuario.findOne({ email }).select('-tokenVerificacion');
        
        if (!usuario) {
            return res.status(404).json({ error: "Error, el usuario ingresado es incorrecto!" });
        }

        //const esValida = await bcrypt.compare(pass, usuario.pass);
        if (pass != usuario.pass) {
            return res.status(400).json({ error: "Error, la contraseña ingresada es incorrecta!" });
        }

        if (!usuario.verificado) {
            return res.status(400).json({ message: 'Tu cuenta no está verificada. Por favor, revisa tu correo para activar tu cuenta.' });
        }

        // Si la verificación en dos pasos está desactivada, enviar respuesta directa
        if (!usuario.verificaciondospasos) {
            return res.status(200).json({
                idusuario: usuario.idusuario,
                idtipousu: usuario.idtipousu,
                nombres: usuario.nombres,
                apellidos: usuario.apellidos,
                email: usuario.email,
                avatar: usuario.avatar,
                verificaciondedospasos: false // Enviado solo cuando la verificación en dos pasos está desactivada
            });
        }

        // Si la verificación en dos pasos está activada
        codigoVerificacion = crypto.randomInt(100000, 999999); // Genera un código aleatorio de 6 dígitos

        const mensajeHTML = `
            <div id="formatoNotificaciones" style="text-align: center; font-family: Arial, sans-serif;">
                <img src="https://univercimas.com/wp-content/uploads/2021/04/Universidad-Tecnica-de-Machala.png" 
                    alt="Logo UTMACH" style="max-width: 300px; height: auto; margin: 0 auto; display: block;">
                
                <h1 style="font-weight: bold; color: #19457C !important; font-style: italic; text-align: center; margin-top: 20px;">
                    ¡Código de Verificación!
                </h1>
                
                <h3 style="font-weight: bold; text-align: center; margin-bottom: 10px;">
                    Estimado/a <span style="color: #0056b3; font-weight: bold;">${usuario.nombres} ${usuario.apellidos}</span>, <br>
                    Hemos recibido una solicitud de inicio de sesión en tu cuenta.
                </h3>
                
                <p style="font-size: 16px; color: #333; margin-top: 20px; text-align: center;">
                    Tu código de verificación es: <span style="font-weight: bold; font-size: 24px; color: #19457C;">${codigoVerificacion}</span>
                </p>

                <p style="font-size: 16px; color: #333; margin-top: 10px; text-align: center;">
                    Ingresa este código en la página de inicio de sesión para continuar con el proceso.
                </p>

                <footer style="text-align: center; margin-top: 30px; font-size: 14px; color: #888;">
                    <p>Atentamente,</p>
                    <p><strong>Equipo de Seguridad UTMACH</strong></p>
                    <p>Universidad Técnica de Machala</p>
                </footer>
            </div>
        `;

        await sendEmail(usuario.email, 'Código de Verificación', mensajeHTML);

        emailtemp = usuario.email;

        // Enviar respuesta sin datos sensibles (cuando sí hay verificación en dos pasos)
        return res.status(200).json({
            idusuario: usuario.idusuario,
            idtipousu: usuario.idtipousu,
            nombres: usuario.nombres,
            apellidos: usuario.apellidos,
            email: usuario.email,
            avatar: usuario.avatar,
            verificaciondedospasos: true // Enviado solo cuando la verificación en dos pasos está activada
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error en el servidor!' });
    }
}


// Verificar código ingresado
async function verificarCodigo(req, res) {
    const { codigo } = req.body;

    try {
        if (!codigoVerificacion) {
            return res.status(400).json({ error: "No se ha generado un código de verificación." });
        }

        if (parseInt(codigo) !== codigoVerificacion) {
            return res.status(400).json({ error: "El código de verificación es incorrecto." });
        }

        const usuario = await Usuario.findOne({ email: emailtemp }).select('-tokenVerificacion');

        if (!usuario) {
            return res.status(404).json({ error: "Usuario no encontrado." });
        }

        const fechaHora = new Date().toLocaleString("es-ES", { timeZone: "America/Guayaquil" });

        const ipConexion = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress;

        const mensajeHTML = `
            <div id="formatoNotificaciones" style="text-align: center; font-family: Arial, sans-serif;">
                <img src="https://univercimas.com/wp-content/uploads/2021/04/Universidad-Tecnica-de-Machala.png" 
                     alt="Logo UTMACH" style="max-width: 300px; height: auto; margin: 0 auto; display: block;">
                
                <h1 style="font-weight: bold; color: #19457C !important; font-style: italic; text-align: center; margin-top: 20px;">
                    Inicio de Sesión Exitoso
                </h1>
                
                <h3 style="font-weight: bold; text-align: center; margin-bottom: 10px;">
                    Estimado/a <span style="color: #0056b3; font-weight: bold;">${usuario.nombres} ${usuario.apellidos}</span>, <br>
                    Se ha registrado un inicio de sesión en tu cuenta el <strong>${fechaHora}</strong>.
                </h3>
                
                <h3 style="font-weight: bold; text-align: center; margin-bottom: 10px;">
                    <span style="font-weight: bold;">Dirección IP:</span> <span style="color: #0056b3;">${ipConexion}</span>
                </h3>

                <p style="font-size: 16px; color: #333; margin-top: 20px; text-align: center;">
                    Si reconoces este inicio de sesión, no es necesario que realices ninguna acción. <br>
                    Si no has sido tú, te recomendamos cambiar tu contraseña de inmediato y contactar con el soporte técnico.
                </p>

                <p style="font-size: 14px; color: #666; text-align: center; margin-top: 20px;">
                    Para mayor seguridad, te recomendamos revisar regularmente la actividad de tu cuenta y activar la verificación en dos pasos si está disponible.
                </p>

                <footer style="text-align: center; margin-top: 30px; font-size: 14px; color: #888;">
                    <p>Atentamente,</p>
                    <p><strong>Equipo de Seguridad UTMACH</strong></p>
                    <p>Universidad Técnica de Machala</p>
                </footer>
            </div>
        `;

        await sendEmail(usuario.email, "Inicio de Sesión Exitoso", mensajeHTML);

        return res.status(200).json({ message: "Código correcto. Acceso permitido." });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error en el servidor!' });
    }
}

const actualizarVerificacionDosPasos = async (req, res) => {
    const { idusuario } = req.params;
    const { estado } = req.body;
  
    try {
      const usuario = await Usuario.findOne({ idusuario });
  
      if (!usuario) {
        return res.status(404).json({ error: "Usuario no encontrado." });
      }
  
      usuario.verificaciondospasos = estado;
  
      await usuario.save();
  
      return res.status(200).json({ message: "Verificación de dos pasos actualizada correctamente.", usuario });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Error al actualizar la verificación de dos pasos." });
    }
  };

module.exports = { getUsuarios, createUsuario, verificarUsuario, verCorreosRegistrados, verificarTokenUsuario, verificarCodigo, actualizarVerificacionDosPasos };
