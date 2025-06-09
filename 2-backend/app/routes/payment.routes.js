// Importa middlewares y controladores necesarios
const { auth } = require("../middleware/index.js");
const PaymentController = require("../controllers/payment.controller.js");

// Obtiene la ruta base desde las variables de entorno
const basePath = process.env.API_URL_BASE_PATH;

// Inicializa el router de Express
let router = require("express").Router();

module.exports = app => {
  // Ruta para crear un nuevo pago
  router.post(
    "/create",
    [auth.verifyToken],
    function (res, req, next) { auth.authRoute(res, req, next, "RENTAL") },
    PaymentController.createPayment
  );

  // Ruta para actualizar un pago por bookingId
  router.put(
    "/:bookingId",
    [auth.verifyToken],
    function (res, req, next) { auth.authRoute(res, req, next, "RENTAL") },
    PaymentController.updatePaymentByBooking
  );

  // Ruta para reembolsar un pago
  router.post(
    "/refund",
    [auth.verifyToken],
    function (res, req, next) { auth.authRoute(res, req, next, "RENTAL") },
    PaymentController.refundPayment
  );

  // Asocia el router a la aplicación bajo la ruta base
  app.use(
    basePath + "/payments",
    router
  );
};