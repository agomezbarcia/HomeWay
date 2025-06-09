// Exporta una función que define y retorna el modelo de Review
module.exports = mongoose => {
    // Definición del esquema de Review
    const reviewSchema = new mongoose.Schema({
        // Referencia al autor de la reseña (usuario)
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true
        },
        // Referencia a la reserva asociada
        booking: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "bookings",
            required: true
        },
        // Calificación de la reseña (1 a 5)
        rating: {
            type: Number,
            required: true,
            min: [1, 'La calificación mínima es 1'],
            max: [5, 'La calificación máxima es 5']
        },
        // Comentario de la reseña
        comment: {
            type: String,
            required: true,
            trim: true,
            maxlength: [1000, 'El comentario no puede exceder 1000 caracteres']
        },
        // Fecha de creación de la reseña
        createdAt: {
            type: Date,
            default: Date.now
        }
    }, {
        // Opciones del esquema
        versionKey: false, // Desactiva el campo __v
        timestamps: true   // Añade campos createdAt y updatedAt automáticamente
    });

    // Índice único para evitar reseñas duplicadas por usuario y reserva
    reviewSchema.index({ author: 1, booking: 1 }, { unique: true });

    // Retorna el modelo de Review
    return mongoose.model("reviews", reviewSchema);
};