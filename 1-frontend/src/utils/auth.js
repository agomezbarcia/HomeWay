/* 
    Funciones auxiliares para el manejo del token de usuario.
    Permiten almacenar, obtener y eliminar el token de manera persistente usando localStorage.
*/

/**
 * Obtiene el token del usuario almacenado en localStorage.
 * @returns {string|null} El token almacenado o null si no existe.
 */
export function getUserToken() {
        return localStorage.getItem('TokenKey');
}

/**
 * Almacena o actualiza el token del usuario en localStorage.
 * @param {string} token - El token a guardar.
 */
export function setUserToken(token) {
        return localStorage.setItem('TokenKey', token);
}

/**
 * Elimina el token del usuario de localStorage.
 */
export function removeUserToken() {
        return localStorage.removeItem('TokenKey');
}
