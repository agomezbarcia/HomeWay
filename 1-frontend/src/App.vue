<!-- LAYOUT PRINCIPAL DE LA INSTANCIA VUE -->
<template>
  <div id="appInner">
    <!-- Componente Toast para notificaciones -->
    <Toast />
    <!-- Vista del router para renderizar componentes según la ruta -->
    <router-view />
  </div>
</template>

<script setup>
// =======================
// IMPORTACIONES
// =======================
import { Tooltip } from "bootstrap";
import { ref, onMounted, onBeforeUnmount } from "vue";
import Toast from "@/components/commons/Toast";
import { useCommonStore } from "@/stores/CommonVuex";
import { useEventsStore } from "@/stores/EventsVuex";
import { useUsersStore } from '@/stores/UsersVuex'; 

// =======================
// VARIABLES Y STORES
// =======================
const commonStore = useCommonStore();
const eventsStore = useEventsStore();
const usersStore = useUsersStore();

// =======================
// FUNCIONES Y MÉTODOS
// =======================

/**
 * Obtiene y actualiza los parámetros de pantalla.
 */
const fetchScreenParams = async () => {
  try {
    await commonStore.a_getScreenParams();
  } catch (error) {
    console.error(error);
  }
};

/**
 * Maneja el evento de cambio de tamaño de la ventana.
 */
const handleResize = () => {
  fetchScreenParams();
};

// =======================
// CICLO DE VIDA Y EVENTOS
// =======================
onMounted(() => {
  // Suscribirse al cambio de resolución si aún no se ha obtenido
  if (commonStore.screenResolution.width === 0) {
    fetchScreenParams();
  }
  window.addEventListener("resize", handleResize, true);

  // Obtener datos del usuario si existe un token
  if(usersStore.token){
    usersStore.v_getselfdata().then(response => {
      if(response.data.localStorage){
        setLocalStorage(response.data.localStorage);
      }
    }).catch(err => {
      console.log(err);
    });
  }
});

onBeforeUnmount(() => {
  // Eliminar el listener de resize al desmontar el componente
  window.removeEventListener("resize", handleResize, true);
});
</script>

<style>
/* =======================
   ESTILOS PRINCIPALES
   ======================= */

/* El div principal ocupa todo el ancho y alto de la pantalla */
#appInner {
  height: 100vh;
  width: 100vw;
  overflow-x: hidden;
}

/* Fuente y estilos generales del body */
body {
  font-family: "Open Sans", sans-serif;
  color: #333;
  font-weight: 400;
  background-color: #f2f2f2;
  font-size: 100%;
}
</style>