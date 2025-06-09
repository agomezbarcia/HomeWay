<template>
  <div :id="id" :mode="mode">
    <form @submit.prevent="performAction" @reset="resetValues">
      <div :class="frameless ? 'pe-3 pe-md-0' : 'card custPadding'">
        <div :class="frameless ? '' : 'card-body me-2'">
          <h4 class="text-center">{{ formTitle }}</h4>
          <hr />
          <div class="row mt-4 ms-1">
            <div class="col-md-6 col-12">
              <Input type="email" v-model="user.info.email" :id="id + '-email'" label="* Email"
                invalid="Introduzca un email válido" title="Correo electrónico válido" :required="true"
                autocomplete="off" placeholder="alguien@algo.com" icon="fas fa-at"
                :disabled="mode !== 'edit' && mode != 'add' && mode != 'register'" />
            </div>
            <div class="col-md-6 col-12">
              <Input type="text" v-model="user.info.username" :id="id + '-username'" label="* Nombre de usuario"
                invalid="Introduzca un nombre de usuario válido" title="Nombre de usuario" :required="true"
                autocomplete="off" icon="fas fa-user" :disabled="mode == 'profile' || mode == 'edit' ? true : false" />
            </div>
            <div class="col-md-6 col-12">
              <Input type="text" v-model="user.info.name" :id="id + '-name'" label="* Nombre"
                invalid="Introduzca un nombre válido" :required="true" pattern="[A-Za-z .ñÑáéíóúÁÉÍÓÚ]{3,}"
                title="Debe tener 3 o más letras" icon="fas fa-user" />
            </div>
            <div class="col-md-6 col-12">
              <Input type="text" v-model="user.info.surname" :id="id + '-surname'" label="* Apellidos"
                invalid="Introduzca sus apellidos" pattern="[A-Za-z .ñÑáéíóúÁÉÍÓÚ]{3,}"
                title="Debe tener 3 o más letras" icon="far fa-user" />
            </div>
          </div>
        </div>
      </div>

      <div :class="frameless ? 'pe-3 pe-md-0' : 'card col-lg-12 mt-3 custPadding'">
        <div :class="frameless ? '' : 'card-body me-2'">
          <h5 v-if="!frameless">Contraseña de acceso</h5>
          <div class="row ms-1">
            <div class="col-md-6">
              <Input :id="id + '-password'" type="password" v-model="user.info.password" label="* Contraseña"
                invalid="La contraseña debe tener al menos 6 caracteres"
                title="La contraseña debe tener entre 6 y 15 caracteres" pattern=".{6,15}"
                :required="mode == 'add' || mode == 'register' ? true : false" @input="vaciarRepass"
                icon="fas fa-key" />
            </div>
            <div class="col-md-6">
              <Input :id="id + '-repassword'" v-model="repassword" type="password" label="* Repita la contraseña"
                title="Introduzca la contaseña otra vez" invalid="Las contraseñas introducidas no coinciden"
                :required="mode == 'add' || mode == 'register' ? true : false" @input="validarPass" icon="fas fa-key" />
            </div>
          </div>
        </div>
      </div>

      <div class="card col-lg-12 mt-3 custPadding" v-if="mode == 'add' || mode == 'edit'">
        <div class="card-body me-2">
          <h5>Tipo de usuario y estado</h5>
          <div class="row mt-4 ms-1">
            <div class="col-md-6">
              <div class="btn-group-vertical w-100" role="group">
                <button v-for="option in userTypeOptions" :key="option.value" type="button"
                  :class="['btn', 'btn-outline-primary', { 'active': userType === option.value }]"
                  @click="handleUserTypeChange(option.value)">
                  {{ option.label }}
                </button>
              </div>
            </div>
            <div class="col-md-6">
              <SwitchBordered v-model="user.info.status" :id="id + '-status'"
                :message="user.info.status ? 'Activa' : 'Inactiva'"
                :claseMessage="user.info.status ? 'activa' : 'inactiva'" label="Establecer la cuenta como" />
            </div>
          </div>
        </div>
      </div>

      <div v-if="user.info.isHost" class="card col-lg-12 mt-3 custPadding">
        <div class="card-body">
          <h5>Información de Anfitrión</h5>
          <div class="row mt-3">
            <div class="col-md-6">
              <Input type="email" v-model="user.info.hostProfile.paypalEmail" label="* Email de PayPal"
                :id="id + '-paypal'" invalid="Introduzca un email válido" icon="fab fa-paypal"
                :required="user.info.isHost" autocomplete="off"/>
            </div>
            <div class="col-md-6">
              <Input type="tel" v-model="user.info.hostProfile.phoneNumber" label="* Teléfono de contacto"
                :id="id + '-phone'" pattern="\d{9,15}" invalid="Teléfono inválido (9-15 dígitos)" icon="fas fa-phone"
                :required="user.info.isHost" />
            </div>
            <div class="col-md-6">
              <Input type="text" v-model="user.info.hostProfile.governmentId" label="* DNI" :id="id + '-dni'"
                invalid="DNI inválido. Formato: 12345678X" icon="fas fa-id-card" :required="user.info.isHost"
                placeholder="12345678X" @input="validarDNI" />
            </div>
            <div class="col-12">
              <Input type="textarea" v-model="user.info.hostProfile.bio" label="Biografía" :id="id + '-bio'"
                :maxlength="500" invalid="Máximo 500 caracteres" icon="fas fa-file-alt" />
            </div>
          </div>
        </div>
      </div>

      <div class="row col-lg-12 col-11 mt-4 mb-4 mx-auto me-5 text-center">
        <div :class="mode == 'add' ? 'col-md-6' : 'col'">
          <button :class="mode == 'add' || mode == 'register'
            ? 'btn btn-lg btn-success col-md-8 col-sm-12 col-12 m-2'
            : 'btn btn-lg btn-primary col-md-8 col-sm-12 col-12 m-2'
            " type="submit">
            <span>{{ submitButtonText }}</span>
          </button>
        </div>
        <div class="col-md-6" v-if="mode == 'add'">
          <button class="btn btn-warning col-md-8 col-sm-12 col-12 m-2" type="reset">
            <i class="fas fa-sync-alt"></i>
            Limpiar formulario
          </button>
        </div>
      </div>

      <div class="backButton" v-if="mode == 'register'">
        <p data-toggle="tooltip" data-placement="bottom" title="Volver" @click="backButton">
          <i class="fas fa-arrow-left"></i> Volver
        </p>
      </div>
    </form>
  </div>
</template>

<script>
import Input from "@/components/commons/Input";
import Select from "@/components/commons/Select";
import UserService from "@/services/UserService";
import SwitchBordered from "@/components/commons/SwitchBordered";
import { useUsersStore } from '@/stores/UsersVuex';
import { useToastStore } from "@/stores/ToastVuex";

export default {
  name: "user-form",
  components: {
    Input,
    Select,
    SwitchBordered,
  },
  props: {
    id: {
      type: String,
      required: true,
    },
    mode: {
      type: String,
      default: "add",
    },
    frameless: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      user: {
        info: {
          isHost: false,
          status: true,
          hostProfile: {
            paypalEmail: '',
            bio: '',
            phoneNumber: '',
            governmentId: ''
          }
        },
        role: null
      },
      _id: null,
      repassword: "",
      idRoleSelected: null,
      userTypeOptions: [
        { label: 'Usuario - Huésped', value: 'guest' },
        { label: 'Usuario - Anfitrión', value: 'host' },
        { label: 'Administrador', value: 'admin' }
      ],
      userType: 'guest'
    };
  },
  // En mounted, inicializar el tipo de usuario después de cargar los roles
  mounted() {
    if (this.mode != "register" && this.mode != "profile") {
      useUsersStore().v_getRoleList().then(() => {
        this.handleUserTypeChange(this.userType);
      });
    } else if (this.mode == "register") {
      this.resetValues();
    }
  },
  methods: {
    performAction(e) {
      e.preventDefault();
      switch (this.mode) {
        case "add":
          this.addNewUser();
          break;
        case "edit":
          this.updateUser();
          break;
        case "register":
          this.registerUser();
          break;
        case "profile":
          this.updateSelf();
          break;
      }
    },
    validarDNI(e) {
      const dni = e.target.value.toUpperCase();
      const formatoValido = /^[0-9]{8}[A-Z]$/.test(dni);

      if (!formatoValido) {
        e.target.setCustomValidity('Formato DNI inválido');
        return;
      }

      // Cálculo de letra (opcional para validación en frontend)
      const letras = 'TRWAGMYFPDXBNJZSQVHLCKE';
      const numero = dni.substr(0, 8);
      const letraCalculada = letras[numero % 23];

      if (dni[8] !== letraCalculada) {
        e.target.setCustomValidity('Letra de DNI incorrecta');
      } else {
        e.target.setCustomValidity('');
      }
    },
    addNewUser() {
      console.log(this.user);
      UserService.createUserByAdmin(this.user)
        .then((response) => {
          this.$emit("refreshList");
          this.resetValues();
          this.$emit("closeAddModal");
        })
        .catch((e) => {
          console.log(e);
        });
    },
    updateUser() {
      let data = this.user;
      if (this._id == useUsersStore().v_userdata._id && !((useUsersStore().v_userdata.role.actions).includes('USER_ADMIN'))) {
        useToastStore().showMessage({
          message: "Error: no se tienen permisos necesarios",
          style: "error"
        });
        this.$emit("closeEditModal");
      } else {
        UserService.updateUser(this._id, { data })
          .then((response) => {
            this.$emit("refreshList");
            this.$emit("closeEditModal");
          })
          .catch((err) => {
            console.log(err);
          });
      }
    },
    registerUser() {
      UserService.createUser(this.user)
        .then((response) => {
          if (response.code == 2000 || response.code == 2001) {
            // Lógica post-registro
          }
        })
        .catch((e) => {
          console.log(e);
        });
    },
    updateSelf() {
      useUsersStore().v_updateSelfData(this.user);
    },
    validarPass(e) {
      if (e.target.checkValidity() || e.target.validity.customError) {
        if (this.user.info.password != this.repassword) {
          e.target.setCustomValidity("Las contraseñas no coinciden");
        } else {
          e.target.setCustomValidity("");
        }
      }
    },
    vaciarRepass() {
      this.repassword = "";
    },
    resetValues() {
      this.user = {
        info: {
          email: '',
          username: '',
          name: '',
          surname: '',
          password: '',
          isHost: false,
          status: true,
          hostProfile: {
            paypalEmail: '',
            bio: '',
            phoneNumber: '',
            governmentId: ''
          }
        },
        role: null
      };
      this.repassword = "";
      this.userType = 'guest';
      this.handleUserTypeChange('guest'); // Asegurar que el rol se actualice
    },
    retrieveData(id) {
      this._id = id;
      UserService.getUser(id)
        .then((response) => {
          // 1. Forzar estructura de hostProfile aunque el usuario no sea anfitrión
          const userData = response.data.info;

          this.user.info = {
            ...userData,
            hostProfile: userData.hostProfile
              ? { ...userData.hostProfile }
              : { phoneNumber: '', governmentId: '', bio: '' }
          };

          // 2. Resetear contraseña para seguridad
          this.user.info.password = null;

          // 3. Actualizar selección de rol
          this.idRoleSelected = response.data.role._id;

          // 4. Determinar tipo de usuario visual
          this.userType = response.data.role.alias === 'Usuario administrador'
            ? 'admin'
            : userData.isHost ? 'host' : 'guest';

          // 5. Sincronizar con el selector de tipo de usuario
          this.handleUserTypeChange(this.userType);
        })
        .catch((err) => {
          console.error("Error cargando usuario:", err);
          useToastStore().showMessage({
            message: "Error al cargar datos del usuario",
            style: "error"
          });
        });
    },
    backButton() {
      // Lógica para volver atrás
    },
    handleUserTypeChange(selectedValue) {
      this.userType = selectedValue;
      this.user.info.isHost = (selectedValue === 'host');

      const targetRole = this.v_rolesList.find(role => {
        if (this.userType === 'admin') {
          return role.alias === 'Usuario administrador';
        } else if (this.userType === 'host') {
          return role.alias === 'Anfitrión';
        } else if (this.userType === 'guest') {
          return role.alias === 'Huésped';
        }
      });

      if (targetRole) {
        this.idRoleSelected = targetRole._id;
      }
      this.user.info.role = this.idRoleSelected;
    }
  },
  computed: {
    formTitle() {
      switch (this.mode) {
        case "add": return "Datos del nuevo usuario";
        case "edit": return "Datos del usuario a modificar";
        case "register": return "Datos de la nueva cuenta";
        case "profile": return "Datos de mi cuenta";
        default: return "";
      }
    },
    submitButtonText() {
      switch (this.mode) {
        case "add": return "Agregar usuario";
        case "edit": return "Actualizar datos";
        case "register": return "Enviar datos";
        case "profile": return "Actualizar datos";
        default: return "";
      }
    },
    v_rolesList() {
      return useUsersStore().v_rolesList;
    },
    email() {
      if (useUsersStore().v_userdata?.info && this.mode == "profile") {
        this.user.info.email = useUsersStore().v_userdata.info.email;
        return useUsersStore().v_userdata.info.email;
      }
    },
    username() {
      if (useUsersStore().v_userdata?.info && this.mode == "profile") {
        this.user.info.username = useUsersStore().v_userdata.info.username;
        return useUsersStore().v_userdata.info.username;
      }
    },
    name() {
      if (useUsersStore().v_userdata?.info && this.mode == "profile") {
        this.user.info.name = useUsersStore().v_userdata.info.name;
        return useUsersStore().v_userdata.info.name;
      }
    },
    surname() {
      if (useUsersStore().v_userdata?.info && this.mode == "profile") {
        this.user.info.surname = useUsersStore().v_userdata.info.surname;
        return useUsersStore().v_userdata.info.surname;
      }
    }
  },
  watch: {
    email(val) { return val; },
    username(val) { return val; },
    name(val) { return val; },
    surname(val) { return val; },
    idRoleSelected(val) { this.user.role = val; }
  }
};
</script>

<style scoped>
.card-body {
  padding-left: 0px !important;
}

.card-body h5 {
  padding-left: 20px;
}

.statusSwitch {
  margin-left: 50px;
  margin-top: 30px;
}

.statusSwitchlabel {
  margin-top: 27px;
  margin-left: 15px;
  font-size: 90%;
  font-weight: 500;
}

.btn-group .btn {
  transition: all 0.3s ease;
  border-radius: 0.25rem !important;
  margin: 2px;
}

.btn-group .btn.active {
  background-color: #0d6efd;
  color: white;
  border-color: #0d6efd;
}

.btn-group .btn:not(.active):hover {
  background-color: #e9ecef;
}
</style>