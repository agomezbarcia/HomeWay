import { defineStore } from 'pinia';

// Definimos el store 'toast' usando Pinia
export const useToastStore = defineStore('toast', {
  // Estado inicial del store
  state: () => ({
    message: null, // Mensaje a mostrar en el toast
    style: null,   // Estilo del toast (por ejemplo, éxito, error, etc.)
    display: false // Indica si el toast se muestra o no
  }),

  // Acciones del store
  actions: {
    // Muestra un mensaje en el toast
    showMessage(data) {
      this.message = data.message;
      this.style = data.style;
      this.display = !this.display;
    }
  }
});