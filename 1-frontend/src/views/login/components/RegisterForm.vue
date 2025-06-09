<template>
  <!-- Formulario de registro -->
  <form
    :class="formValidate ? 'was-validated' : 'needs-validation'"
    class="mx-4"
    novalidate
    @submit.prevent="performAction"
  >
    <!-- Nombre y Apellidos -->
    <div class="row">
      <div class="col-6">
        <Input
          type="text"
          v-model="user.info.name"
          :id="id + '-name'"
          label="* Nombre"
          invalid="Introduzca un nombre válido"
          pattern="[A-Za-z .ñÑáéíóúÁÉÍÓÚ]{3,}"
          icon="bi bi-person-fill fs-5"
          :required="true"
        />
      </div>
      <div class="col-6">
        <Input
          type="text"
          v-model="user.info.surname"
          :id="id + '-surname'"
          label="* Apellidos"
          invalid="Introduzca apellidos válidos"
          pattern="[A-Za-z .ñÑáéíóúÁÉÍÓÚ]{3,}"
          icon="bi bi-people-fill fs-5"
          :required="true"
        />
      </div>
    </div>

    <!-- Email y Nombre de usuario -->
    <div class="row">
      <div class="col-6">
        <Input
          type="email"
          v-model="user.info.email"
          :id="id + '-email'"
          label="* Email"
          invalid="Introduzca un email válido"
          icon="bi bi-envelope-at fs-5"
          :required="true"
          placeholder="alguien@algo.com"
        />
      </div>
      <div class="col-6">
        <Input
          type="text"
          v-model="user.info.username"
          :id="id + '-username'"
          label="* Nombre de usuario"
          invalid="Introduzca un usuario válido"
          icon="bi bi-person-circle fs-5"
          :required="true"
        />
      </div>
    </div>

    <!-- Contraseña y Confirmación -->
    <div class="row">
      <div class="col-6">
        <Input
          :id="id + '-password'"
          type="password"
          v-model="user.info.password"
          label="* Contraseña"
          invalid="Mínimo 6 caracteres"
          pattern=".{6,15}"
          icon="bi bi-key-fill fs-5"
        >
          <!-- Botón para mostrar/ocultar contraseña -->
          <span
            class="input-group-text text-center revealPassword rounded-end"
            @click="revealPassword"
          >
            <i
              class="bi bi-eye-slash-fill fs-5 eye"
              id="show_eye"
              title="Mostrar contraseña"
            ></i>
            <i
              class="bi bi-eye d-none fs-5 eye"
              id="hide_eye"
              title="Ocultar contraseña"
            ></i>
          </span>
        </Input>
      </div>
      <div class="col-6">
        <Input
          :id="id + '-repassword'"
          v-model="repassword"
          type="password"
          label="* Confirmar contraseña"
          invalid="Las contraseñas no coinciden"
          icon="bi bi-key-fill fs-5"
          :disabled="!user.info.password"
          @input="validarPass"
        />
      </div>
    </div>

    <!-- Selección de tipo de usuario -->
    <div class="mb-3 d-flex justify-content-center align-items-center">
      <span class="me-3 form-label">Registrarse como:</span>
      <div class="btn-group" role="group" aria-label="Tipo de usuario">
        <button
          v-for="option in userTypeOptions"
          :key="option.value"
          type="button"
          :class="['btn', 'btn-outline-primary', { 'active': userType === option.value }]"
          @click="handleUserTypeChange(option.value)"
        >
          {{ option.label }}
        </button>
      </div>
    </div>

    <!-- Información adicional para anfitrión -->
    <div v-if="user.info.isHost" class="mt-4">
      <h5 class="text-center mb-3">Información de Anfitrión</h5>
      <div class="row">
        <div class="col-6">
          <Input
            type="email"
            v-model="user.info.hostProfile.paypalEmail"
            label="* Email de PayPal"
            :id="id + '-paypal'"
            invalid="Email PayPal requerido"
            icon="bi bi-paypal fs-5"
            :required="user.info.isHost"
          />
        </div>
        <div class="col-6">
          <Input
            type="tel"
            v-model="user.info.hostProfile.phoneNumber"
            label="* Teléfono"
            :id="id + '-phone'"
            pattern="\d{9,15}"
            invalid="9-15 dígitos"
            icon="bi bi-phone-fill fs-5"
            :required="user.info.isHost"
          />
        </div>
      </div>
      <div class="row">
        <div class="col-6">
          <Input
            type="text"
            v-model="user.info.hostProfile.governmentId"
            label="* DNI"
            :id="id + '-dni'"
            placeholder="12345678X"
            invalid="DNI inválido"
            icon="bi bi-person-badge-fill fs-5"
            @input="validarDNI"
            :required="user.info.isHost"
          />
        </div>
        <div class="col-6">
          <Input
            type="textarea"
            v-model="user.info.hostProfile.bio"
            label="Biografía"
            :id="id + '-bio'"
            :maxlength="500"
            invalid="Máximo 500 caracteres"
            icon="bi bi-file-text-fill fs-5"
          />
        </div>
      </div>
    </div>

    <!-- Botón de envío -->
    <div class="col d-flex justify-content-center mb-4">
      <button
        class="col-12 col-sm-12 col-md-10 col-lg-12 col-xl-6 btn btn-lg btn-primary btnSubmit"
        type="submit"
        title="Enviar datos de acceso"
      >
        Registrarse
      </button>
    </div>
  </form>
</template>

<script>
import Input from "@/components/commons/Input";
import UserService from "@/services/UserService";
import MailerService from "@/services/MailerService";
import { useUsersStore } from '@/stores/UsersVuex';
import { useToastStore } from "@/stores/ToastVuex";

export default {
  // Props del componente
  props: {
    id: {
      type: String,
      required: true,
      default: "register-form"
    }
  },
  // Estado local del componente
  data() {
    return {
      user: {
        info: {
          isHost: false,
          hostProfile: {
            paypalEmail: '',
            bio: '',
            phoneNumber: '',
            governmentId: ''
          },
          status: false
        }
      },
      idRoleSelected: null,
      repassword: "",
      formValidate: false,
      userType: "guest",
      userTypeOptions: [
        { label: 'Huésped', value: 'guest' },
        { label: 'Anfitrión', value: 'host' }
      ],
    };
  },
  // Ciclo de vida: al montar el componente
  mounted() {
    useUsersStore().v_getRoleList().then(() => {
      this.handleUserTypeChange(this.userType);
    });
  },
  // Componentes hijos
  components: { Input },
  // Computed properties
  computed: {
    v_rolesList() {
      return useUsersStore().v_rolesList;
    }
  },
  // Observadores
  watch: {
    idRoleSelected(val) {
      this.user.role = val;
    }
  },
  // Métodos del componente
  methods: {
    // Acción principal al enviar el formulario
    performAction(e) {
      this.formValidate = true;
      if (this.validateForm()) {
        this.registerUser();
      }
    },

    // Validación general del formulario
    validateForm() {
      return this.user.info.password === this.repassword &&
        (!this.user.info.isHost || this.validateHostProfile());
    },

    // Validación de campos específicos para anfitrión
    validateHostProfile() {
      return this.user.info.hostProfile.governmentId.match(/^[0-9]{8}[A-Z]$/) &&
        this.user.info.hostProfile.paypalEmail.includes('@') &&
        this.user.info.hostProfile.phoneNumber.length >= 9;
    },

    // Validación de formato y letra del DNI
    validarDNI(e) {
      const dni = e.target.value.toUpperCase();
      if (!/^[0-9]{8}[A-Z]$/.test(dni)) {
        e.target.setCustomValidity('Formato DNI inválido');
        return;
      }
      const letras = 'TRWAGMYFPDXBNJZSQVHLCKE';
      const letraCalculada = letras[parseInt(dni.substr(0, 8)) % 23];
      e.target.setCustomValidity(dni[8] !== letraCalculada ? 'Letra incorrecta' : '');
    },

    // Validación de coincidencia de contraseñas
    validarPass() {
      if (this.user.info.password !== this.repassword) {
        document.getElementById(`${this.id}-repassword`).setCustomValidity("Las contraseñas no coinciden");
      } else {
        document.getElementById(`${this.id}-repassword`).setCustomValidity("");
      }
    },

    // Mostrar/ocultar contraseña
    revealPassword() {
      const passwordFields = ['password', 'repassword'].map(f => `${this.id}-${f}`);
      passwordFields.forEach(id => {
        const field = document.getElementById(id);
        field.type = field.type === 'password' ? 'text' : 'password';
      });
      document.querySelectorAll('.eye').forEach(icon => icon.classList.toggle('d-none'));
    },

    // Cambio de tipo de usuario y asignación de rol
    handleUserTypeChange(selectedValue) {
      this.userType = selectedValue;
      this.user.info.isHost = (selectedValue === 'host');

      const targetRole = this.v_rolesList.find(role => {
        if (this.userType === 'host') {
          return role.alias === 'Anfitrión';
        } else if (this.userType === 'guest') {
          return role.alias === 'Huésped';
        }
      });

      if (targetRole) {
        this.idRoleSelected = targetRole._id;
      }
      this.user.info.role = this.idRoleSelected;
    },

    // Registro de usuario y envío de email de confirmación
    registerUser() {
      UserService.createUser(this.user)
        .then((response) => {
          MailerService.sendConfirmationEmail(this.user.info.email, response.userId)
          if (response.code === 2000) {
            this.resetForm();
            useToastStore().showMessage({
              message: "Registro exitoso. Revisa tu correo para confirmar tu cuenta.",
              style: "success"
            });
            this.$emit('mostrarLogin');
          } else {
            useToastStore().showMessage({
              message: "Error al enviar email de confirmación.",
              style: "error"
            });
          }
        })
        .catch(console.error);
    },

    // Reiniciar formulario tras registro
    resetForm() {
      this.user = {
        info: {
          isHost: false,
          hostProfile: {
            paypalEmail: '',
            bio: '',
            phoneNumber: '',
            governmentId: ''
          },
          status: false
        }
      };
      this.repassword = "";
      this.formValidate = false;
    }
  }
};
</script>

<style scoped>
.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #333333;
}

.revealPassword {
  cursor: pointer;
  border-left: none;
}

.btn-outline-primary.active {
  background-color: #0d6efd;
  color: white !important;
}

h5 {
  color: #666;
  font-size: 1.1rem;
  border-bottom: 1px solid #ddd;
  padding-bottom: 0.5rem;
}
</style>

<style lang="scss">
@include color-mode(dark) {
  .form-label,
  h5 {
    color: var(--bs-primary-text-emphasis);
  }
}
</style>