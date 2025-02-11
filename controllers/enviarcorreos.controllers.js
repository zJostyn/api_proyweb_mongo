const nodemailer = require('nodemailer');

async function sendEmail(to, subject, html) {
  let transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'helpdeskreportutmach@gmail.com',
      pass: 'eclayykdchhhcmje',
    },
  });

  let mailOptions = {
    from: 'helpdeskreportutmach@gmail.com',
    to: to,
    subject: subject,
    html: html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Correo enviado correctamente');
  } catch (error) {
    console.error('Error al enviar el correo:', error);
    // Aquí puedes imprimir más detalles para entender mejor el problema
    res.status(500).json({ message: 'Error al enviar el correo', error: error });
  }
}

module.exports = { sendEmail };
