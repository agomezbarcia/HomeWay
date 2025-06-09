// Exporta una función que recibe la instancia de mongoose
module.exports = mongoose => {
  // Define el esquema para los logs del sistema
  var schema = mongoose.Schema(
    {
    // Tipo de log (por ejemplo: error, info, etc.)
    logType: String,
    // Mensaje del log
    log: String,
    // Referencia al usuario relacionado con el log
    user: { type: mongoose.Schema.ObjectId, ref: "users" }
    },
    {
    // Desactiva el campo __v y activa timestamps (createdAt, updatedAt)
    versionKey: false,
    timestamps: true
    }
  );

  // Crea un índice para eliminar documentos después de 30 días (2592000 segundos)
  schema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

  // Crea el modelo SystemLog usando el esquema definido
  const SystemLog = mongoose.model("system_logs", schema);

  // Retorna el modelo
  return SystemLog;
};