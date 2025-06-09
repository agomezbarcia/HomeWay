<template>
  <!-- INICIO DEL LAYOUT PRINCIPAL -->
  <div class="d-flex" id="wrapper">
    <!--Content-->
    <sidebar />
    <main-section />
    <go-to-top />
    <!--Content-->
  </div>
  <!-- FIN DEL LAYOUT PRINCIPAL -->
</template>

<script>
import { useCommonStore } from "@/stores/CommonVuex";
import SideBar from "./components/SideBar";
import MainSection from "./components/MainSection";
import GoToTop from "./components/extras/GoToTop.vue";

export default {
  data() {
    return {
      applyBlur: false,
    };
  },
  components: {
    sidebar: SideBar,
    "main-section": MainSection,
    "go-to-top": GoToTop,
  },
  methods: {},
  mounted() {
    const sidebarToggle = document.querySelectorAll(
      ".sidebarToggle, .routerLink"
    );
    if (sidebarToggle) {
      sidebarToggle.forEach((element) => {
        element.addEventListener("click", (event) => {
          event.preventDefault();
          // Casusisticas para el responsive mode, que al pulse el item se auto-oculte el menú
          if (useCommonStore().screenResolution.width <= 576 && (element.classList.contains("routerLink")) || (element.classList.contains("sidebarToggle"))) {
            document.body.classList.toggle("sb-sidenav-toggled");
            localStorage.setItem(
              "sb|sidebar-toggle",
              document.body.classList.contains("sb-sidenav-toggled")
            );
          }
        });
      });
    }
  },
};
</script>

<style lang="css">
@import "~@/assets/css/main.css";
@import "~@/assets/css/theme.css";
</style>

<style lang="scss">
@import "~@/assets/scss/custom.scss";
</style>