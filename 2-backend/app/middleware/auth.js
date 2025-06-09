/* IMPORTACIONES */
/*****************/
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const roles = require('../config/constans/user.roles');
const User = require("../models").user;
const DeviceSpec = require("../models").deviceSpec;
const auxFunc = require("../utils/auxiliary.functions");
const ROLE_ID_ADMIN = require("../config/constans/user.roles").roleIdAdmin;

/**
 * Middleware para verificar el token JWT.
 * 1. Verifica que el token sea válido y no esté caducado.
 * 2. Verifica que el token exista en la base de datos.
 * Si es válido, añade el usuario autenticado a res.locals.tokenedUser.
 */
verifyToken = async (req, res, next) => {
  let token = req.headers["x-access-token"];
  let resultVerify = null;

  // 1. Verificar que el token es válido y no está caducado.
  try {
    resultVerify = jwt.verify(token, config.secret);
  } catch (error) {
    return res.status(401).send({
      message: 'Token inválido',
      code: 3000
    });
  }

  // 2. Verificar que el token existe en la base de datos.
  let userDB = await User.findById(resultVerify._id).populate('role');
  if (userDB == null || token != userDB.token) {
    return res.status(401).send({
      message: 'Su token no corresponde a ningún usuario',
      code: 3000
    });
  } else {
    // Token válido, guardar usuario autenticado en res.locals
    res.locals.tokenedUser = userDB;
  }

  // Continuar al siguiente middleware
  return next();
};

/**
 * Middleware para comprobar si el usuario está intentando modificarse a sí mismo.
 * Permite la acción solo si el usuario autenticado coincide con el id solicitado.
 */
isModifyingSelf = async (req, res, next) => {
  let user = res.locals.tokenedUser;
  let requestedUser = req.params.id;

  if (user._id.toString().toLowerCase() == requestedUser.toString().toLowerCase()) {
    return next();
  } else {
    return res.status(401).send({
      message: "No dispone de los permisos necesarios para modificar otros usuarios",
      code: 2000
    });
  }
};

/**
 * Middleware para verificar si el usuario tiene acceso a la ruta deseada.
 * Permite acceso si el usuario es administrador o tiene la acción permitida.
 * También permite que el usuario se modifique a sí mismo si tiene el permiso USER_SELF.
 */
authRoute = async (req, res, next, allowedActions) => {
  // Usuario autenticado
  const tokenedUser = res.locals.tokenedUser;

  // Permitir acceso si es administrador
  if (tokenedUser.role != null && tokenedUser.role._id.toString() == ROLE_ID_ADMIN.toString()) {
    return next();
  }

  // Permitir acceso si tiene la acción permitida
  if ((tokenedUser.role.actions).includes(allowedActions)) {
    return next();
  } else {
    // Permitir si el usuario se modifica a sí mismo y tiene permiso USER_SELF
    if (req.params.id == tokenedUser._id && (tokenedUser.role.actions).includes("USER_SELF")) {
      return next();
    } else {
      // Usuario sin permisos
      return res.status(200).send({
        message: "Error: no se tienen permisos necesarios",
        code: 3000
      });
    }
  }
};

/**
 * Middleware para prevenir modificaciones no autorizadas en dispositivos.
 * Permite la acción si el usuario es ADMIN o PANEL_ADMIN.
 * Si no, mantiene ciertos campos del dispositivo sin modificar.
 */
preventModification = async (req, res, next) => {
  let token = req.headers["x-access-token"];
  let resultVerify = null;

  // Verificar token
  try {
    resultVerify = jwt.verify(token, config.secret);
  } catch (error) {
    return res.status(401).send({
      message: 'Token inválido',
      code: 3000
    });
  }

  // Buscar usuario y verificar rol
  let userDB = await User.findById(resultVerify._id).populate('role');

  if (userDB.role.actions.includes('ADMIN') || userDB.role.actions.includes('PANEL_ADMIN')) {
    next();
  } else {
    // Mantener ciertos campos del dispositivo sin modificar
    let updateDevice = await auxFunc.findOneDB(DeviceSpec, { _id: req.body._id });
    if (updateDevice.data && updateDevice.data.aditionalInfo) {
      req.body.aditionalInfo.doteAnual = updateDevice.data.aditionalInfo.doteAnual ? updateDevice.data.aditionalInfo.doteAnual : null;
    }
    next();
  }
};

/** EXPORTACIONES PÚBLICAS **/
/***************************/
module.exports = {
  verifyToken,
  isModifyingSelf,
  authRoute,
  preventModification
};
