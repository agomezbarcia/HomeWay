// Importación de modelos y librerías necesarias
const Payments = require('../models/').payments;
const payoutsSdk = require('@paypal/payouts-sdk');
const axios = require('axios');
const auxFunc = require("../utils/auxiliary.functions");

// ====================
// Cliente de PayPal
// ====================
function payoutsClient() {
  // Obtiene las credenciales de PayPal desde variables de entorno
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  // Configura el entorno de PayPal (Sandbox)
  const environment = new payoutsSdk.core.SandboxEnvironment(clientId, clientSecret);
  return new payoutsSdk.core.PayPalHttpClient(environment);
}

// ====================
// Crear un nuevo pago
// ====================
exports.createPayment = (req, res) => {
  new Promise(async (resolve, reject) => {
    try {
      // Crea una nueva instancia de pago con los datos recibidos
      const paymentData = new Payments(req.body);

      if (!paymentData) {
        return reject({
          status: 403,
          body: { message: "Error creating payment.", code: 3000 }
        });
      }

      // Guarda el pago en la base de datos
      await paymentData.save();

      resolve({
        status: 200,
        body: {
          message: "Pago creado correctamente",
          code: 2001,
          paymentId: paymentData._id,
          status: paymentData.status,
        }
      });

    } catch (error) {
      console.error("Error creating payment:", error);
      reject({
        status: 403,
        body: { message: "Internal server error.", code: 3000 }
      });
    }
  })
    .then(result => res.status(result.status).send(result.body))
    .catch(err => res.status(err.status).send(err.body));
};

// ====================
// Actualizar pago por Booking
// ====================
exports.updatePaymentByBooking = async (req, res) => {
  try {
    // Obtiene el ID de la reserva y los datos a actualizar
    const bookingId = req.params.bookingId;
    const data = req.body;

    // Actualiza el pago correspondiente en la base de datos
    const payment = await auxFunc.updateOneDB(Payments, { booking: bookingId }, data, "", "");
    if (!payment) {
      return res.status(403).send({ message: "Error updating payment." });
    }
    res.status(200).send({ message: "Pago actualizada correctamente." });
  }
  catch (error) {
    console.error("Error updating payment:", error);
    res.status(403).send({ message: "Internal server error.", code: 3000 });
  }
}

// ====================
// Enviar pago al anfitrión (Payout)
// ====================
exports.sendPaymentToHost = async (data) => {
  const { items } = data;

  // Valida que la lista de items sea válida
  if (!Array.isArray(items) || items.length === 0) {
    return { success: false, error: 'Debes enviar una lista de items válidos.' };
  }

  // Genera un ID de lote único
  const batchId = `batch_${Date.now()}`;

  // Construye el cuerpo de la solicitud para el payout
  const requestBody = {
    sender_batch_header: {
      sender_batch_id: batchId,
      email_subject: 'Tu pago de anfitrión',
    },
    items: items.map(i => ({
      recipient_type: 'EMAIL',
      amount: {
        value: i.amount,
        currency: 'EUR'
      },
      receiver: i.receiverEmail,
      note: i.note || 'Gracias por hospedar con nosotros.',
      sender_item_id: i.senderItemId
    }))
  };

  try {
    // Realiza la solicitud de payout a PayPal
    const request = new payoutsSdk.payouts.PayoutsPostRequest();
    request.requestBody(requestBody);
    const response = await payoutsClient().execute(request);

    console.log("Payout response:", response);

    return {
      success: true,
      batchId: response.result.batch_header.payout_batch_id,
      time: response.result.batch_header.time_created
    };

  } catch (err) {
    console.error("❌ Error al enviar el payout:", err.response?.data || err.message);
    return {
      success: false,
      error: err.response?.data || err.message
    };
  }
};

// ====================
// Reembolsar un pago
// ====================
exports.refundPayment = async (req, res) => {
  // Obtiene las credenciales de PayPal desde variables de entorno
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  // Obtiene el ID de la transacción y el monto a reembolsar
  const transactionId = req.body.transactionId;
  const amount = req.body.amount;

  try {
    // Obtener accessToken de PayPal
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const tokenRes = await axios.post(
      'https://api-m.sandbox.paypal.com/v1/oauth2/token',
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${basicAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const accessToken = tokenRes.data.access_token;

    // Consulta el estado de la transacción
    const captureRes = await axios.get(
      `https://api-m.sandbox.paypal.com/v2/payments/captures/${transactionId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        }
      }
    );

    // Verifica si la transacción está completada antes de reembolsar
    if (captureRes.data.status !== 'COMPLETED') {
      return res.status(400).send({ code: 3000, message: 'La transacción no está completada, no se puede reembolsar.' });
    }

    // Ejecuta el reembolso
    const refundRes = await axios.post(
      `https://api-m.sandbox.paypal.com/v2/payments/captures/${transactionId}/refund`,
      { amount: { value: amount, currency_code: 'EUR' } },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.send({ code: 2000, message: 'Reembolso completado', refund: refundRes.data });
  } catch (err) {
    console.error('Error al hacer reembolso:', err.response?.data || err.message);
    res.status(500).send({ code: 3000, message: 'Error al procesar el reembolso' });
  }
};
