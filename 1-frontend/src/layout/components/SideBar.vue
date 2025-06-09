<template>
  <div class="border-end bg-white" id="sidebar-wrapper">
    <a class="sidebar-brand" style="text-decoration: none">
      <span class="align-middle text-uppercase">HOMEWAY</span>
      <br />
      <span style="font-size: 0.7rem">{{ panelVersion }}</span>
    </a>
    <ul class="sidebar-nav">
      <li class="sidebar-header text-uppercase">Opciones generales</li>

      <router-link :to="{ name: 'homes' }" class="routerLink">
        <li
          class="sidebar-item"
          :class="{ active: isCurrentRoute('homes') }"
        >
          <a class="sidebar-link" v-if="allowedRoute('PROPERTY_SEE', 'admin')">
            <i
              class="bi bi-map me-2 opacity-50"
              data-theme-icon="bi-map"
            ></i>
            <span class="align-middle">Homes</span>
          </a>
        </li>
      </router-link>

      <router-link :to="{ name: 'reservas' }" class="routerLink">
        <li
          class="sidebar-item"
          :class="{ active: isCurrentRoute('reservas') }"
        >
          <a class="sidebar-link" v-if="allowedRoute('RENTAL', 'admin')">
            <i
              class="bi bi-file-earmark-text me-2 opacity-50"
              data-theme-icon="bi-file-earmark-text"
            ></i>
            <span class="align-middle">Alquileres</span>
          </a>
        </li>
      </router-link>

      <li
        class="sidebar-header text-uppercase"
        v-if="allowedRoute('USER_SEE', 'admin')"
      >
        Administración
      </li>

      <router-link :to="{ name: 'usuarios' }" class="routerLink">
        <li
          class="sidebar-item"
          :class="{ active: isCurrentRoute('usuarios') }"
        >
          <a class="sidebar-link" v-if="allowedRoute('USER_SEE', 'admin')">
            <i
              class="bi bi-people me-2 opacity-50"
              data-theme-icon="bi-people"
            ></i>
            <span class="align-middle">Usuarios</span>
          </a>
        </li>
      </router-link>

      <router-link :to="{ name: 'logs' }" class="routerLink">
        <li
          class="sidebar-item"
          :class="{ active: isCurrentRoute('logs') }"
        >
          <a class="sidebar-link" v-if="allowedRoute('PANEL_ADMIN', 'admin')">
            <i class="bi bi-terminal me-2 opacity-50" data-theme-icon="bi-terminal"></i>
            <span class="align-middle">Logs</span>
          </a>
        </li>
      </router-link>
    </ul>
  </div>
</template>


<script>
/* OJO:: No borrar la clase routerLink puesto que en el componente padre se llama para
         detectar los eventos de toogle
 */
import settings from "@/settings";
import { getUserToken } from "@/utils/auth";
import { parseJwt } from "@/utils/general";

export default {
  data() {
    return {
      currentRoute: null,
    };
  },
  watch: {
    $route(to, from) {
      this.currentRoute = to.name;
    },
  },
  computed: {
    panelVersion: function () {
      return settings?.template?.panelVersion
        ? "V" + settings.template.panelVersion
        : "V0.0";
    },
  },
  mounted() {
    this.currentRoute = this.$route.name;
  },
  methods: {
    isCurrentRoute(routeName) {
      return this.currentRoute === routeName;
    },
    allowedRoute(route, title) {
      const hasToken = getUserToken();
      const decodedToken = parseJwt(hasToken);
      //Si la ruta la tiene permitida se le da paso
      if (
        decodedToken.role.actions.includes(route) ||
        decodedToken.role.alias == settings.template.superuser
      ) {
        return true;
      } else {
        return false;
      }
    },
  },
};
</script>