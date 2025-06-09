// Importar el controlador de autenticación
const auth = require("../controllers/auth.controller.js");

// Obtener la ruta base de la API desde las variables de entorno
const basePath = process.env.API_URL_BASE_PATH;

// Crear un nuevo router de Express
let router = require("express").Router();

module.exports = app => {
  // Ruta para iniciar sesión
  router.post("/login", auth.login);

  // Ruta para solicitar recuperación de contraseña
  router.post("/recover", auth.recoverPassword);

  // Ruta para restablecer la contraseña
  router.post("/reset", auth.resetPassword);

  // Usar el router bajo la ruta base + /auth
  app.use(
    basePath + "/auth",
    router
  );
};
