const { auth } = require("../middleware/index.js");
const Bookings = require("../controllers/bookings.controller.js");
const basePath = process.env.API_URL_BASE_PATH;
var router = require("express").Router();

module.exports = app => {
  // ===========================
  // Middleware de autenticación
  // ===========================
  // Todas las rutas usan auth.verifyToken y auth.authRoute para permisos

  // ===========================
  // Rutas de reservas
  // ===========================

  // Lista todas las reservas de un usuario
  router.get(
    "/user/:userId",
    [auth.verifyToken],
    function (req, res, next) { auth.authRoute(req, res, next, "BOOKINGS_SEE"); },
    Bookings.getBookingsByUser
  );

  // Lista todas las reservas de una propiedad
  router.get(
    "/property/:propertyId",
    [auth.verifyToken],
    function (req, res, next) { auth.authRoute(req, res, next, "BOOKINGS_SEE"); },
    Bookings.getBookingsByProperty
  );

  // Lista todas las reservas de un anfitrión
  router.get(
    "/host/:hostId",
    [auth.verifyToken],
    function (req, res, next) { auth.authRoute(req, res, next, "BOOKINGS_SEE"); },
    Bookings.getBookingsByHost
  );

  // Lista todas las reservas (admin)
  router.get(
    "/",
    [auth.verifyToken],
    function (req, res, next) { auth.authRoute(req, res, next, "BOOKINGS_ADMIN"); },
    Bookings.getAllBookings
  );

  // Crea una nueva reserva
  router.post(
    "/",
    [auth.verifyToken],
    function (req, res, next) { auth.authRoute(req, res, next, "RENTAL"); },
    Bookings.createBooking
  );

  // Actualiza una reserva existente
  router.put(
    "/:bookingId",
    [auth.verifyToken],
    function (req, res, next) { auth.authRoute(req, res, next, "RENTAL"); },
    Bookings.updateBooking
  );

  // ===========================
  // Registro del router en la app
  // ===========================
  app.use(basePath + "/bookings", router);
};