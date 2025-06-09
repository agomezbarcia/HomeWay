<template>
  <!-- Modal para confirmar borrado de rol -->
  <ModalConfirm
    id="deleteRoleModal"
    title="Eliminar rol"
    message="¿Desea eliminar el rol seleccionado? Esta acción es irreversible"
    confirm="Sí, eliminar rol"
    reject="No, me he equivocado"
  />

  <!-- Modal para agregar nuevo rol -->
  <Modal
    id="createRoleModal"
    title="Agregar nuevo rol"
    :footer="true"
    clase="modal-md"
    :frameless="true"
  >
    <template v-slot:modalBody>
      <div>
        <Input
          :modelValue="newRole.alias"
          v-model="newRole.alias"
          id="newroleAdd"
          label="Alias del nuevo rol"
          placeholder="Introduzca un alias ..."
          icon="fab fa-codepen"
        />
        <p>El nuevo rol será creado sin permisos</p>
      </div>
    </template>
    <template v-slot:modalFooter>
      <div class="row">
        <div class="col mx-auto">
          <button
            class="btn btn-success w-100"
            data-bs-dismiss="modal"
            @click="addRole"
          >
            <i class="fas fa-edit"></i>
            <span>+ Agregar rol</span>
          </button>
        </div>
      </div>
    </template>
  </Modal>

  <!-- Modal para cambiar alias del rol seleccionado -->
  <Modal
    id="updateRoleAliasModal"
    ref="updateRoleAliasModal"
    title="Editar alias del rol"
    :footer="true"
    clase="modal-md"
    :frameless="true"
  >
    <template v-slot:modalBody>
      <div>
        <Input
          :modelValue="updateAlias"
          v-model="updateAlias"
          id="newroleChangeAlias"
          :label="'Nuevo alias para: ' + roleAlias"
          placeholder="Introduzca un nuevo alias"
          icon="fab fa-codepen"
        />
        <p v-if="errorText == ''">Esta acción solo modificará el nombre el rol</p>
        <p v-else class="text-danger fw-bold">{{ errorText }}</p>
      </div>
    </template>
    <template v-slot:modalFooter>
      <div class="row">
        <div class="col mx-auto">
          <button class="btn btn-success w-100" @click="editRole(true)">
            <i class="fas fa-edit"></i>
            <span>Editar alias</span>
          </button>
        </div>
      </div>
    </template>
  </Modal>

  <!-- Selector de opciones de roles -->
  <BlockFull class="me-3 w-100">
    <template v-slot:content>
      <div class="row ps-2">
        <div class="col-sm-8 col-md-5">
          <Select
            v-model="selectedRole"
            id="roleSelector"
            icon="far fa-map"
            label="* Seleccione un rol de la lista"
            :options="localRolelist"
            valKey="_id"
            textKey="alias"
            @change="updateInfo"
          />
        </div>
        <!-- SOLO PARA MOVIL -->
        <div class="col-auto d-block d-sm-none">
          <p class="mt-3 me-2 me-md-0">Opciones:</p>
        </div>
        <!-- SOLO PARA MOVIL -->
        <div class="col-auto" v-if="selectedRoleAlias != 'Usuario'">
          <label class="d-none d-sm-block">&nbsp;</label>
          <i
            class="far fa-trash-alt mainBtn cursor-pointer mt-2 me-2 me-md-0"
            title="Borrar rol"
            data-bs-toggle="modal"
            data-bs-target="#deleteRoleModal"
          ></i>
        </div>
        <div class="col-auto">
          <label class="d-none d-sm-block">&nbsp;</label>
          <i
            class="fas fa-plus mainBtn mt-2 cursor-pointer"
            title="Agregar rol"
            data-bs-toggle="modal"
            data-bs-target="#createRoleModal"
          ></i>
        </div>
      </div>
    </template>
  </BlockFull>

  <!-- Tabla de roles y permisos -->
  <div class="card col-md-10 col-lg-10 col-11 custPadding w-100 mt-3">
    <div class="card-body">
      <div class="row pb-2">
        <div class="col-12 col-sm-6 d-none d-sm-inline">
          <h4 class="d-inline">
            Permisos:
            <span style="color: green">
              {{ roleAlias }}
              <i
                class="fas fa-edit d-inline text-primary cursor-pointer"
                title="Editar alias del rol"
                data-bs-toggle="modal"
                data-bs-target="#updateRoleAliasModal"
                v-if="selectedRoleAlias != 'Usuario'"
              ></i>
            </span>
          </h4>
        </div>
        <div class="col-12 col-sm-6 d-flex justify-content-sm-end pe-sm-3 justify-content-center">
          <button type="button" class="btn btn-primary me-2" @click="uncheckAll">
            <i class="far fa-square"></i>
            Desmarcar todo
          </button>
          <button type="button" class="btn btn-primary" @click="checkAll">
            <i class="far fa-check-square"></i>
            Marcar todo
          </button>
        </div>
      </div>

      <div class="table-responsive">
        <table class="table table-bordered">
          <thead class="table">
            <tr>
              <th>SECCIÓN</th>
              <th>VER</th>
              <th>ADMINISTRAR</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(sectionItem, index) in sections" :key="index" :value="sectionItem">
              <td>{{ sectionItem.name }}</td>
              <td>
                <input
                  type="checkbox"
                  class="check cursor-pointer casilla"
                  v-model="sectionItem.actions.see.checked"
                  v-if="sectionItem.binary"
                  @click="manageSeeClick"
                  v-text="sectionItem.actions.see.keyword"
                />
              </td>
              <td>
                <input
                  type="checkbox"
                  class="check cursor-pointer casilla"
                  v-model="sectionItem.actions.admin.checked"
                  @click="manageAdminClick"
                  :value="sectionItem.binary"
                  v-text="sectionItem.actions.admin.keyword"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="row">
        <div class="col d-flex justify-content-center">
          <button class="col-10 col-sm-6 btn btn-primary" @click="editRole(false)">
            <i class="fas fa-edit"></i>
            <span> Guardar permisos</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// Importaciones de componentes y servicios
import { useUsersStore } from '@/stores/UsersVuex';
import Select from "@/components/commons/Select";
import BlockFull from "@/components/commons/BlockFull";
import UserService from "@/services/UserService";
import Modal from "@/components/commons/Modal";
import ModalConfirm from "@/components/commons/ModalConfirm";
import Input from "@/components/commons/Input";

export default {
  name: "Roles",
  components: {
    Select,
    BlockFull,
    Modal,
    ModalConfirm,
    Input
  },
  data() {
    return {
      // Estado del componente
      selectedRole: null,          // ID del rol seleccionado
      selectedRoleAlias: "",       // Alias del rol seleccionado
      selectedActions: [],         // Acciones seleccionadas para el rol
      sections: [],                // Secciones y permisos disponibles
      newRole: {                   // Datos para crear un nuevo rol
        alias: null,
        actions: []
      },
      updateAlias: "",             // Alias actualizado para el rol
      errorText: ""                // Texto de error para validaciones
    };
  },
  computed: {
    // Devuelve el alias del rol seleccionado
    roleAlias() {
      for (let i = 0; i < useUsersStore().v_rolesList.length; i++) {
        if (this.selectedRole == useUsersStore().v_rolesList[i]._id) {
          return useUsersStore().v_rolesList[i].alias;
        }
      }
    },
    // Devuelve las acciones del rol seleccionado
    roleActions() {
      for (let i = 0; i < useUsersStore().v_rolesList.length; i++) {
        if (this.selectedRole == useUsersStore().v_rolesList[i]._id) {
          return useUsersStore().v_rolesList[i].actions;
        }
      }
    },
    // Devuelve la lista local de roles
    localRolelist() {
      return useUsersStore().v_rolesList;
    }
  },
  watch: {
    // Observa cambios en el rol seleccionado
    selectedRole(newVal) {
      if (newVal != null) {
        return newVal;
      }
    },
    // Observa cambios en el alias del rol
    roleAlias(newVal) {
      if (newVal != null) {
        this.updateAlias = newVal;
        return newVal;
      }
    },
    // Observa cambios en las acciones del rol
    roleActions(newVal) {
      if (newVal != null) {
        return newVal;
      }
    },
  },
  async mounted() {
    // Al montar el componente, obtiene la lista de roles y secciones
    await useUsersStore().v_getRoleList();
    await this.retrieveSections();
    // Escucha el botón de confirmación de borrado una sola vez
    this.listenDeleteConfirm();
  },
  methods: {
    // Obtiene las secciones y permisos desde el servicio
    retrieveSections() {
      UserService.getSections()
        .then((response) => {
          this.sections = response.data;
          this.updateInfo();
        })
        .catch((err) => {
          console.log(err);
        });
    },
    // Actualiza la información de los permisos según el rol seleccionado
    updateInfo() {
      this.sections.forEach(section => {
        if (section.binary) {
          if (this.roleActions?.includes(section.actions.see.keyword)) {
            section.actions.see.checked = true;
          } else {
            section.actions.see.checked = false;
          }
          if (this.roleActions?.includes(section.actions.admin.keyword)) {
            section.actions.admin.checked = true;
          } else {
            section.actions.admin.checked = false;
          }
        } else if (this.roleActions?.includes(section.actions.admin.keyword)) {
          section.actions.admin.checked = true;
        } else {
          section.actions.admin.checked = false;
        }
      });
      useUsersStore().v_rolesList.forEach(role => {
        if (this.selectedRole == role._id) {
          this.selectedRoleAlias = role.alias;
        }
      })
    },
    // Recupera las acciones seleccionadas actualmente
    retrieveCurrentActions() {
      this.selectedActions = []
      this.sections.forEach(section => {
        if (section.binary && section.actions.see.checked) {
          this.selectedActions.push(section.actions.see.keyword);
        }
        if (section.actions.admin.checked) {
          this.selectedActions.push(section.actions.admin.keyword);
        }
      });
    },
    // Marca o desmarca todos los permisos
    performMultiple(check) {
      this.sections.forEach(section => {
        if (section.binary) {
          section.actions.see.checked = check;
          section.actions.admin.checked = check;
        } else {
          section.actions.admin.checked = check;
        }
      });
    },
    // Marca todos los permisos
    checkAll() {
      this.performMultiple(true);
    },
    // Desmarca todos los permisos
    uncheckAll() {
      this.performMultiple(false);
    },
    // Añade un nuevo rol
    async addRole() {
      await useUsersStore().v_addRole(this.newRole);
      await this.performMultiple(false);
      this.selectedRole = useUsersStore().v_rolesList[0]._id;
    },
    // Edita el rol (alias o permisos)
    async editRole(editAlias) {
      if (editAlias) {
        this.errorText = this.updateAlias.trim() == '' ? "Debe introducir un alias" : "";
        this.errorTextCountdown();
        if (this.updateAlias.trim() != '') {
          let originalActions = null;
          useUsersStore().v_rolesList.forEach(role => {
            if (role._id == this.selectedRole) {
              originalActions = role.actions;
            }
          });
          let editRole = {
            _id: this.selectedRole,
            alias: this.updateAlias,
            actions: originalActions
          }
          try {
            await useUsersStore().v_updateRole(editRole);
            this.$emit("refreshUsersList");
            this.$refs.updateRoleAliasModal.closeModal();
          } catch (err) {
            this.errorText = err;
            this.errorTextCountdown();
          }
        }
      } else {
        this.retrieveCurrentActions();
        let editRole = {
          _id: this.selectedRole,
          alias: this.roleAlias,
          actions: this.selectedActions
        }
        await useUsersStore().v_updateRole(editRole);
      }
    },
    // Elimina el rol seleccionado
    async deleteRole() {
      this.selectedRole = await useUsersStore().v_deleteRole(this.selectedRole);
      this.updateInfo();
      this.$emit("refreshUsersList");
    },
    // Escucha el evento de confirmación de borrado de rol
    listenDeleteConfirm() {
      document.getElementById("deleteRoleModal" + "confirmModalBtn").addEventListener('click', () => {
        this.deleteRole();
      }, false);
    },
    /**
     * Maneja el click en la casilla de administrar
     * @param {Event} e
     */
    manageAdminClick(e) {
      let binary = e.target.value == "true" ? true : false;
      let keyword = e.target.textContent;
      let status = e.target.checked;

      // Si desmarcamos, desmarcamos USER_ADMIN
      if (!status) {
        for (let i = 0; i < this.sections.length; i++) {
          if (this.sections[i].actions.admin.keyword == "USER_ADMIN") {
            this.sections[i].actions.admin.checked = false;
          }
        }
      }
      // Si marcamos USER_ADMIN, marcamos todo
      if (status && keyword == "USER_ADMIN") {
        this.performMultiple(true);
      }
      // Si marcamos una casilla binaria, marcamos también 'see'
      if (status && binary) {
        for (let i = 0; i < this.sections.length; i++) {
          if (this.sections[i].actions.admin.keyword == keyword) {
            this.sections[i].actions.see.checked = true;
          }
        }
      }
    },
    /**
     * Maneja el click en la casilla de ver
     * @param {Event} e
     */
    manageSeeClick(e) {
      let keyword = e.target.textContent;
      let status = e.target.checked;

      // Si desmarcamos, desmarcamos también 'admin' y USER_ADMIN
      if (!status) {
        for (let i = 0; i < this.sections.length; i++) {
          if (this.sections[i].actions.see && this.sections[i].actions.see.keyword == keyword) {
            this.sections[i].actions.admin.checked = false;
          }
        }
        for (let i = 0; i < this.sections.length; i++) {
          if (this.sections[i].actions.admin.keyword == "USER_ADMIN") {
            this.sections[i].actions.admin.checked = false;
          }
        }
      }
    },
    // Limpia el texto de error tras 3 segundos
    errorTextCountdown() {
      setTimeout(() => {
        this.errorText = '';
      }, 3000);
    }
  },
};
</script>

<style scoped>
/* Estilos para los elementos de navegación y botones principales */
.nav-item {
  border: 1px solid #ccc;
  border-radius: 0.25rem;
}

.nav-link {
  padding: 0.4rem 1rem;
}

.nav-pills .nav-link.active,
.nav-pills .show > .nav-link {
  border: 0px;
}

.mainBtn {
  opacity: 0.7;
  border: 1px solid #ccc;
  border-radius: 3px;
  padding: 5px;
  font-size: 1.5em;
}

.mainBtn:hover {
  background-color: rgb(226, 226, 226);
}
</style>