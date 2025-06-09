import http from "@/utils/request";

/**
 * Servicio para gestionar operaciones relacionadas con usuarios y roles.
 */
class UserService {

  // ===========================
  // Autenticación y Recuperación
  // ===========================

  /**
   * Identificarse en el sistema por email/password.
   * @param {Object} data - Credenciales del usuario.
   * @returns {Promise}
   */
  login(data) {
    return http.post("/auth/login", data);
  }

  /**
   * Recuperar la contraseña a través del email.
   * @param {string} email - Email del usuario.
   * @returns {Promise}
   */
  recoverPassword(email) {
    return http.post("/auth/recover", email);
  }

  // ===========================
  // Registro y Creación de Usuarios
  // ===========================

  /**
   * Crear nueva cuenta en el sistema (registro de usuario).
   * @param {Object} data - Datos del usuario a registrar.
   * @returns {Promise}
   */
  createUser(data) {
    return http.post("/user/register", data);
  }

  /**
   * Crear nueva cuenta por un administrador.
   * @param {Object} data - Datos del usuario a crear.
   * @returns {Promise}
   */
  createUserByAdmin(data) {
    return http.post("/user/create", data);
  }

  // ===========================
  // Obtención de Datos de Usuarios
  // ===========================

  /**
   * Obtener datos de todos los usuarios.
   * @returns {Promise}
   */
  getAll() {
    return http.get("user/data");
  }

  /**
   * Obtener datos del usuario a partir del ID.
   * @param {string} id - ID del usuario.
   * @returns {Promise}
   */
  getUser(id) {
    return http.get(`user/data/${id}`);
  }

  /**
   * Obtener datos del host a partir del ID.
   * @param {string} id - ID del host.
   * @returns {Promise}
   */
  getDataHost(id) {
    return http.get(`user/host/data/${id}`);
  }

  /**
   * Endpoint para obtener lista de usuarios filtrados.
   * @param {Object} serverParams - Parámetros del servidor.
   * @param {Object} findParams - Parámetros de búsqueda.
   * @returns {Promise}
   */
  getUsersList(serverParams, findParams) {
    let data = {
      headers: {
        serverParams: serverParams ? JSON.stringify(serverParams) : null,
        findParams: findParams ? JSON.stringify(findParams) : null
      }
    };
    return http.get("/user/list", data);
  }

  // ===========================
  // Actualización y Eliminación de Usuarios
  // ===========================

  /**
   * Actualizar los datos del usuario por el ID.
   * @param {string} id - ID del usuario.
   * @param {Object} data - Datos a actualizar.
   * @returns {Promise}
   */
  updateUser(id, data) {
    return http.post(`user/data/${id}`, data);
  }

  /**
   * Elimina un usuario por el ID.
   * @param {string} id - ID del usuario.
   * @returns {Promise}
   */
  deleteUser(id) {
    return http.delete(`user/data/${id}`);
  }

  // ===========================
  // Gestión de Roles
  // ===========================

  /**
   * Obtener todos los roles.
   * @returns {Promise}
   */
  getAllRoles() {
    return http.get("/user/roles");
  }

  /**
   * Crear un nuevo rol.
   * @param {Object} data - Datos del rol.
   * @returns {Promise}
   */
  createRole(data) {
    return http.post("/user/roles", data);
  }

  /**
   * Actualizar un rol.
   * @param {Object} data - Datos del rol a actualizar (debe incluir _id).
   * @returns {Promise}
   */
  updateRole(data) {
    return http.put(`/user/roles/${data._id}`, data);
  }

  /**
   * Elimina un rol.
   * @param {string} id - Id (mongoose.schema) del Rol a eliminar.
   * @returns {Promise}
   */
  deleteRole(id) {
    return http.delete(`/user/roles/${id}`);
  }

  // ===========================
  // Secciones
  // ===========================

  /**
   * Obtener todas las secciones.
   * @returns {Promise}
   */
  getSections() {
    return http.get("/user/sections");
  }

}

export default new UserService();