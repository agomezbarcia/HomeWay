// Importa middlewares y controladores necesarios
const { auth } = require("../middleware/index.js");
const Amenities = require("../controllers/amenities.controller.js");

// Obtiene la ruta base de la API desde las variables de entorno
const basePath = process.env.API_URL_BASE_PATH;

// Crea un nuevo router de Express
var router = require("express").Router();

module.exports = app => {
  // Ruta: Lista todos los servicios (amenities)
  // Middleware: Verifica el token y los permisos antes de acceder al controlador
  router.get(
    "/",
    [auth.verifyToken],
    function (res, req, next) { auth.authRoute(res, req, next, "BOOKINGS_SEE") },
    Amenities.getAllAmenities
  );

  // Usa el router bajo la ruta base especificada
  app.use(basePath + "/amenities", router);
};