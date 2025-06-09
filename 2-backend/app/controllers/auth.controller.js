// Importaciones y dependencias
const config = require('../config/config');
const User = require("../models").user;
const UserActivity = require("../models").userActivity;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auxFunc = require("../utils/auxiliary.functions");
const Logs = require('./logs.controller.js');
// const mailer = require("../plugins/email/mailer");

/**********************************************************/
/* FUNC: encryptPassword  
  Centraliza el encriptado de la contraseña en el backend.
  Recibe una contraseña y devuelve su hash.
*/
/**********************************************************/
function encryptPassword(password) {
  return bcrypt.hashSync(password, 8);
}

/**********************************************************/
/* FUNC: login  
  Comprueba que el usuario existe y la contraseña es válida.
  Genera y asigna un token JWT al usuario.
  Guarda la actividad del usuario y actualiza el historial de actividad.
  Devuelve los datos del usuario y el token.
*/
/**********************************************************/
async function login(req, res) {
  try {
   // Buscar usuario por email o username, incluyendo role y activity
   let buscaEmail = await auxFunc.findOneDB(
    User,
    { $or: [{ 'info.username': req.body.key }, { 'info.email': req.body.key }] },
    'role activity',
    "",
    ""
   );
   let passwordIsValid = false;

   // Comprobar existencia de usuario y validez de contraseña
   if (buscaEmail.data) {
    passwordIsValid = await bcrypt.compareSync(req.body.password, buscaEmail.data.info.password);
   }

   // Manejo de credenciales incorrectas
   if (!buscaEmail.data || !passwordIsValid) {
    return res.status(200).send({ message: "Las credenciales introducidas son incorrectas", code: 3000 });
   }
   // Manejo de cuenta bloqueada
   else if (!buscaEmail.data.info.status) {
    return res.status(200).send({ message: "Su cuenta ha sido bloqueada", code: 4000 });
   } else {
    // Generar token JWT (12 horas de duración)
    let token = jwt.sign({
      _id: buscaEmail.data._id,
      email: buscaEmail.data.info.email,
      name: buscaEmail.data.info.name,
      role: buscaEmail.data.role,
      acronym: config.acronym
    }, config.secret, { expiresIn: "12h" });

    // Guardar la IP en la colección de actividad del usuario
    const dataSchema = new UserActivity({
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
    });
    await auxFunc.saveDB(dataSchema, "", "");

    // Actualizar token y actividad en el usuario, mantener solo las últimas 5 actividades
    let userData = await User.findOneAndUpdate(
      { 'info.email': buscaEmail.data.info.email },
      {
       token: token,
       $push: { activity: { $each: [dataSchema], $slice: -5 } },
      },
      { new: true }
    ).populate('role activity');

    // Enviar respuesta al usuario
    if (userData) {
      Logs.postLog('SYSTEM ACCESS', `El usuario ${userData.info.name} ha iniciado sesion`, userData._id);
      return res.status(200).send(userData);
    } else {
      return res.status(500).send({ message: "Error al actualizar el token de usuario", code: 3000 });
    }
   }
  } catch (err) {
   console.error("User controller: login");
   console.error(err);
   return res.status(500).send({ message: "Ha ocurrido un error procesando su solicitud", code: 3000 });
  }
}

/**********************************************************/
/* FUNC: recoverPassword  
  Inicia el proceso de recuperación de contraseña.
  1. Comprueba que el email es obligatorio.
  2. Verifica que el email existe en el sistema.
  3. Genera un token de recuperación (1 hora).
  4. Guarda el token en la base de datos.
  5. (Opcional) Envía el correo de recuperación.
*/
/**********************************************************/
async function recoverPassword(req, res) {
  try {
   // 1. Comprobar que el email es obligatorio
   let email = req.body.email;
   if (email == null) {
    return res.status(400).send({ message: 'Parametro obligario email no recibido', code: 3000 });
   }
   // 2. Verificar que el email existe en el sistema
   let userDB = await auxFunc.findOneDB(User, { email: email }, '', "", "");
   if (!userDB.data) {
    return res.status(404).send({ message: 'Usuario no encontrado a partir del email', code: 3000 });
   } else if (userDB.success) {
    // 3. Generar token de recuperación (1 hora)
    let token = jwt.sign({ _id: userDB.data._id }, config.secret, { expiresIn: 3600 });
    // 4. Guardar el token en la base de datos
    await User.findByIdAndUpdate({ _id: userDB.data._id }, { recoveryToken: token });
    // 5. (Opcional) Enviar el correo de recuperación
    // await mailer.sendRecoveryEmail(email, token);
    return res.status(200).send({ message: "Instrucciones enviadas correctamente", code: 2000 });
   } else {
    return res.status(500).send({ message: "Error al buscar datos de usuario por email ", code: 3000 });
   }
  } catch (err) {
   console.error("Auth controller: recoverPassword " + err);
   return res.status(500).send({ message: "Ha ocurrido un error procesando su solicitud", code: 3000 });
  }
}

/**********************************************************/
/* FUNC: resetPassword  
  Realiza el reseteo de la contraseña usando el token de recuperación.
  1. Verifica que el token es válido y no está caducado.
  2. Comprueba que el token existe en la base de datos.
  3. Modifica la contraseña y elimina el token de recuperación.
*/
/**********************************************************/
async function resetPassword(req, res) {
  try {
   // Obtener datos de la petición
   const recoveryToken = req.body.recoveryToken;
   const encryptedPassword = encryptPassword(req.body.newpass);

   // 1. Verificar que el token es válido y no está caducado
   try {
    resultVerify = jwt.verify(recoveryToken, config.secret);
   } catch (err1) {
    return res.status(401).send({ message: 'Token inválido', code: 3000 });
   }

   // 2. Comprobar que el token existe en la base de datos
   let userDB = await auxFunc.findOneDB(User, { recoveryToken: recoveryToken }, '', "", "");
   if (!userDB.data) {
    return res.status(401).send({ message: 'Token no encontrado en el sistema', code: 3000 });
   } else if (userDB.success) {
    // 3. Modificar la contraseña y eliminar el token de recuperación
    await User.findByIdAndUpdate({ _id: userDB._id }, { password: encryptedPassword, recoveryToken: null });
    return res.status(200).send({ message: "Se ha restablecido la contraseña correctamente.", code: 2000 });
   } else {
    return res.status(500).send({ message: "Error al buscar datos de usuario por recoveryToken ", code: 3000 });
   }
  } catch (err2) {
   console.error("Auth controller: resetPassword");
   console.log(err2);
   return res.status(500).send({ message: "Ha ocurrido un error procesando su solicitud", code: 3000 });
  }
}

// Exportaciones de las funciones del controlador
module.exports = {
  login,
  recoverPassword,
  resetPassword,
  encryptPassword
};
