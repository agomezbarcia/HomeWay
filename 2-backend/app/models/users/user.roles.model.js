// Exporta una función que recibe la instancia de mongoose
module.exports = mongoose => {
  // Define el esquema para los roles de usuario
  var schema = mongoose.Schema(
    {
      // Alias del rol
      alias: String,
      // Acciones permitidas para el rol
      actions: [String]
    },
    {
      // Desactiva el campo __v y activa timestamps (createdAt, updatedAt)
      versionKey: false,
      timestamps: true
    }
  );

  // Crea el modelo 'users_roles' usando el esquema definido
  const Roles = mongoose.model("users_roles", schema);

  // Retorna el modelo
  return Roles;
};
