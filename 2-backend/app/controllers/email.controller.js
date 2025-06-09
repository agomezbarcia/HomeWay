const nodemailer = require("nodemailer");

// Controlador para enviar correos electrónicos
exports.sendEmail = async (req, res) => {
    // Extraer datos del cuerpo de la petición
    const { to, subject, message, html } = req.body;

    // Configurar el transporte de nodemailer usando Gmail y variables de entorno
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    // Definir las opciones del correo electrónico
    const mailOptions = {
        from: `"HomeWay" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        text: message,
        html: html,
    };

    try {
        // Enviar el correo electrónico
        await transporter.sendMail(mailOptions);
        // Responder con éxito
        res.status(200).json({ success: true, message: "Correo enviado correctamente." });
    } catch (error) {
        // Manejar errores y responder con fallo
        console.error("Error al enviar correo:", error);
        res.status(500).json({ success: false, message: "Error enviando el correo." });
    }
};