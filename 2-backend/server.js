// Importación de módulos y configuración inicial
const express = require("express");
const cors = require("cors");
const db = require("./app/models/");
const app = express();
const basePath = process.env.API_URL_BASE_PATH;
const { CronPayments } = require("./cron");
const dbInit = require("./app/config/db.init.js");
const acr = require("./app/config/config.js");

// Configuración de CORS
var corsOptions = {
  exposedHeaders: ['Content-Disposition']
};

// Función para restaurar valores por defecto en la base de datos
restore = async () => {
  try {
    console.log("Valores por defecto solicitados");
    await dbInit.initDBCollections(acr.acronym)
    console.log("Se han restaurado los valores por defecto, code: 2000");
  } catch (err) {
    console.error("Server: restore")
    console.error(err);
    console.log("Error desconocido en la instalación de los valores por defecto, code: 2000");
  }
};

// Conexión a la base de datos MongoDB
db.mongoose
  .connect(db.dburl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Conectado con la base de datos " + db.dburl);
    console.log("Detectados los siguientes esquemas de datos")
    console.log(db.mongoose.modelNames());
    restore();
  })
  .catch(err => {
    console.log("No se puede conectar con la base de datos ", err);
    process.exit();
  });

// Inicialización de tareas programadas (CRON)
CronPayments.sendPaymentsToHosts('* * * * *');

// Configuración de middlewares de Express
app.use(cors(corsOptions));
app.use(express.json({ limit: '1024mb' }));
app.use(express.urlencoded({ limit: '1024mb', extended: true }));

// Ruta de bienvenida a la API
app.get(basePath, (req, res) => {
  res.json({ message: "Bienvenido a la aplicación" });
});

// Inicialización de rutas de la aplicación
require("./app/routes/auth.routes")(app);
require("./app/routes/user.routes")(app);
require("./app/routes/payment.routes")(app);
require("./app/routes/property.routes")(app);
require("./app/routes/logs.routes")(app);
require("./app/routes/bookings.routes")(app);
require("./app/routes/reviews.routes")(app);
require("./app/routes/mailer.routes")(app);
require("./app/routes/amenities.routes")(app);

// Inicialización del servidor HTTP
const PORT = process.env.API_PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
