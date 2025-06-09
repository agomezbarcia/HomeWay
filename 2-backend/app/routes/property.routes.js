const { auth } = require("../middleware/index.js");
const propertycontroller = require("../controllers/property.controller.js");
const basePath = process.env.API_URL_BASE_PATH;
var router = require("express").Router();

module.exports = app => {

  // Obtener la lista de propiedades (requiere permiso PROPERTY_SEE)
  router.get(
    "/get",
    [auth.verifyToken, function (res, req, next) { auth.authRoute(res, req, next, "PROPERTY_SEE") }],
    propertycontroller.getProperties
  );

  // Obtener la lista de usuarios según el modo (requiere permiso PROPERTY_ADMIN)
  router.get(
    "/userlist/:mode",
    [auth.verifyToken, function (res, req, next) { auth.authRoute(res, req, next, "PROPERTY_ADMIN") }],
    propertycontroller.getUserList
  );

  // Crear una nueva explotación (requiere permiso PROPERTY_ADMIN)
  router.post(
    "/post",
    [auth.verifyToken, function (res, req, next) { auth.authRoute(res, req, next, "PROPERTY_ADMIN") }],
    propertycontroller.createProperty
  );

  // Modificar el detalle de una explotación (requiere permiso PROPERTY_ADMIN)
  router.put(
    "/update/:id",
    [auth.verifyToken, function (res, req, next) { auth.authRoute(res, req, next, "PROPERTY_ADMIN") }],
    propertycontroller.setProperty
  );

  // Actualizar las coordenadas de una explotación (requiere permiso PROPERTY_ADMIN)
  router.put(
    "/update/:id/coordinates",
    [auth.verifyToken, function (res, req, next) { auth.authRoute(res, req, next, "PROPERTY_ADMIN") }],
    propertycontroller.setPropertiesCoordinates
  );

  // Eliminar una explotación (requiere permiso PROPERTY_ADMIN)
  router.delete(
    "/delete/:id",
    [auth.verifyToken, function (res, req, next) { auth.authRoute(res, req, next, "PROPERTY_ADMIN") }],
    propertycontroller.deleteProperty
  );

  // Registrar las rutas bajo el path base
  app.use(basePath + "/properties", router);
};
