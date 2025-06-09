<template>
  <div id="page-content-wrapper">
    <!-- Top navigation-->
    <nav class="navbar navbar-expand-lg">
      <div class="container-fluid">
        <!-- No borrar la clase sidebarToggle:: referencia con listeners para el menu-->
        <h3
          class="ms-3 cursor-pointer sidebarToggle"
          title="Desplegar menú"
        >
          <i class="bi bi-list"></i>
        </h3>
        <Breadcrumb class="ms-4 mt-2 d-none d-lg-inline"/>
        <!-- DROPDOWN -->
        <div class="navbar-collapse d-flex flex-wrap position-relative" id="navbarSupportedContent">
          <ul class="navbar-nav ms-auto mt-2 mt-lg-0 ">
            <li class="nav-item me-2" title="Alertas">
              <button
                class="btn btn-link nav-link py-2 px-0 px-lg-2"
                type="button"
              >
                <i
                  class="bi-bell"
                  data-theme-icon-active="bi-bell"
                ></i>
              </button>
            </li>          
            <li class="nav-item me-2"><ThemeMode /></li>
            <li class="nav-item dropdown">
              <dropdown-layout title="Menú de usuario" />
            </li>
          </ul>
        </div>
        <!-- DROPDOWN -->
      </div>
    </nav>
    <!-- Page content-->
    <div class="container-fluid">
      <router-view v-slot="{ Component, route }">
        <!-- Use any custom transition and  to `fade` -->
        <transition name="fade" mode="out-in">
          <component :is="Component" :key="route.path"/>
        </transition>
      </router-view>
    </div>
  </div>
</template>


<script>
import Breadcrumb from "./extras/Breadcrumb";
import Dropdown from "./extras/Dropdown";
import ThemeMode from "@/layout/components/extras/ThemeMode";

export default {
  data() {
    return {};
  },
  computed: {},
  components: {
    "dropdown-layout": Dropdown,
    ThemeMode,
    Breadcrumb
  },
  mounted() {},
};
</script>