/* =========================
  IMPORTACIONES
  ========================= */
import axios from "axios";
import settings from "@/settings";
import router from "@/router";
import { useUsersStore } from "@/stores/UsersVuex";
import { useToastStore } from "@/stores/ToastVuex";

/* =========================
  INSTANCIANDO AXIOS Y SU CONFIG INICIAL
  ========================= */
const service = axios.create({
  baseURL: settings.template.site.apiurl, // URL base de la API
  timeout: 60000, // Timeout de la petición (60 segundos)
  headers: {
   "Content-type": "application/json"
  }
});

/* =========================
  INTERCEPTOR DE PETICIONES AXIOS
  ========================= */
// Intercepta cada petición para añadir el token de autenticación si existe
service.interceptors.request.use(
  config => {
   const usersStore = useUsersStore();

   // Añade el token al header si está disponible
   if (usersStore.token) {
    config.headers['x-access-token'] = usersStore.token;
   }

   return config;
  },
  error => {
   // Manejo de errores en la petición
   return Promise.reject(error);
  }
);

/* =========================
  INTERCEPTOR DE RESPUESTAS AXIOS
  ========================= */
// Maneja las respuestas de la API y muestra mensajes personalizados según el código recibido
service.interceptors.response.use(
  response => {
   // Códigos personalizados de la API:
   // 2000: Operación correcta, mostrar TOAST
   // 2001: Operación correcta, no mostrar TOAST
   // 3000: Operación incorrecta, mostrar TOAST
   // 3001: Operación incorrecta, no mostrar TOAST
   // 4000: Operación bloqueada, mostrar TOAST

   if (response.data.code === 2000) {
    useToastStore().showMessage({
      message: response.data.message,
      style: "success"
    });
    return response.data;
   } else if (response.data.code === 2001) {
    return response.data;
   } else if (response.data.code === 3000) {
    useToastStore().showMessage({
      message: response.data.message,
      style: "error"
    });
    return response.data;
   } else if (response.data.code === 3001) {
    return response.data;
   } else if (response.data.code === 4000) {
    useToastStore().showMessage({
      message: response.data.message,
      style: "error"
    });
    return response.data;
   } else {
    // Si el código no es relevante, devuelve la respuesta completa
    return response;
   }
  },
  error => {
   // Manejo de errores HTTP estándar

   // 400: Petición malformada
   if (error.response.status === 400) {
    useToastStore().showMessage({
      message: error.response.data.message,
      style: "error",
    });
   }

   // 401: No autorizado, redirige a logout
   if (error.response.status === 401) {
    useToastStore().showMessage({
      message: error.response.data.message,
      style: "error",
    });
    router.push({ name: "logout" });
   }

   // 403: Prohibido
   if (error.response.status === 403) {
    useToastStore().showMessage({
      message: error.response.data.message,
      style: "error",
    });
   }

   // 404: No encontrado
   if (error.response.status === 404) {
    useToastStore().showMessage({
      message: error.response.data.message,
      style: "error",
    });
   }

   // 500: Error interno del servidor
   if (error.response.status === 500) {
    useToastStore().showMessage({
      message: "500: Error en la comunicación con la API",
      style: "error",
    });
   }

   // 502: Bad Gateway
   if (error.response.status === 502) {
    useToastStore().showMessage({
      message: "502: Error en la comunicación con la API",
      style: "error",
    });
   }

   return Promise.reject(error);
  }
);

/* =========================
  EXPORTACIÓN DEL SERVICIO AXIOS
  ========================= */
export default service;
