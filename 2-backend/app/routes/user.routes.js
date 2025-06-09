const { auth } = require("../middleware");
const user = require("../controllers/user.controller.js");
const basePath = process.env.API_URL_BASE_PATH;
let router = require("express").Router();

module.exports = app => {

  // ============================
  // 1. ENDPOINTS PÚBLICOS
  // ============================

  // Crear nueva cuenta pública (sin token)
  router.post("/register", user.newAccount);

  // Confirmar cuenta pública (sin token)
  router.get("/confirm/:id", user.confirmAccount);

  // ============================
  // 2. ENDPOINTS DE USUARIOS
  // ============================

  // Obtener todos los usuarios
  router.get(
    "/data",
    [auth.verifyToken, function (res, req, next) { auth.authRoute(res, req, next, "USER_SEE") }],
    user.findAll
  );

  // Obtener datos de usuario por id
  router.get(
    "/data/:id",
    [auth.verifyToken, function (res, req, next) { auth.authRoute(res, req, next, "USER_SEE") }],
    user.findById
  );

  // Obtener nombre y email de host por id
  router.get(
    "/host/data/:id",
    [auth.verifyToken, function (res, req, next) { auth.authRoute(res, req, next, "PROPERTY_SEE") }],
    user.getNameAndEmail
  );

  // Crear nueva cuenta por un administrador
  router.post(
    "/create",
    [auth.verifyToken, function (res, req, next) { auth.authRoute(res, req, next, "USER_ADMIN") }],
    user.newAccount
  );

  // Actualizar datos del usuario
  router.post(
    "/data/:id",
    [auth.verifyToken, function (res, req, next) { auth.authRoute(res, req, next, "USER_ADMIN") }],
    user.update
  );

  // Eliminar un usuario por id
  router.delete(
    "/data/:id",
    [auth.verifyToken, function (res, req, next) { auth.authRoute(res, req, next, "USER_ADMIN") }],
    user.delete
  );

  // Obtener lista de usuarios filtrados
  router.get(
    "/list",
    auth.verifyToken,
    function (res, req, next) { auth.authRoute(res, req, next, "USER_SEE") },
    user.getUserList
  );

  // ============================
  // 3. ENDPOINTS DE ROLES
  // ============================

  // Obtener toda la lista de roles
  router.get("/roles", user.getAllRoles);

  // Crear un rol
  router.post(
    "/roles",
    [auth.verifyToken, function (res, req, next) { auth.authRoute(res, req, next, "USER_ADMIN") }],
    user.createRole
  );

  // Editar rol
  router.put(
    "/roles/:id",
    [auth.verifyToken, function (res, req, next) { auth.authRoute(res, req, next, "USER_ADMIN") }],
    user.updateRole
  );

  // Eliminar rol
  router.delete(
    "/roles/:id",
    [auth.verifyToken, function (res, req, next) { auth.authRoute(res, req, next, "USER_ADMIN") }],
    user.deleteRole
  );

  // ============================
  // 4. OTRAS UTILIDADES
  // ============================

  // Obtener las secciones del proyecto
  router.get(
    "/sections",
    [auth.verifyToken, function (res, req, next) { auth.authRoute(res, req, next, "USER_SEE") }],
    user.getSections
  );

  // ============================
  // 5. REGISTRO DEL ROUTER
  // ============================

  app.use(
    basePath + "/user",
    router
  );
};
