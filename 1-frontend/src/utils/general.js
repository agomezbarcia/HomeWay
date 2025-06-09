// Importa Buffer para decodificar base64
import { Buffer } from 'buffer';

/**
 * @FUNC: Función para decodificar el payload del token JWT
 * @param {string} token - Token codificado en base64 para que sea decodificada
 * @return {Object|null} Objeto con los parámetros decodificados o null si no es válido
 */
export function parseJwt(token) {
  // Verifica que el token exista
  if (token) {
    // Obtiene la parte del payload del token (segunda sección)
    var base64Url = token.split('.')[1];
    if (base64Url) {
      // Reemplaza caracteres para que sea compatible con base64 estándar
      var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      // Decodifica el payload y lo convierte a un objeto JSON
      var jsonPayload = decodeURIComponent(
        Buffer.from(base64, "base64")
          .toString("ascii")
          .split("")
          .map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join('')
      );
      return JSON.parse(jsonPayload);
    } else {
      // Retorna null si no existe el payload
      return null;
    }
  } else {
    // Retorna null si no existe el token
    return null;
  }
}