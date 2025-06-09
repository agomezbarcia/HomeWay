import http from "@/utils/request";

// Servicio para gestionar las reseñas y comentarios
class ReviewsService {

  // Obtener todas las reseñas
  async getAllReviews() {
    return http.get("reviews");
  }

  // Añadir un nuevo comentario
  async addComment(commentData) {
    return http.post("reviews/comment", commentData);
  }

  // Eliminar un comentario por su ID
  async deleteComment(commentId) {
    return http.delete(`reviews/comment/${commentId}`);
  }

}

export default new ReviewsService();