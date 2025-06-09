import http from "@/utils/request";

/**
 * Servicio para gestionar propiedades y reservas.
 */
class PropertyService {
  /**
   * Obtiene todas las propiedades con filtros opcionales.
   * @param {Object} filters - Filtros de búsqueda.
   * @returns {Promise} Respuesta de la API.
   */
  getProperties(filters = {}) {
    // Filtrar parámetros vacíos o nulos.
    const cleanParams = {};
    for (const key in filters) {
      const value = filters[key];
      if (value !== null && value !== undefined && value !== '') {
        if (typeof value === 'object') {
          // Si el valor es un objeto, verifica que tenga al menos una clave.
          if (Object.keys(value).length > 0) {
            cleanParams[key] = value;
          }
        } else {
          // Si el valor no es un objeto, lo agrega directamente.
          cleanParams[key] = value;
        }
      }
    }

    // Realiza una solicitud GET a la API con los parámetros filtrados
    return http.get(`properties/get`, {
      params: cleanParams, // Pasa los parámetros limpios
      paramsSerializer: params => {
        // Serializa los parámetros en formato de query string
        return Object.keys(params)
          .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
          .join('&'); // Une los pares clave-valor con "&"
      }
    });
  }

  /**
   * Obtiene la lista de usuarios.
   * @param {*} mode - Modo de filtrado.
   * @returns {Promise} Respuesta de la API.
   */
  getUserlist(mode) {
    return http.get(`properties/userlist/${mode}`);
  }

  /**
   * Obtiene propiedades por ID de anfitrión.
   * @param {string} hostId - ID del usuario anfitrión.
   * @returns {Promise} Respuesta de la API.
   */
  getPropertiesByHost(hostId) {
    return http.get(`properties/host/${hostId}`);
  }

  /**
   * Actualiza las coordenadas de una propiedad.
   * @param {string} id - ID de la propiedad.
   * @param {Array<number>} newLocation - [longitud, latitud].
   * @returns {Promise} Respuesta de la API.
   */
  async updateCoordinates(id, newLocation) {
    try {
      const body = { location: newLocation };
      return await http.put(`properties/update/${id}/coordinates`, body);
    } catch (error) {
      console.error("Error updating coordinates:", error);
      throw error;
    }
  }

  /**
   * Actualiza los datos básicos de una propiedad.
   * @param {string} id - ID de la propiedad.
   * @param {Object} propertyData - Datos a actualizar.
   * @returns {Promise} Respuesta de la API.
   */
  async updateProperty(id, propertyData) {
    try {
      const body = {
        title: propertyData.title,
        description: propertyData.description,
        host: propertyData.host.info._id,
        location: {
          type: propertyData.location.type,
          coordinates: propertyData.location.coordinates
        },
        address: {
          street: propertyData.address.street,
          number: propertyData.address.number,
          municipality: propertyData.address.municipality,
          block: propertyData.address.block,         // Campo opcional
          staircase: propertyData.address.staircase, // Campo opcional
          floor: propertyData.address.floor,         // Campo opcional
          door: propertyData.address.door,           // Campo opcional
          city: propertyData.address.city,
          postalCode: propertyData.address.postalCode,
          country: propertyData.address.country
        },
        pricePerNight: propertyData.pricePerNight,
        amenities: propertyData.amenities,
        maxGuests: propertyData.maxGuests,
        bedrooms: propertyData.bedrooms,
        bathrooms: propertyData.bathrooms
      };
      return await http.put(`properties/update/${id}`, body);
    } catch (error) {
      console.error("Error updating property:", error);
      throw error;
    }
  }

  /**
   * Crea una nueva propiedad.
   * @param {Object} propertyData - Datos de la propiedad.
   * @returns {Promise} Respuesta de la API.
   */
  async createProperty(propertyData) {
    try {
      const body = {
        title: propertyData.title,
        description: propertyData.description,
        host: propertyData.host,
        location: {
          type: propertyData.location.type,
          coordinates: propertyData.location.coordinates
        },
        address: {
          street: propertyData.address.street,
          number: propertyData.address.number,
          municipality: propertyData.address.municipality,
          block: propertyData.address.block,         // Campo opcional
          staircase: propertyData.address.staircase, // Campo opcional
          floor: propertyData.address.floor,         // Campo opcional
          door: propertyData.address.door,           // Campo opcional
          city: propertyData.address.city,
          postalCode: propertyData.address.postalCode,
          country: propertyData.address.country
        },
        pricePerNight: propertyData.pricePerNight,
        amenities: propertyData.amenities,
        maxGuests: propertyData.maxGuests,
        bedrooms: propertyData.bedrooms,
        bathrooms: propertyData.bathrooms
      };
      return await http.post(`properties/post/`, body);
    } catch (error) {
      console.error("Error creating property:", error);
      throw error;
    }
  }

  /**
   * Elimina una propiedad.
   * @param {string} id - ID de la propiedad.
   * @returns {Promise} Respuesta de la API.
   */
  async deleteProperty(id) {
    try {
      return await http.delete(`properties/delete/${id}`);
    } catch (error) {
      console.error("Error deleting property:", error);
      throw error;
    }
  }

  /**
   * Crea una reserva para una propiedad.
   * @param {Object} bookingData - Datos de la reserva.
   * @returns {Promise} Respuesta de la API.
   */
  async createBooking(bookingData) {
    try {
      const body = {
        property: bookingData.propertyId,
        checkInDate: bookingData.checkIn,
        checkOutDate: bookingData.checkOut,
        numberOfGuests: bookingData.guests,
        paymentMethod: bookingData.paymentMethod
      };
      return await http.post(`bookings/`, body);
    } catch (error) {
      console.error("Error creating booking:", error);
      throw error;
    }
  }
}

// Exporta una instancia única del servicio.
export default new PropertyService();