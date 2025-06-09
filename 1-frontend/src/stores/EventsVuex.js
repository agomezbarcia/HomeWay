import { defineStore } from 'pinia';
import Settings from "@/settings";

// Definimos el store de eventos usando Pinia
export const useEventsStore = defineStore('events', {
  // Estado inicial del store
  state: () => ({
    message: "", // Mensaje recibido por SSE
  }),

  actions: {
    // Acción para suscribirse a eventos SSE
    subscribe() {
      try {
        // Creamos una nueva conexión EventSource usando la URL de configuración
        const eventSource = new EventSource(Settings.template.site.eventsurl);

        // Manejador para mensajes recibidos
        eventSource.onmessage = (event) => {
          // Por criterio en este proyecto solo nos comunicamos por JSON
          // así que lo parseamos a su llegada
          this.message = JSON.parse(event.data);
        };

        // Manejador de errores en la conexión SSE
        eventSource.onerror = (error) => {
          console.error('Error en la conexión SSE:', error);
          eventSource.close();

          // Intentar reconexión después de un tiempo
          setTimeout(() => {
            this.subscribe();
          }, 5000); // Intentar reconexión después de 5 segundos (ajusta según tus necesidades)
        };

      } catch (error) {
        // Propagamos el error para que pueda ser manejado externamente
        throw error;
      }
    },
  }
});