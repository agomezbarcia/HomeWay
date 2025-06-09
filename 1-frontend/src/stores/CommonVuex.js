// Importa la función defineStore desde pinia
import { defineStore } from 'pinia';

// Define y exporta el store común usando Pinia
export const useCommonStore = defineStore('common', {
  // Estado inicial del store
  state: () => ({
    screenResolution: {
      width: 0,
      height: 0
    }
  }),

  // Acciones del store
  actions: {
    // Obtiene los parámetros de la pantalla y los guarda en el estado
    a_getScreenParams() {
      const data = {
        width: window.innerWidth,
        height: window.innerHeight
      };
      this.screenResolution = data;
      return true;
    }
  }
});