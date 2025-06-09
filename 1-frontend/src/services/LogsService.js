import http from "@/utils/request";

/**
 * Servicio para manejar operaciones relacionadas con los logs.
 */
class LogsService {

  /**
   * Obtiene la lista de logs.
   * @param {Object} serverParams - Parámetros del servidor.
   * @param {Object} findParams - Parámetros de búsqueda.
   * @returns {Promise} Respuesta de la petición HTTP.
   */
  getLogsList(serverParams, findParams) {
    // Construcción de los headers con los parámetros recibidos
    let data = { 
      headers: { 
        serverParams: serverParams ? JSON.stringify(serverParams) : null,  
        findParams: findParams ? JSON.stringify(findParams) : null
      }
    };
    // Petición GET al endpoint de logs
    return http.get("/logs/list", data);
  }

}

// Exporta una instancia de LogsService
export default new LogsService();