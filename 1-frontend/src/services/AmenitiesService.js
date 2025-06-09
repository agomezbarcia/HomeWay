// Importa la instancia de http personalizada desde utils/request
import http from "@/utils/request";

// Clase que maneja las peticiones relacionadas con amenities (servicios)
class AmenitiesService {

    // Obtiene todos los servicios (amenities) disponibles
    async getAllAmenities() {
        return http.get("amenities");
    }
}

// Exporta una instancia única de AmenitiesService
export default new AmenitiesService();