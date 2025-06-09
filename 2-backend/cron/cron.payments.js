// Importación de módulos necesarios
const express = require('express');
const bodyParser = require('body-parser');
const cron = require('node-cron');

// Inicialización de la aplicación Express
const app = express();

// Importación de modelos y controladores
const Booking = require("../app/models").bookings;
const Payment = require("../app/models").payments;
const PaymentController = require("../app/controllers/payment.controller");

// Middleware para parsear JSON en las solicitudes
app.use(bodyParser.json());

/**
 * Cron job para enviar pagos a los anfitriones
 * @param {string} period - Expresión cron para la periodicidad de ejecución
 */
exports.sendPaymentsToHosts = async (period) => {
    // Programar la tarea cron con la periodicidad indicada
    cron.schedule(period, async () => {
        console.log('⏱ Ejecutando pagos a anfitriones...');

        try {
            // Calcular fechas de inicio y fin (hoy y dentro de 3 días)
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const targetDate = new Date(today);
            targetDate.setDate(targetDate.getDate() + 3);

            const startOfDay = new Date(today);
            const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

            // Buscar reservas completadas cuyo check-in esté entre hoy y dentro de 3 días
            const bookings = await Booking.find({
                checkInDate: { $gte: startOfDay, $lte: endOfDay },
                status: 'completed'
            }).populate([
                {
                    path: 'payment',
                    match: { status: 'completed' }
                },
                {
                    path: 'guest'
                },
                {
                    path: 'property',
                    populate: {
                        path: 'host',
                    }
                }
            ]);

            // Procesar cada reserva encontrada
            for (const booking of bookings) {
                // Verificar que la reserva tenga un pago completado
                if (!booking.payment) {
                    console.warn(`❌ Reserva ${booking._id} no tiene un pago completado`);
                    continue;
                }

                // Calcular el importe neto para el anfitrión (descontando 20%)
                const gross = parseFloat(booking.totalPrice);
                const net = (gross - (gross * 0.2)).toFixed(2);

                // Preparar el payload para el pago al anfitrión
                const payload = {
                    items: [{
                        receiverEmail: booking.property.host.info.hostProfile.paypalEmail,
                        amount: net,
                        note: `Pago neto reserva #${booking._id}`,
                        senderItemId: booking._id.toString()
                    }]
                };

                try {
                    // Enviar el pago al anfitrión usando el controlador de pagos
                    const response = await PaymentController.sendPaymentToHost(payload);

                    if (response.success) {
                        // Actualizar el estado de la reserva y el pago si el pago fue exitoso
                        await Booking.findByIdAndUpdate(booking._id, { status: 'confirmed' });
                        await Payment.findByIdAndUpdate(booking.payment._id, { status: 'confirmed' });
                        console.log(`✅ Pago enviado y estados actualizados para la reserva ${booking._id}`);
                    } else {
                        // Avisar si el pago falló
                        console.warn(`⚠️ Falló el pago al anfitrión para la reserva ${booking._id}`);
                    }
                } catch (err) {
                    // Manejar errores en el proceso de pago individual
                    console.error(`❌ Error al procesar el pago para reserva ${booking._id}:`, err);
                }
            }

        } catch (err) {
            // Manejar errores generales del cron job
            console.error("❌ Error general en sendPaymentsToHosts:", err.message);
        }
    });
};
