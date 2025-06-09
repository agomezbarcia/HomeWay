// Importación de dependencias
const { ObjectId } = require("bson");

// ==============================
// Definición de constantes de roles
// ==============================

// ID del rol de Administrador
const ROLE_ID_ADMIN = new ObjectId("611cd6f94476c902bd0f04e1");

// Lista de roles disponibles en el sistema
const ROLES = [
  {
    _id: ROLE_ID_ADMIN,
    alias: "Administrador",
    actions: ["ADMIN"]
  },
  {
    _id: new ObjectId("611cd6f94476c902bd0f04e4"),
    alias: "Usuario administrador",
    actions: [
      "PROPERTY_SEE",
      "PROPERTY_ADMIN",
      "RENTAL",
      "BOOKINGS_SEE",
      "USER_SELF",
      "USER_SEE",
      "USER_ADMIN",
      "PANEL_ADMIN"
    ]
  },
  {
    _id: new ObjectId("65a914e21a02be6c92a4a4b8"),
    alias: "Anfitrión",
    actions: [
      "PROPERTY_SEE",
      "PROPERTY_ADMIN",
      "RENTAL",
      "BOOKINGS_SEE",
      "USER_SELF"
    ]
  },
  {
    _id: new ObjectId("611cd6f94476c902bd0f04e2"),
    alias: "Huésped",
    actions: [
      "PROPERTY_SEE",
      "RENTAL",
      "BOOKINGS_SEE",
      "USER_SELF"
    ]
  }
];

// ==============================
// Definición de usuarios por defecto
// ==============================

// Lista de usuarios por defecto para inicialización del sistema
const DEFAULT_USERS = [
  {
    _id: new ObjectId("611cd6f94476c902bd0f04e2"),
    info: {
      name: "Abraham",
      surname: "Gómez Barcia",
      username: "agomezbarcia",
      email: "agomezbarcia@gmail.com",
      status: true,
      password: "$2b$08$arC8rAs4GWtlgWpyz5m9SOwDzZP9DOOg/L9PIK/cQLHzpsMASbFS."
    },
    role: ROLES[0]._id // Administrador
  },
  {
    _id: new ObjectId("67e83d9d94cb8daf7ddfe79f"),
    info: {
      name: "AnfitrionName",
      surname: "AnfitrionSurname",
      username: "UsuarioAnfitrion",
      email: "anfi@gmail.com",
      status: true,
      password: "$2a$08$xwcf.zEg3aiWwmxAUT1a6e5uQzUZ85TyYV4ZbzkGA/Y1oKMCISRrO",
      isHost: true,
      hostProfile: {
        paypalEmail: "anfi@homeway.com",
        bio: "",
        phoneNumber: "667074649",
        governmentId: "12345678Z"
      }
    },
    role: ROLES[2]._id, // Anfitrión
    activity: []
  },
  {
    _id: new ObjectId("67e83df094cb8daf7ddfe7aa"),
    info: {
      name: "HuespedName",
      email: "huesped@gmail.com",
      surname: "HuespedSurname",
      username: "UsuarioHuesped",
      status: true,
      password: "$2a$08$b.cZ73OaN5OWi.YHyXsXzO.qww7VfSG4CRw9BV2s9jeX6gGz3Yk9W",
      isHost: false
    },
    role: ROLES[3]._id, // Huésped
    activity: []
  }
];

// ==============================
// Exportaciones del módulo
// ==============================

module.exports = {
  roles: ROLES,
  roleIdAdmin: ROLE_ID_ADMIN,
  defaultUsers: DEFAULT_USERS
};