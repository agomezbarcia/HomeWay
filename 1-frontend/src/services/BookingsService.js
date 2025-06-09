import http from "@/utils/request";

/**
 * Service class for handling booking-related API requests.
 */
class BookingsService {

  /**
   * Create a new booking.
   * @param {Object} bookingData - Data for the new booking.
   * @returns {Promise} API response.
   */
  async createBooking(bookingData) {
    return http.post("bookings", bookingData);
  }

  /**
   * Get all bookings, optionally filtered by upcoming status and server parameters.
   * @param {boolean} upcoming - Whether to filter for upcoming bookings.
   * @param {Object} serverParams - Additional server parameters.
   * @returns {Promise} API response.
   */
  async getAllBookings(upcoming, serverParams) {
    let data = {
      headers: {
        serverParams: serverParams ? JSON.stringify(serverParams) : null,
        upcoming: upcoming
      }
    };
    return http.get("bookings", data);
  }

  /**
   * Get bookings for a specific property.
   * @param {string} propertyId - The property ID.
   * @returns {Promise} API response.
   */
  async getBookingsByProperty(propertyId) {
    return http.get(`bookings/property/${propertyId}`);
  }

  /**
   * Get bookings for a specific host, optionally filtered by upcoming status and server parameters.
   * @param {string} hostId - The host ID.
   * @param {boolean} upcoming - Whether to filter for upcoming bookings.
   * @param {Object} serverParams - Additional server parameters.
   * @returns {Promise} API response.
   */
  async getBookingsByHost(hostId, upcoming, serverParams) {
    let data = {
      headers: {
        serverParams: serverParams ? JSON.stringify(serverParams) : null,
        upcoming: upcoming
      }
    };
    return http.get(`bookings/host/${hostId}`, data);
  }

  /**
   * Update an existing booking.
   * @param {string} bookingId - The booking ID.
   * @param {Object} bookingData - Updated booking data.
   * @returns {Promise} API response.
   */
  async updateBooking(bookingId, bookingData) {
    return http.put(`bookings/${bookingId}`, bookingData);
  }

  /**
   * Get bookings for a specific user, optionally filtered by upcoming status and server parameters.
   * @param {string} userId - The user ID.
   * @param {boolean} upcoming - Whether to filter for upcoming bookings.
   * @param {Object} serverParams - Additional server parameters.
   * @returns {Promise} API response.
   */
  async getBookingsByUser(userId, upcoming, serverParams) {
    let data = {
      headers: {
        serverParams: serverParams ? JSON.stringify(serverParams) : null,
        upcoming: upcoming
      }
    };
    return http.get(`bookings/user/${userId}`, data);
  }
}

export default new BookingsService();