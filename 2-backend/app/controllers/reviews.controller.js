const Reviews = require("../models/").reviews;
const mongoose = require("mongoose");

/**
 * Obtener todos los comentarios (reviews)
 */
exports.getAllReviews = async (req, res) => {
  try {
    // Buscar todos los reviews y poblar los campos author y booking
    const reviews = await Reviews.find().populate("author").populate("booking");
    return res.status(200).json({
      message: "Comentarios obtenidos correctamente.",
      reviews
    });
  } catch (error) {
    // Manejo de errores al obtener los reviews
    console.error("Error fetching reviews:", error);
    return res.status(500).json({
      message: "Error interno al obtener los comentarios.",
      error: error.message
    });
  }
};

/**
 * Añadir un nuevo comentario (review)
 */
exports.addComment = async (req, res) => {
  try {
    const data = req.body;
    const { author, booking, rating, comment } = data;

    // Validaciones básicas de los campos requeridos
    if (!author || !booking || !rating || !comment) {
      return res.status(400).json({
        message: "Faltan campos obligatorios.",
      });
    }

    // Validar que el ID de la reserva sea válido
    if (!mongoose.Types.ObjectId.isValid(booking)) {
      return res.status(400).json({
        message: "ID de reserva no válido.",
      });
    }

    // Crear una nueva instancia de review
    const review = new Reviews({
      author,
      booking: new mongoose.Types.ObjectId(booking),
      rating,
      comment
    });

    // Guardar el review en la base de datos
    await review.save();

    return res.status(200).json({
      message: "Comentario añadido correctamente.",
      code: 2000,
      reviewId: review._id
    });

  } catch (error) {
    // Manejo de errores al crear el review
    console.error("Error creating review:", error);
    return res.status(500).json({
      message: "Error interno al crear el comentario.",
      code: 3000,
      error: error.message
    });
  }
};

/**
 * Eliminar un comentario (review) por ID
 */
exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    // Validar que se proporcione el ID
    if (!id) {
      return res.status(400).json({
        message: "ID de comentario no proporcionado.",
        code: 3001
      });
    }

    // Validar que el ID sea un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "ID de comentario no válido.",
        code: 3002
      });
    }

    // Buscar y eliminar el review por ID
    const review = await Reviews.findByIdAndDelete(id);

    // Si no se encuentra el review, devolver error 404
    if (!review) {
      return res.status(404).json({
        message: "Comentario no encontrado.",
        code: 3003
      });
    }

    return res.status(200).json({
      message: "Comentario eliminado correctamente.",
      code: 2000
    });

  } catch (error) {
    // Manejo de errores al eliminar el review
    console.error("Error deleting review:", error);
    return res.status(500).json({
      message: "Error interno al eliminar el comentario.",
      code: 3000,
      error: error.message
    });
  }
};