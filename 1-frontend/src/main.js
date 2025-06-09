// Habilita detalles de desincronización de hidratación en producción
window.__VUE_PROD_HYDRATION_MISMATCH_DETAILS__ = true;

// Importaciones principales de Vue y librerías asociadas
import { createApp } from 'vue';
import App from './App.vue';
import { createPinia } from 'pinia';
import router from '@/router';

// Importación de estilos y librerías de UI
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

// Importaciones opcionales para Leaflet y sus componentes
/*
import "leaflet/dist/leaflet.css";
import "leaflet.locatecontrol/dist/L.Control.Locate.min.css";
import "leaflet.fullscreen/Control.FullScreen.css";
*/

// Instanciación de la aplicación Vue
const app = createApp(App);

// Registro de plugins en la instancia de Vue
app.use(router);
app.use(createPinia());

// Montaje de la aplicación en el elemento #app
app.mount('#app');
