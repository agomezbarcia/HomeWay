<template>
  <div>
    <!-- Sección con la lista de reservas -->
    <BlockFull titulo="Lista de Reservas" :titleCol="8">
      <template v-slot:content>
        <!-- Tabla de reservas -->
        <Table id="rentalTable" ref="rentalTable" :columns="columns" :rows="rental_rows" :isLoading="loadingTable"
          :serverSize="true" :totalRecords="totalRecords" :showOptions="false" :searchActive="false"
          :searchDisabled="true" :showRowNumber="false" :pageJumpOption="true" :sortAlllowed="false"
          @onPageChange="onPageChange" @onPerPageChange="onPerPageChange">
          <!-- Acciones para usuarios que no son host ni admin -->
          <template v-slot:acciones="props" v-if="!isHostAdmin">
            <!-- Botón para cancelar reserva (reembolso) -->
            <button
              :class="['btn btn-sm mx-1', props.rowItem.status.value === 'Completado' ? 'btn-warning' : 'btn-secondary']"
              @click="refund(props.rowItem._id.value, props.rowItem.transactionId.value, props.rowItem.totalPrice.value)"
              v-if="upcoming" :disabled="props.rowItem.status.value !== 'Completado'">
              <i class="fas fa-undo-alt me-2"></i> Cancelar Reserva
            </button>
            <!-- Botón para agregar comentario -->
            <button :class="['btn btn-sm mx-1', props.rowItem.disabled.value ? 'btn-secondary' : 'btn-primary']"
              @click="listenComment(props.rowItem._id.value, props.rowItem.property.value)"
              v-if="!upcoming && !props.rowItem.disabled.value" :disabled="props.rowItem.disabled.value">
              <i class="fas fa-comment me-2"></i>Comentar
            </button>
            <!-- Botón para eliminar comentario -->
            <button :class="['btn btn-sm mx-1', !props.rowItem.disabled.value ? 'btn-secondary' : 'btn-danger']"
              @click="deleteComment(props.rowItem.commentId.value)" v-if="!upcoming && props.rowItem.disabled.value"
              :disabled="!props.rowItem.disabled.value">
              <i class="fas fa-trash me-2"></i>Eliminar comentario
            </button>
          </template>
        </Table>

        <!-- Formulario de comentario inline -->
        <div v-if="showCommentForm" ref="commentFormContainer" class="my-4">
          <div class="card shadow-lg border-0">
            <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <h5 class="mb-0">Agregar comentario</h5>
              <button class="btn btn-sm btn-danger" @click="closeCommentForm">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <div class="card-body">
              <p class="text-muted mb-3">
                <i class="fas fa-home me-2"></i>{{ selectedPropertyTitle }}
              </p>
              <!-- Sistema de Rating con Estrellas -->
              <div class="mb-3">
                <label class="form-label fw-semibold">Calificación:&nbsp;</label>
                <div class="star-rating">
                  <button v-for="star in 5" :key="star" class="star-button" @click="selectedRating = star"
                    @mouseover="hoverRating = star" @mouseleave="hoverRating = 0">
                    <i class="fas fa-star" :class="{
                      'text-warning': (hoverRating || selectedRating) >= star,
                      'text-muted': (hoverRating || selectedRating) < star
                    }" style="font-size: 1rem; transition: color 0.2s;"></i>
                  </button>
                </div>
                <small class="text-muted"> ({{ selectedRating }} de 5 estrellas)</small>
              </div>
              <!-- Campo de texto para el comentario -->
              <div class="form-floating mb-3">
                <textarea class="form-control" v-model="commentText" placeholder="Escribe tu comentario aquí..."
                  style="height: 100px; border-radius: 10px;"></textarea>
                <label>Tu comentario:</label>
              </div>
              <!-- Botones de acción del formulario -->
              <div class="d-grid gap-2 d-md-flex justify-content-md-end">
                <button class="btn btn-success" @click="submitComment"
                  :disabled="commentText.trim() && selectedRating == 0">
                  <i class="fas fa-paper-plane me-2"></i>Enviar
                </button>
                <button class="btn btn-outline-secondary" @click="closeCommentForm">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      </template>
    </BlockFull>
  </div>
</template>

<script>
// Importación de dependencias y servicios
import { useUsersStore } from '@/stores/UsersVuex';
import BookingsService from '@/services/BookingsService';
import ReviewsService from '@/services/ReviewsService';
import PaymentService from '@/services/PaymentService';
import BlockFull from '@/components/commons/BlockFull';
import Table from '@/components/commons/Table';
import { differenceInDays, format } from 'date-fns';

export default {
  name: 'ParentComponent',
  props: {
    upcoming: {
      type: Boolean,
      required: true,
    },
    isHostAdmin: {
      type: Boolean,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      required: true,
    },
  },
  components: {
    BlockFull,
    Table,
  },
  data() {
    return {
      // Definición de columnas de la tabla
      columns: [
        { label: 'ID', field: '_id', class: 'text-center', hidden: true },
        { label: 'ID_COMENTARIO', field: 'commentId', class: 'text-center', hidden: true },
        { label: 'Propiedad', field: 'property', type: 'string', class: 'text-center' },
        { label: 'Check In', field: 'checkin', type: 'string', class: 'text-center' },
        { label: 'Check Out', field: 'checkout', type: 'string', class: 'text-center' },
        { label: 'Noches', field: 'nights', type: 'number', class: 'text-center' },
        { label: 'Huéspedes', field: 'numberOfGuests', type: 'number', class: 'text-center' },
        { label: 'Precio/Noche', field: 'price', type: 'number', class: 'text-center' },
        { label: 'Precio total', field: 'totalPrice', type: 'number', class: 'text-center' },
        { label: 'Estado', field: 'status', class: 'text-center' },
        { label: 'ID_TRANSACCION', field: 'transactionId', class: 'text-center', hidden: true },
        { label: 'Acciones', field: 'acciones', class: 'text-center align-middle', hidden: this.isHostAdmin || this.isAdmin },
        { label: 'DISABLED', field: 'disabled', hidden: true },
      ],
      rental_rows: [],         // Filas de la tabla de reservas
      reviews: [],             // Lista de comentarios
      loadingTable: false,     // Estado de carga de la tabla
      rentalRecords: [],       // Registros de reservas
      totalRecords: 0,         // Total de registros para paginación
      serverParams: { page: 1, perPage: 10 }, // Parámetros de paginación
      commentText: '',         // Texto del comentario
      selectedRentalId: null,  // ID de la reserva seleccionada para comentar
      selectedPropertyTitle: '', // Título de la propiedad seleccionada
      showCommentForm: false,  // Mostrar/ocultar formulario de comentario
      selectedRating: 0,       // Calificación seleccionada
      hoverRating: 0,          // Calificación al pasar el mouse
    };
  },
  async mounted() {
    // Obtener datos del usuario si no están cargados
    if (!useUsersStore().getData) {
      await useUsersStore().v_getselfdata();
    }
    // Obtener comentarios y reservas
    this.retriveReviews();
    this.retriveRental();
  },
  methods: {
    // Actualiza los parámetros del servidor para paginación
    updateParams(newProps) {
      this.serverParams = { ...this.serverParams, ...newProps };
    },
    // Maneja el cambio de página en la tabla
    onPageChange(params) {
      this.updateParams({ page: params.currentPage });
      this.retriveRental();
    },
    // Maneja el cambio de cantidad de elementos por página
    onPerPageChange(params) {
      this.$refs.rentalTable?.jumpPage({ target: { value: 1 } });
      this.updateParams({ perPage: params.currentPerPage });
      this.retriveRental();
    },
    // Recupera las reservas según el tipo de usuario
    async retriveRental() {
      try {
        let response;
        this.$refs.rentalTable.clearTable();
        this.loadingTable = true;
        this.rental_rows = [];
        if (this.isAdmin) {
          response = await BookingsService.getAllBookings(this.upcoming, this.serverParams);
        } else {
          if (this.isHostAdmin) {
            response = await BookingsService.getBookingsByHost(
              useUsersStore().v_userdata?._id,
              this.upcoming,
              this.serverParams
            );
          } else {
            response = await BookingsService.getBookingsByUser(
              useUsersStore().v_userdata?._id,
              this.upcoming,
              this.serverParams
            );
          }
        }
        this.rentalRecords = response.data.bookings;
        this.totalRecords = response.data.totalbookings;
        await this.populateRows();
      } catch (error) {
        console.error(error);
      } finally {
        this.loadingTable = false;
      }
    },
    // Recupera todos los comentarios
    async retriveReviews() {
      try {
        const response = await ReviewsService.getAllReviews();
        this.reviews = response.data.reviews;
      } catch (error) {
        console.error('Error al obtener los comentarios:', error);
      }
    },
    // Llena las filas de la tabla con los datos de reservas y comentarios
    populateRows() {
      return new Promise((resolve) => {
        const rows = this.rentalRecords.map((entry) => ({
          _id: entry._id,
          commentId: this.reviews.find((review) => review.booking._id == entry._id)?._id || null,
          property: entry.property.title,
            checkin: format(new Date(entry.checkInDate), 'dd/MM/yyyy'),
          checkout: format(new Date(entry.checkOutDate), 'dd/MM/yyyy'),
          nights: differenceInDays(new Date(entry.checkOutDate), new Date(entry.checkInDate)),
          numberOfGuests: entry.numberOfGuests,
          price: entry.property.pricePerNight,
          status: this.translateStatus(entry.status),
          totalPrice: entry.totalPrice,
          transactionId: entry.transactionId,
          disabled: this.reviews.some((review) => review.booking._id == entry._id),
        }));
        this.rental_rows = rows;
        resolve();
      });
    },
    // Traduce el estado de la reserva a español
    translateStatus(status) {
      const statusTranslations = {
        pending: 'Pendiente',
        confirmed: 'Confirmado',
        cancelled: 'Cancelado',
        completed: 'Completado',
        refunded: 'Reembolsado',
      };
      return statusTranslations[status] || status;
    },
    // Muestra el formulario de comentario para una reserva
    listenComment(rentalId, property) {
      this.selectedRentalId = rentalId;
      this.selectedPropertyTitle = property;
      this.commentText = '';
      this.showCommentForm = true;
      // Esperar a que se renderice el formulario y hacer scroll
      this.$nextTick(() => {
        if (this.$refs.commentFormContainer) {
          this.$refs.commentFormContainer.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    },
    // Envía el comentario al backend
    async submitComment() {
      if (!this.commentText.trim() || this.selectedRating === 0) return;
      try {
        await ReviewsService.addComment({
          author: useUsersStore().v_userdata._id,
          booking: this.selectedRentalId,
          rating: this.selectedRating,
          comment: this.commentText
        });
        this.retriveReviews();
        this.retriveRental();
        this.closeCommentForm();
      } catch (error) {
        console.error('Error al enviar comentario:', error);
      }
    },
    // Cierra el formulario de comentario y limpia los datos
    closeCommentForm() {
      this.showCommentForm = false;
      this.commentText = '';
      this.selectedRentalId = null;
      this.selectedPropertyTitle = '';
      this.selectedRating = 0;
      this.hoverRating = 0;
    },
    // Elimina un comentario existente
    async deleteComment(commentId) {
      try {
        await ReviewsService.deleteComment(commentId);
        this.retriveReviews();
        this.retriveRental();
      } catch (error) {
        console.error('Error al eliminar el comentario:', error);
      }
    },
    // Realiza el reembolso de una reserva
    async refund(bookingId, transactionId, amount) {
      if (!confirm('¿Estás seguro de que deseas reembolsar este pago?')) return;
      try {
        await PaymentService.refundPayment(transactionId, amount);
        // Actualizar el estado de la reserva y del pago
        await BookingsService.updateBooking(bookingId, { status: 'refunded' });
        await PaymentService.updatePaymentByBooking(bookingId, { status: 'refunded' });
        this.retriveRental(); // refrescar datos
      } catch (error) {
        console.error('Error al reembolsar:', error);
      }
    }
  },
};
</script>

<style scoped>
.card-header {
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  background: linear-gradient(135deg, #222e3c, #3498db);
  color: #fff;
}

.star-rating {
  display: inline-flex;
  gap: 0.5rem;
}

.star-button {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  outline: none;
}

.star-button:focus {
  box-shadow: none;
}
</style>