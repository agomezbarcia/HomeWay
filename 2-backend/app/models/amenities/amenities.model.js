// Exporta una función que define y retorna el modelo de Amenity
module.exports = mongoose => {
  // Definición del esquema de Amenity
  const amenitySchema = new mongoose.Schema({
    // Nombre de la comodidad
    name: { 
      type: String,
      trim: true,
      required: [true, 'El nombre de la comodidad es obligatorio'],
      unique: true,
      maxlength: [50, 'El nombre no puede exceder 50 caracteres']
    },
    // Icono representativo de la comodidad
    icon: {
      type: String,
      required: [true, 'El icono es obligatorio']
    },
    // Categoría de la comodidad
    category: { 
      type: String, 
      enum: {
        values: ['general', 'dormitorio', 'cocina', 'seguridad', 'exterior'],
        message: 'Categoría no válida'
      },
      required: [true, 'La categoría es obligatoria'] 
    }
  }, { 
    // Desactiva el campo __v de versión
    versionKey: false 
  });

  // Retorna el modelo de Mongoose para la colección "amenities"
  return mongoose.model("amenities", amenitySchema);
};