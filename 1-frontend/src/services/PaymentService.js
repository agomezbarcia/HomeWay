import http from "@/utils/request";

/**
 * Service for handling payment-related API requests.
 */
class PaymentService {

  /**
   * Create a new payment.
   * @param {Object} paymentData - Data for the new payment.
   * @returns {Promise} HTTP response.
   */
  async createPayment(paymentData) {
    return http.post("payments/create", paymentData);
  }

  /**
   * Update payment information by booking ID.
   * @param {string} bookingId - The booking identifier.
   * @param {Object} data - Updated payment data.
   * @returns {Promise} HTTP response.
   */
  async updatePaymentByBooking(bookingId, data) {
    return http.put(`payments/${bookingId}`, data);
  }

  /**
   * Refund a payment by transaction ID and amount.
   * @param {string} transactionId - The transaction identifier.
   * @param {number} amount - Amount to refund.
   * @returns {Promise} HTTP response.
   */
  async refundPayment(transactionId, amount) {
    return http.post("payments/refund", { transactionId, amount });
  }

}

export default new PaymentService();