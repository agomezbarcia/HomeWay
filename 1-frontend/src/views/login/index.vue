<template>
  <section class="min-vh-100 d-flex flex-column justify-content-center align-items-center p-3">
    <video ref="videoBackground" class="d-none d-lg-inline video-background" autoplay loop muted playsinline>
      <source src="~@/assets/video/edificios.mp4" type="video/mp4" />
      Tu navegador no admite la etiqueta de video.
    </video>

    <div class="card w-100 maxw-1200">
      <div class="container-fluid h-custom">
        <div class="row g-0 d-flex justify-content-center align-items-center h-100">
          <!-- Columna de imagen (oculta en móviles) -->
          <div v-if="showAuthForm && !showLoading" class="d-none d-lg-block col-lg-6">
            <img src="~@/assets/img/login_bg.png" class="img-fluid rounded" alt="Homeway logo" />
          </div>

          <!-- Columna de formulario: ocupa 6 columnas si hay imagen, 12 si no -->
          <div
            :class="['p-4 d-flex justify-content-center align-items-center', showAuthForm ? 'col-12 col-lg-6' : 'col-12']">
            <div class="w-100" :style="showAuthForm ? 'max-width: 500px' : 'max-width: 800px'">
              <!-- Loader -->
              <div :class="showLoading ? 'd-block d-flex justify-content-center align-items-center' : 'd-none'">
                <img src="~@/assets/img/login-loader.svg" class="loader-mobile" />
              </div>

              <!-- Contenido -->
              <div :class="showLoading ? 'd-none' : 'd-block'">
                <div class="themeSelector">
                  <ThemeMode></ThemeMode>
                </div>

                <div class="m-3 m-md-5 d-flex flex-wrap justify-content-center">
                  <img :src="logoSource" class="logo-main" />
                </div>

                <auth-form v-if="showAuthForm"></auth-form>
                <div class="w-100 text-center my-3" v-if="showAuthForm">
                  {{ '¿No tienes cuenta? ' }}
                  <a href="#" style="text-decoration: none;" @click="changeForm()">
                    {{ 'Regístrate ' }}<i class="fas fa-user-plus"></i>
                  </a>
                </div>

                <register-form v-if="showRegisterForm" @mostrarLogin="changeForm()"></register-form>
                <div class="w-100 text-center my-3" v-if="showRegisterForm">
                  {{ 'Volver a ' }}
                  <a href="#" style="text-decoration: none;" @click="changeForm()">
                    {{ 'Iniciar Sesión ' }}<i class="fas fa-sign-in-alt"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import AuthForm from "./components/AuthForm";
import RegisterForm from "./components/RegisterForm";
import ThemeMode from "@/layout/components/extras/ThemeMode";

export default {
  data() {
    return {
      showLoading: true,
      showAuthForm: false,
      showRegisterForm: false,
      storedTheme: localStorage.getItem("theme")
    };
  },
  components: {
    "auth-form": AuthForm,
    "register-form": RegisterForm,
    ThemeMode
  },
  mounted() {
    setTimeout(() => {
      this.showLoading = false;
    }, 1500);
    this.showAuthForm = true;
    // Configurar observador de cambios de tema
    this.setupThemeObserver();
  },
  methods: {
    setupThemeObserver() {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.attributeName === 'data-bs-theme') {
            this.storedTheme = document.documentElement.getAttribute('data-bs-theme');
          }
        });
      });

      observer.observe(document.documentElement, {
        attributes: true
      });
    },
    changeForm() {
      this.showLoading = true;
      this.showAuthForm = !this.showAuthForm;
      this.showRegisterForm = !this.showRegisterForm;
      setTimeout(() => {
        this.showLoading = false;
      }, 1500);
    }
  },
  computed: {
    logoSource() {
      return this.storedTheme == 'light'
        ? require('@/assets/img/logo-HomeWay-light.png')
        : require('@/assets/img/logo-HomeWay-dark.png');
    }
  }
};
</script>

<style scoped>
/* Ajustes generales */
.maxw-1200 {
  max-width: 1200px;
}

.loader-mobile {
  height: 200px;
}

/* Logos principales */
.logo-main {
  max-height: 150px;
  width: auto;
}

/* Video background */
.video-background {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  min-width: 100%;
  min-height: 100%;
  z-index: -1;
  opacity: 0.8;
  filter: brightness(0.6);
}

.themeSelector {
  position: absolute;
  top: 10px;
  right: 10px;
  zoom: 1.1;
}

/* Media para móvil */
@media (max-width: 992px) {
  .card {
    box-shadow: none !important;
    background: transparent !important;
  }

  .loader-mobile {
    height: 150px;
  }

  .logo-main {
    max-height: 50px;
  }

  .logo-europa {
    max-height: 60px;
  }

  .themeSelector {
    top: 5px;
    right: 5px;
    zoom: 0.9;
  }
}

@media (max-width: 576px) {
  section {
    padding: 1rem;
  }
}
</style>