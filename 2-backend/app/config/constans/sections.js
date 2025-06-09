// ==============================
// Secciones del panel web por proyecto
// ==============================

/**
 * La estructura del array es la siguiente:
 * - El array contiene secciones
 * - Cada sección es un objeto con los siguientes campos:
 *   - name: Nombre de la sección que se muestra en la tabla de permisos
 *   - binary: Booleano que indica si la sección tiene los campos de 'see' y 'admin' (true) o solo 'admin' (false)
 *   - actions: Objeto con información sobre las acciones y su estado en la tabla
 *     - see: (opcional) Acción de VER, contiene:
 *       - keyword: Acción asociada al permiso de VER
 *       - checked: Booleano que indica si la casilla está marcada
 *     - admin: Acción de ADMINISTRAR, contiene:
 *       - keyword: Acción asociada al permiso de ADMINISTRAR
 *       - checked: Booleano que indica si la casilla está marcada
 */

// ==============================
// Secciones por defecto
// ==============================
const SECTIONS = [
    // Sección: Homes
    {
        name: "Homes",
        binary: true,
        actions: {
            see: { keyword: "PROPERTY_SEE", checked: false },
            admin: { keyword: "PROPERTY_ADMIN", checked: false }
        }
    },
    // Sección: Listado de reservas
    {
        name: "Listado de reservas",
        binary: true,
        actions: {
            see: { keyword: "BOOKINGS_SEE", checked: false },
            admin: { keyword: "BOOKINGS_ADMIN", checked: false }
        }
    },
    // Sección: Usuarios y roles
    {
        name: "Usuarios y roles",
        binary: true,
        actions: {
            see: { keyword: "USER_SEE", checked: false },
            admin: { keyword: "USER_ADMIN", checked: false }
        }
    },
    // Sección: Realizar reservas
    {
        name: "Realizar reservas",
        binary: false,
        actions: {
            admin: { keyword: "RENTAL", checked: false }
        }
    },
    // Sección: Perfil propio
    {
        name: "Perfil propio",
        binary: false,
        actions: { admin: { keyword: "USER_SELF", checked: false } }
    },
    // Sección: Administración del panel
    {
        name: "Administración del panel",
        binary: false,
        actions: { admin: { keyword: "PANEL_ADMIN", checked: false } }
    }
];

// ==============================
// Funciones
// ==============================

/**
 * Devuelve el array de secciones de acuerdo con el acrónimo del proyecto
 * @returns {Array} Array de secciones
 */
function getSectionsByAcronym() {
    return SECTIONS;
}

// ==============================
// Exportaciones
// ==============================
module.exports = {
    getSectionsByAcronym
};