// Importaciones y constantes
const User = require("../models/").user;
const Role = require("../models/").roles;
const ROLES = require("../config/constans/user.roles").roles;
const ROLE_ID_ADMIN = require("../config/constans/user.roles").roleIdAdmin;
const { user } = require("../models/");
const auxFunc = require("../utils/auxiliary.functions");
const authContr = require('./auth.controller');
const ACRONYM = require("../config/config").acronym;
const SECTIONS = require("../config/constans/sections").getSectionsByAcronym(ACRONYM);
const Logs = require('./logs.controller.js');

// ===================== FUNCIONES AUXILIARES =====================

/**
 * Valida el formato y letra del DNI español.
 * @param {string} dni 
 * @returns {boolean}
 */
const validarDNI = (dni) => {
  const letras = 'TRWAGMYFPDXBNJZSQVHLCKE';
  const formatoValido = /^(\d{8})([A-HJ-NP-TV-Z])$/i.test(dni);
  if (!formatoValido) return false;
  const numero = dni.substr(0, 8);
  const letra = dni.substr(8, 1).toUpperCase();
  const letraCalculada = letras[numero % 23];
  return letra === letraCalculada;
};

// ===================== CONTROLADORES DE USUARIO =====================

/**
 * Confirma la cuenta de un usuario activando su estado.
 */
exports.confirmAccount = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).send({ message: "Token no proporcionado", code: 3000 });
    }
    const user = await auxFunc.findOneDB(User, { _id: id });
    if (!user.success || !user.data) {
      return res.status(404).send({ message: "Usuario no encontrado", code: 3000 });
    }
    user.data.info.status = true;
    await auxFunc.updateOneDB(
      User,
      { _id: user.data._id },
      { $set: { info: user.data.info } }
    );
    return res.redirect("http://localhost/login");
  } catch (err) {
    console.error("User controller: confirmAccount", err);
    return res.status(403).send({ message: "Ha ocurrido un error procesando su solicitud", code: 3000 });
  }
};

/**
 * Crea una nueva cuenta de usuario, validando campos y roles.
 */
exports.newAccount = async (req, res) => {
  try {
    // Validación de campos obligatorios base
    const requiredFields = ['name', 'username', 'email', 'password'];
    const missingFields = requiredFields.filter(field => !req.body.info?.[field]);
    if (missingFields.length > 0) {
      return res.status(400).send({
        message: `Faltan campos obligatorios: ${missingFields.join(', ')}`,
        code: 3000
      });
    }

    // Validación específica para anfitriones
    if (req.body.info.isHost) {
      const hostValidation = [];
      if (!req.body.info.hostProfile?.paypalEmail) {
        hostValidation.push('Email de PayPal es requerido');
      }
      if (!req.body.info.hostProfile?.phoneNumber) {
        hostValidation.push('Teléfono es requerido');
      }
      if (!req.body.info.hostProfile?.governmentId) {
        hostValidation.push('DNI es requerido');
      }
      if (req.body.info.hostProfile?.phoneNumber && !/\d{9,15}/.test(req.body.info.hostProfile.phoneNumber)) {
        hostValidation.push('Teléfono inválido');
      }
      if (req.body.info.hostProfile?.governmentId) {
        if (!validarDNI(req.body.info.hostProfile.governmentId)) {
          hostValidation.push('DNI inválido: Formato incorrecto o letra no válida');
        }
      }
      if (hostValidation.length > 0) {
        return res.status(400).send({
          message: `Errores en perfil de anfitrión: ${hostValidation.join(', ')}`,
          code: 3000
        });
      }
    }

    // Construcción del objeto de usuario
    const userData = {
      role: req.body.role,
      info: {
        ...req.body.info,
        password: authContr.encryptPassword(req.body.info.password),
        email: req.body.info.email.toLowerCase(),
        status: req.body.info.status ?? true,
        isHost: req.body.info.isHost || false
      }
    };

    // Inicialización de hostProfile si es anfitrión
    if (userData.info.isHost) {
      userData.info.hostProfile = {
        paypalEmail: req.body.info.hostProfile?.paypalEmail || '',
        bio: req.body.info.hostProfile?.bio || '',
        phoneNumber: req.body.info.hostProfile?.phoneNumber || '',
        governmentId: req.body.info.hostProfile?.governmentId || ''
      };
    } else {
      userData.info.hostProfile = undefined;
    }

    const dataSchema = new User(userData);

    try {
      await dataSchema.save();
      const newUserId = dataSchema._id;
      if (res.locals.tokenedUser && res.locals.tokenedUser.info) {
        Logs.postLog(
          'CREATE USER',
          `El usuario ${res.locals.tokenedUser.info.name} ha creado un nuevo ${req.body.info.isHost ? 'anfitrión' : 'huésped'}`,
          res.locals.tokenedUser._id
        );
      }
      return res.status(200).send({
        message: "Usuario creado correctamente",
        code: 2000,
        userId: newUserId
      });
    } catch (error) {
      let errorMessage = 'Error al crear la cuenta '+ error.message;
      if (error.code === 11000) {
        const key = Object.keys(error.keyPattern)[0];
        errorMessage = `El ${key.includes('email') ? 'email' :
          key.includes('username') ? 'nombre de usuario' :
            'documento de identidad'} ya está registrado`;
      }
      return res.status(400).send({
        message: errorMessage,
        code: 3000
      });
    }
  } catch (err) {
    console.error("User controller: newAccount", err);
    return res.status(403).send({
      message: "Ha ocurrido un error procesando su solicitud",
      code: 3000
    });
  }
};

/**
 * Actualiza los datos de un usuario, validando campos y roles.
 */
exports.update = async (req, res) => {
  try {
    const targetId = req.params.id;
    const userdata = req.body.data;
    const targetUser = await auxFunc.findOneDB(User, { _id: targetId });

    if (!targetUser.success || !targetUser.data) {
      return res.status(404).send({ message: "Usuario no encontrado", code: 3000 });
    }

    // Determinar si es anfitrión
    const isHost = userdata.info.isHost !== undefined 
      ? userdata.info.isHost 
      : targetUser.data.info.isHost;

    // Validaciones para anfitriones
    const hostValidation = [];
    if (isHost) {
      const hostProfile = userdata.info.hostProfile || {};
      const existingHostProfile = targetUser.data.info.hostProfile || {};
      if (!hostProfile.phoneNumber && !existingHostProfile.phoneNumber) {
        hostValidation.push('Teléfono es requerido');
      } else if (hostProfile.phoneNumber && !/\d{9,15}/.test(hostProfile.phoneNumber)) {
        hostValidation.push('Teléfono inválido');
      }
      if (!hostProfile.governmentId && !existingHostProfile.governmentId) {
        hostValidation.push('DNI es requerido');
      } else if (hostProfile.governmentId && !validarDNI(hostProfile.governmentId)) {
        hostValidation.push('DNI inválido');
      }
    }
    if (hostValidation.length > 0) {
      return res.status(400).send({
        message: `Errores en perfil de anfitrión: ${hostValidation.join(', ')}`,
        code: 3000
      });
    }

    // Construir objeto de actualización
    const updateData = {
      role: userdata.role || targetUser.data.role,
      info: {
        email: userdata.info.email || targetUser.data.info.email,
        name: userdata.info.name || targetUser.data.info.name,
        surname: userdata.info.surname || targetUser.data.info.surname,
        username: targetUser.data.info.username, // Username no se modifica
        status: userdata.info.status !== undefined 
          ? userdata.info.status 
          : targetUser.data.info.status,
        password: userdata.info.password 
          ? authContr.encryptPassword(userdata.info.password)
          : targetUser.data.info.password,
        csocio: userdata.info.csocio !== undefined 
          ? userdata.info.csocio 
          : targetUser.data.info.csocio,
        isHost: isHost
      }
    };

    // Manejar hostProfile
    if (isHost) {
      updateData.info.hostProfile = {
        paypalEmail: userdata.info.hostProfile?.paypalEmail
          || targetUser.data.info.hostProfile?.paypalEmail
          || '',
        phoneNumber: userdata.info.hostProfile?.phoneNumber 
          || targetUser.data.info.hostProfile?.phoneNumber 
          || '',
        governmentId: userdata.info.hostProfile?.governmentId 
          || targetUser.data.info.hostProfile?.governmentId 
          || '',
        bio: userdata.info.hostProfile?.bio 
          || targetUser.data.info.hostProfile?.bio 
          || ''
      };
    } else {
      updateData.info.hostProfile = undefined;
    }

    // Actualizar en base de datos
    const actualizaUser = await auxFunc.updateOneDB(
      User, 
      { _id: targetId },
      { $set: updateData },
      "Usuario actualizado",
      "Error al actualizar usuario"
    );

    if (actualizaUser.success) {
      Logs.postLog(
        'MODIFY USER', 
        `El usuario ${res.locals.tokenedUser.info.name} ha modificado un usuario`,
        res.locals.tokenedUser._id
      );
      return res.status(200).send({ 
        message: "Datos actualizados correctamente", 
        code: 2000 
      });
    }
    return res.status(400).send({ 
      message: "Error actualizando los datos del usuario", 
      code: 3000 
    });
  } catch (err) {
    console.error("User controller: update - Error:", err);
    return res.status(403).send({ 
      message: "Ha ocurrido un error procesando su solicitud", 
      code: 3000 
    });
  }
};

/**
 * Busca y devuelve los datos de un usuario por su ID.
 */
exports.findById = async (req, res) => {
  try {
    let buscarUser = await auxFunc.findOneDB(User, { _id: req.params.id }, 'role activity', "", "");
    if (buscarUser.success && buscarUser.data) {
      return res.status(200).send(buscarUser.data);
    } else if (buscarUser.success) {
      return res.status(400).send({ message: "El ID introducido no existe", code: 3000 });
    } else {
      return res.status(400).send({ message: "Error al buscar datos del usuario", code: 3000 });
    }
  } catch (err) {
    console.error("User controller: findById")
    console.error(err);
    return res.status(403).send({ message: "Ha ocurrido un error procesando su solicitud", code: 3000 });
  }
};

/**
 * Devuelve el nombre, email y paypalEmail de un usuario por su ID.
 */
exports.getNameAndEmail = async (req, res) => {
  try {
    let buscarUser = await auxFunc.findOneDB(User, { _id: req.params.id }, 'info', "", "");
    if (buscarUser.success && buscarUser.data) {
      const { name, email } = buscarUser.data.info;
      const paypalEmail = buscarUser.data.info.hostProfile.paypalEmail;
      return res.status(200).send({ _id:req.params.id, name, email, paypalEmail });
    } else if (buscarUser.success) {
      return res.status(403).send({ message: "El ID introducido no existe", code: 3000 });
    } else {
      return res.status(403).send({ message: "Error al buscar datos del usuario", code: 3000 });
    }
  }
  catch (err) {
    console.error("User controller: getNameAndEmail")
    console.error(err);
    return res.status(403).send({ message: "Ha ocurrido un error procesando su solicitud", code: 3000 });
  }
};

/**
 * Busca y devuelve todos los usuarios de la base de datos.
 */
exports.findAll = async (req, res) => {
  try {
    let buscaTodos = await auxFunc.findExtended(User, {}, 'role');
    if (buscaTodos.success) {
      return res.status(200).send(buscaTodos.data);
    } else {
      return res.status(400).send({ message: "Error al buscar todos los usuarios", code: 3000 });
    }
  } catch (err) {
    console.error("User controller: findAll")
    console.error(err);
    return res.status(403).send({ message: "Ha ocurrido un error procesando su solicitud", code: 3000 });
  }
};

/**
 * Elimina un usuario por su ID.
 */
exports.delete = async (req, res) => {
  try {
    let usuarioEliminar = await auxFunc.findOneDB(User, { _id: req.params.id });
    let eliminaUsuario = await auxFunc.delDB(User, { _id: req.params.id }, "", "");
    if (eliminaUsuario.success) {
      Logs.postLog('DELETE USER', `El usuario ${res.locals.tokenedUser.info.name} ha eliminado un usuario`, res.locals.tokenedUser._id);
      return res.status(200).send({ message: "El usuario ha sido eliminado correctamente", code: 2000 });
    } else {
      return res.status(400).send({ message: "Error al eliminar el usuario", code: 3000 });
    }
  } catch (err) {
    console.error("User controller: delete")
    console.error(err);
    return res.status(403).send({ message: "Ha ocurrido un error procesando su solicitud", code: 3000 });
  }
};

// ===================== CONTROLADORES DE ROLES =====================

/**
 * Obtiene todos los roles de la base de datos.
 */
exports.getAllRoles = async (req, res) => {
  try {
    let buscaTodosRoles = await auxFunc.findDB(Role, {}, "", "");
    if (buscaTodosRoles.success) {
      return res.status(200).send(buscaTodosRoles.data);
    } else {
      return res.status(400).send({ message: "Error al buscar todos los roles", code: 3000 });
    }
  } catch (err) {
    console.error("User controller: getAllRoles")
    console.error(err);
    return res.status(403).send({ message: "Ha ocurrido un error procesando su solicitud", code: 3000 });
  }
};

/**
 * Crea un nuevo rol en la base de datos.
 */
exports.createRole = async (req, res) => {
  try {
    let alias = req.body.alias;
    let actions = req.body.actions;
    let buscaAlias = await auxFunc.findOneDB(Role, { alias: alias }, '', "", "Error al buscar duplicados de alias");
    if (buscaAlias.success) {
      if (buscaAlias.data) {
        return res.status(400).send({ message: "El alias indicado ya existe", code: 3000 })
      } else {
        let newRole = new Role({ alias: alias, actions: actions });
        let guardaRol = await auxFunc.saveDB(newRole, "", "")
        if (guardaRol.success) {
          Logs.postLog('CREATE ROLE', `El usuario ${res.locals.tokenedUser.info.name} ha creado un nuevo rol`, res.locals.tokenedUser._id);
          return res.status(200).send({ message: "Rol almacenado correctamente", ack: newRole, code: 2000 })
        } else {
          return res.status(400).send({ message: "Ha ocurrido un error guardando los cambios en el rol", code: 3000 })
        }
      }
    } else {
      console.error("Error buscando duplicados de alias para la creación de roles")
      console.error(buscaAlias.message)
      return res.status(400).send({ message: "Error buscando duplicados de alias para la creación de roles", code: 3000 })
    }
  } catch (err) {
    console.error("User controller: createRole")
    console.error(err);
    return res.status(403).send({ message: "Ha ocurrido un error procesando su solicitud", code: 3000 });
  }
};

/**
 * Actualiza un rol existente en la base de datos.
 */
exports.updateRole = async (req, res) => {
  try {
    let roleId = req.params.id;
    let alias = req.body.alias;
    let actions = req.body.actions;
    let buscaAlias = await auxFunc.findOneDB(Role, { alias: alias, _id: { $ne: roleId } }, '', "", "Error al buscar duplicados de alias");
    if (buscaAlias.success) {
      if (buscaAlias.data) {
        return res.status(200).send({ message: "El alias indicado ya existe", code: 3001 })
      } else {
        let dataToUpdate = { alias: alias, actions: actions }
        let editaRol = await auxFunc.updateOneDB(Role, { _id: roleId }, dataToUpdate, "", "")
        if (editaRol.success) {
          Logs.postLog('MODIFY ROLE', `El usuario ${res.locals.tokenedUser.info.name} ha modificado un rol`, res.locals.tokenedUser._id);
          return res.status(200).send({ message: "Rol editado correctamente", code: 2000 })
        } else {
          return res.status(403).send({ message: "Ha ocurrido un error guardando los cambios en el rol", code: 3000 })
        }
      }
    } else {
      console.error("Error buscando duplicados de alias para la edición de roles")
      console.error(buscaAlias.message)
      return res.status(403).send({ message: "Error buscando duplicados de alias para la edición de roles", code: 3000 })
    }
  } catch (err) {
    console.error("User controller: updateRole")
    console.error(err);
    return res.status(403).send({ message: "Ha ocurrido un error procesando su solicitud", code: 3000 });
  }
};

/**
 * Elimina un rol de la base de datos, reasignando usuarios si es necesario.
 */
exports.deleteRole = async (req, res) => {
  try {
    let roleId = req.params.id;
    let buscaRol = await auxFunc.findOneDB(Role, { _id: roleId })
    if (buscaRol.success) {
      // El rol admin no puede ser borrado
      if (buscaRol.data && (buscaRol.data._id.toString() == ROLE_ID_ADMIN.toString() || buscaRol.data._id.toString() == ROLES[1]._id.toString())) {
        return res.status(400).send({ message: `No se puede borrar el rol ${buscaRol.data.alias}`, code: 3000 })
      } else if (!buscaRol.data) {
        return res.status(400).send({ message: "No se ha encontrado el rol indicado", code: 2000 })
      } else {
        // Cambiar roles de usuarios al rol por defecto
        let buscaUsers = await auxFunc.findDB(User, { role: roleId });
        if (buscaUsers.success && buscaUsers.data) {
          for (let i = 0; i < buscaUsers.data.length; i++) {
            await auxFunc.updateOneDB(User, { _id: buscaUsers.data[i]._id }, { role: ROLES[1]._id })
          }
        }
        let borraRol = await auxFunc.delOneDB(Role, { _id: roleId }, "", "")
        if (borraRol.success) {
          Logs.postLog('DELETE ROLE', `El usuario ${res.locals.tokenedUser.info.name} ha eliminado un rol`, res.locals.tokenedUser._id);
          return res.status(200).send({ message: "Rol eliminado correctamente", code: 2000 })
        } else {
          return res.status(400).send({ message: "Ha ocurrido un error eliminando el rol indicado", code: 3000 })
        }
      }
    } else {
      console.error("Error recuperando información del rol para su borrado")
      return res.status(400).send({ message: "Error recuperando información del rol para su borrado", code: 3000 })
    }
  } catch (err) {
    console.error("User controller: deleteRole")
    console.error(err);
    return res.status(403).send({ message: "Ha ocurrido un error procesando su solicitud", code: 3000 });
  }
};

// ===================== CONTROLADORES DE SECCIONES Y LISTADOS =====================

/**
 * Devuelve la información de las secciones del proyecto.
 */
exports.getSections = async (req, res) => {
  try {
    return res.status(200).send(SECTIONS);
  } catch (err) {
    console.error("User controller: getSections")
    console.error(err);
    return res.status(403).send({ message: "Ha ocurrido un error procesando su solicitud", code: 3000 });
  }
};

/**
 * Devuelve una lista de usuarios filtrados y paginados.
 */
exports.getUserList = async (req, res) => {
  try {
    // Parámetros de búsqueda y paginación
    let serverParams = req.headers.serverParams ? JSON.parse(req.headers.serverParams) : req.headers.serverparams ? JSON.parse(req.headers.serverparams) : {}
    let findParams = req.headers.findParams ? JSON.parse(req.headers.findParams) : req.headers.findparams ? JSON.parse(req.headers.findparams) : {};
    let sortParams = req.headers.sortParams ? JSON.parse(req.headers.sortParams) : req.headers.sortparams ? JSON.parse(req.headers.sortparams) : { _id: -1 };
    let limit = serverParams.perPage;
    let offset = limit * (serverParams.page - 1);

    // Filtro de búsqueda por texto
    if (findParams.keyText != undefined) {
      const searchFields = {
        'info.name': { $regex: findParams.keyText, $options: 'i' },
        'info.email': { $regex: findParams.keyText, $options: 'i' },
        'info.surname': { $regex: findParams.keyText, $options: 'i' },
        'info.username': { $regex: findParams.keyText, $options: 'i' }
      };
      findParams = {
        $or: Object.keys(searchFields).map(key => ({ [key]: searchFields[key] }))
      };
    }
    // Búsqueda y conteo
    const foundUsers = await User.find(findParams).populate("role").sort(sortParams).skip(offset).limit(limit);
    const UsersCounts = await User.countDocuments(findParams);

    if (foundUsers && foundUsers.length > 0) {
      let response = {
        data: foundUsers,
        totalRecords: UsersCounts
      }
      return res.status(200).send({ data: response, code: 2001 });
    } else {
      return res.status(200).send({ message: 'No se encontraron usuarios', code: 3001 });
    }
  } catch (err) {
    console.error("User Controller: getUserList")
    console.error(err);
    return res.status(403).send({ message: "Ha ocurrido un error procesando su solicitud", code: 3000 });
  }
};
