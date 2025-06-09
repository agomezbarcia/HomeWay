// Importa el controlador de emails
const EmailController = require("../controllers/email.controller.js");

// Obtiene la ruta base de la API desde las variables de entorno
const basePath = process.env.API_URL_BASE_PATH;

// Crea una nueva instancia de router de Express
let router = require("express").Router();

module.exports = app => {
  // Define la ruta POST para enviar emails
  router.post("/sendEmail", EmailController.sendEmail);

  // Usa el router bajo la ruta base especificada para mailer
  app.use(
    basePath + "/mailer",
    router
  );
};