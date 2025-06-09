/******************************/
//   IMPORTACIONES Y CONFIG   //
/******************************/
const dbConfig = require("../config/config.js");
const mongoose = require("mongoose");

/******************************/
//   INICIALIZACIÓN DE DB     //
/******************************/
const db = {};
db.mongoose = mongoose;
db.dburl = dbConfig.dburl;
db.dbdatacollector = dbConfig.dbdatacollector;

/******************************/
//   ÍNDICE DE MODELOS DE DATOS
/******************************/

// ===== Usuarios y roles =====
db.user = require("./users/user.model.js")(mongoose);
db.userActivity = require("./users/user.activity.model.js")(mongoose);
db.roles = require("./users/user.roles.model.js")(mongoose);

// ===== Propiedades =====
db.properties = require("./properties/properties.model.js")(mongoose);

// ===== Reservas =====
db.bookings = require("./bookings/bookings.model.js")(mongoose);

// ===== Pagos =====
db.payments = require("./payments/payments.model.js")(mongoose);

// ===== Reseñas =====
db.reviews = require("./reviews/reviews.model.js")(mongoose);

// ===== Comodidades =====
db.amenities = require("./amenities/amenities.model.js")(mongoose);

// ===== Administración =====
db.logs = require('./logs/logs.model.js')(mongoose);

/******************************/
//        EXPORTACIÓN         //
/******************************/
module.exports = db;
