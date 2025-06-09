import http from "@/utils/request";

/**
 * Servicio para el envío de correos electrónicos relacionados con la plataforma HomeWay.
 */
class MailerService {

    /**
     * Formatea una fecha en formato DD/MM/YYYY.
     * @param {string} dateStr - Fecha en formato string.
     * @returns {string} Fecha formateada.
     */
    formatDate(dateStr) {
        const date = new Date(dateStr);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    /**
     * Envía un correo de confirmación de cuenta al usuario.
     * @param {string} email - Correo electrónico del destinatario.
     * @param {string} id - ID del usuario para el enlace de confirmación.
     * @returns {Promise} Promesa de la petición HTTP.
     */
    sendConfirmationEmail(email, id) {
        const htmlConfirmation = `
            <h2>¡Bienvenido a nuestra plataforma!</h2>
            <p>Gracias por registrarte. Para activar tu cuenta, por favor haz clic en el siguiente enlace:</p>
            <p>
                <a href="http://localhost/api/user/confirm/${id}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                Confirmar cuenta
                </a>
            </p>
            <p>Si no puedes hacer clic, copia y pega el siguiente enlace en tu navegador:</p>
            <p><a href="http://localhost/api/user/confirm/${id}">http://localhost/api/user/confirm/${id}</a></p>
            <p>Gracias,<br/>El equipo de HomeWay</p>
        `;

        const data = {
            to: email,                          // Destinatario del correo
            subject: "Confirmación de cuenta",  // Asunto del correo
            message: '',                        // Contenido de texto plano (vacío)
            html: htmlConfirmation              // Contenido HTML del correo
        };

        return http.post("/mailer/sendEmail", data);
    }

    /**
     * Envía un correo de confirmación de pago al usuario.
     * @param {Object} user - Objeto con los datos del usuario.
     * @param {Object} booking - Objeto con los datos de la reserva.
     * @returns {Promise} Promesa de la petición HTTP.
     */
    sendPaymentConfirmationEmail(user, booking) {
        const htmlConfirmation = `
            <div style="font-family: 'Segoe UI', sans-serif; background-color: #f4f4f4; padding: 40px;">
                <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                    <div style="background-color: #1a73e8; color: white; padding: 24px; text-align: center;">
                        <h1 style="margin: 0; font-size: 24px;">¡Pago realizado con éxito!</h1>
                    </div>
                    <div style="padding: 24px;">
                        <h2 style="color: #1a73e8; font-size: 20px; margin-top: 0;">Hola ${user.name || 'viajero'},</h2>
                        <p>Nos alegra confirmarte que hemos recibido tu pago correctamente para tu próxima estancia en Homeway.</p>
                        <div style="background-color: #f9f9f9; padding: 16px; border-radius: 8px; margin: 20px 0; font-size: 15px;">
                            <p><strong>Fechas:</strong> ${this.formatDate(booking.checkInDate)} - ${this.formatDate(booking.checkOutDate)}</p>
                            <p><strong>Total pagado:</strong> €${booking.totalPrice}</p>
                            <p><strong>Reserva ID:</strong> #HOME-${booking.property}</p>
                        </div>
                        <p>Ya puedes prepararte para tu viaje.</p>
                    </div>
                    <div style="font-size: 13px; color: #888; text-align: center; padding: 20px;">
                        © 2025 Homeway. Todos los derechos reservados.
                    </div>
                </div>
            </div>
        `;

        const data = {
            to: user.email,                                         // Destinatario del correo
            subject: "✅ Pago confirmado - Tu reserva en Homeway",   // Asunto del correo
            message: '',                                            // Contenido de texto plano (vacío)
            html: htmlConfirmation                                  // Contenido HTML del correo
        };

        return http.post("/mailer/sendEmail", data);
    }
}

export default new MailerService();