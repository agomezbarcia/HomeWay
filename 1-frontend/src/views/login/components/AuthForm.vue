<template>
  <!-- Formulario de login con validación y manejo de envío -->
  <form
    :class="formValidate ? 'was-validated' : 'needs-validation'"
    class="mx-4"
    novalidate
    @submit="subLogin"
  >
    <!-- Campo de usuario/email -->
    <Input
      type="text"
      v-model="key"
      id="key"
      minlength="1"
      label="* Usuario / Email"
      invalid="Introduzca un email válido"
      icon="bi bi-envelope-at fs-5"
      :required="true"
    />

    <!-- Campo de contraseña con botón para mostrar/ocultar -->
    <Input
      type="password"
      v-model="password"
      id="password"
      minlength="6"
      label="* Introduzca su clave de acceso"
      invalid="La contraseña debe tener al menos 6 caracteres"
      icon="bi bi-key-fill fs-5"
      :required="true"
    >
      <span
        class="input-group-text text-center revealPassword rounded-end"
        @click="revealPassword"
      >
        <i
          class="bi bi-eye-slash-fill fs-5 eye"
          id="show_eye"
          title="Pulse para mostrar la contraseña"
        ></i>
        <i
          class="bi bi-eye d-none fs-5 eye"
          id="hide_eye"
          title="Pulse para ocultar la contraseña"
        ></i>
      </span>
    </Input>

    <!-- Botón de envío -->
    <div class="col d-flex justify-content-center mb-4">
      <button
        class="col-12 col-sm-12 col-md-10 col-lg-12 col-xl-6 btn btn-lg btn-primary btnSubmit"
        type="submit"
        title="Enviar datos de acceso"
      >
        Acceder
      </button>
    </div>
  </form>
</template>

<script>
import Input from "@/components/commons/Input";
import { useUsersStore } from '@/stores/UsersVuex';

export default {
  components: {
    Input,
  },
  data() {
    return {
      key: "", // Usuario o email
      password: "", // Contraseña
      formValidate: false, // Estado de validación del formulario
    };
  },
  methods: {
    /**
     * Cambia el componente para Recuperar Contraseña.
     * Usa $emit para notificar al componente padre.
     */
    recoverMode() {
      this.$emit("changeForm", "recover-form");
    },

    /**
     * Envía los datos de login a la API.
     * Valida los campos antes de enviar.
     * Si el login es exitoso, redirige a la página principal.
     * @param {Event} e Evento de submit del formulario
     */
    subLogin(e) {
      e.preventDefault(); // Prevenir acción por defecto
      this.formValidate = true;

      // Validar campos antes de enviar
      if (
        this.password.length > 5 &&
        this.key.length > 0
      ) {
        let data = {
          key: this.key,
          password: this.password,
        };

        // Llamar a la acción de login del store
        useUsersStore().login(data)
          .then(res => {
            if (res.data) {
              // Redirigir al home si el login es correcto
              this.$router.push({ name: "homes" });
            }
          })
          .catch(err => {
            console.log("Error: " + err)
          });
      }
    },

    /**
     * Muestra u oculta la contraseña en el campo de input.
     * Cambia los iconos de ojo según el estado.
     */
    revealPassword() {
      var inputField = document.getElementById("password");
      var show_eye = document.getElementById("show_eye");
      var hide_eye = document.getElementById("hide_eye");
      hide_eye.classList.remove("d-none");
      if (inputField.type === "password") {
        inputField.type = "text";
        show_eye.style.display = "none";
        hide_eye.style.display = "block";
      } else {
        inputField.type = "password";
        show_eye.style.display = "block";
        hide_eye.style.display = "none";
      }
    },
  },
};
</script>

<style scoped>
/* Estilos para el campo de contraseña */
#password {
  border-top-right-radius: 0 !important;
  border-bottom-right-radius: 0 !important;
}

/* Estilos para los iconos de ojo */
.eye {
  min-width: 20px !important;
}

/* Estilos para las opciones de recuperación */
.options {
  font-size: 0.8rem;
  color: #333333;
  margin: 0vh auto 0vh auto;
  cursor: pointer;
  font-weight: 400;
  transition: color 0.5s ease-out;
}

.options:hover {
  color: #d15318;
}

/* Estilo para el botón de mostrar/ocultar contraseña */
.revealPassword {
  cursor: pointer;
  border-left: none;
}
</style>
