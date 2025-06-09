// Exporta una función que recibe la instancia de mongoose
module.exports = mongoose => {
  // Define el esquema para la colección de actividades de usuario
  var schema = mongoose.Schema(
    {
      ip: String // Dirección IP del usuario
    },
    {
      versionKey: false, // Desactiva el campo __v
      timestamps: { createdAt: true, updatedAt: false } // Solo almacena la fecha de creación
    }
  );

  // Crea el modelo 'users_activities' usando el esquema definido
  const UserActivity = mongoose.model("users_activities", schema);

  // Retorna el modelo para su uso en otras partes de la aplicación
  return UserActivity;
};
