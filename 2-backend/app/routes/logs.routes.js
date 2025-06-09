// Importar middlewares y controladores
const { auth } = require("../middleware");
const LogsController = require("../controllers/logs.controller.js");

// Definir la ruta base a partir de variables de entorno
const basePath = process.env.API_URL_BASE_PATH;

// Crear el router de Express
let router = require("express").Router();

module.exports = app => {

  // ============================
  // ENDPOINTS para logs
  // ============================

  // Petición para obtener la lista de logs
  router.get(
    "/list",
    auth.verifyToken, // Verifica el token de autenticación
    function (res, req, next) { 
      auth.authRoute(res, req, next, "PANEL_ADMIN"); // Verifica permisos de administrador
    },
    LogsController.getLogsList // Controlador que obtiene la lista de logs
  );

  // Registrar las rutas bajo el path base
  app.use(
    basePath + "/logs",
    router
  );
};