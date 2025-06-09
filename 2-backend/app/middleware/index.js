// Importa el middleware de autenticación
const auth = require("./auth");

// Exporta los middlewares para su uso en otras partes de la aplicación
module.exports = {
  auth
};