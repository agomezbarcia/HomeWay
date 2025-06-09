// Importa middlewares y controladores necesarios
const { auth } = require("../middleware/index.js");
const Reviews = require("../controllers/reviews.controller.js");

// Obtiene la ruta base de la API desde las variables de entorno
const basePath = process.env.API_URL_BASE_PATH;

// Crea un nuevo router de Express
var router = require("express").Router();

module.exports = app => {
  // Ruta: Obtiene todos los comentarios
  router.get(
    "/",
    [auth.verifyToken],
    function (res, req, next) { auth.authRoute(res, req, next, "RENTAL") },
    Reviews.getAllReviews
  );

  // Ruta: Agrega un comentario a una reserva
  router.post(
    "/comment",
    [auth.verifyToken],
    function (res, req, next) { auth.authRoute(res, req, next, "RENTAL") },
    Reviews.addComment
  );

  // Ruta: Elimina un comentario
  router.delete(
    "/comment/:id",
    [auth.verifyToken],
    function (res, req, next) { auth.authRoute(res, req, next, "RENTAL") },
    Reviews.deleteComment
  );

  // Usa el router bajo la ruta base especificada
  app.use(basePath + "/reviews", router);
};