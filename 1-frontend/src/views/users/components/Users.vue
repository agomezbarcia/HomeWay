<template>
  <div>
    <!-- Modal para confirmar eliminación de usuario -->
    <ModalConfirm
      id="deleteUserModal"
      title="Eliminar Usuario"
      message="Se va a eliminar el Usuario de la lista. Esta acción es irreversible"
      confirm="Sí, borrar usuario"
      reject="No, me he equivocado"
    />

    <!-- Modal para editar usuario -->
    <Modal id="editUserModal" title="Editar Usuario" :footer="false" ref="editUserModal">
      <template v-slot:modalBody>
        <UserForm
          ref="useredit"
          id="user-form-edit"
          mode="edit"
          @refreshList="refreshList"
          @closeEditModal="closeEditModal"
        />
      </template>
    </Modal>

    <!-- Modal para agregar usuario -->
    <Modal id="addUserModal" title="Crear Usuario" :footer="false" ref="addUserModal">
      <template v-slot:modalBody>
        <UserForm
          ref="useradd"
          id="user-form-add"
          mode="add"
          @refreshList="refreshList"
          @closeAddModal="closeAddModal"
        />
      </template>
    </Modal>

    <!-- Sección principal con la lista de usuarios -->
    <BlockFull titulo="Lista de Usuarios" :titleCol="8">
      <!-- Botón para agregar usuarios -->
      <template v-slot:options>
        <button
          class="btn btn-success"
          title="Agregar nuevo Usuario"
          data-bs-toggle="modal"
          data-bs-target="#addUserModal"
        >
          <i class="fas fa-plus-circle"></i>
          <span class="d-none d-md-inline">{{ ' Usuario' }}</span>
        </button>
      </template>

      <!-- Buscador y tabla de usuarios -->
      <template v-slot:content>
        <div class="col-3">
          <Input
            label="Busqueda"
            id="find-subject"
            type="text"
            v-model="findParams.keyText"
            icon="fas fa-search"
          />
          <button class="btn btn-primary" @click="searchUsers">Buscar</button>
        </div>
        <Table
          :columns="columns"
          :rows="users_rows"
          :isLoading="loadingTable"
          :serverSize="true"
          :totalRecords="totalRecords"
          :showOptions="false"
          :searchActive="false"
          :searchDisabled="true"
          :showRowNumber="false"
          :pageJumpOption="true"
          :sortAlllowed="false"
          id="userTable"
          ref="userTable"
          @onPageChange="onPageChange"
          @onPerPageChange="onPerPageChange"
        >
          <!-- Acciones por usuario: editar y eliminar -->
          <template v-slot:acciones="props">
            <button
              class="btn btn-primary mx-1"
              data-bs-toggle="modal"
              data-bs-target="#editUserModal"
              @click="requestEditInfo(props.rowItem.id.value)"
              v-if="props.rowItem.id.value != idAdmin"
            >
              <i class="fas fa-edit"></i>
            </button>
            <button
              class="btn btn-danger mx-1"
              data-bs-toggle="modal"
              data-bs-target="#deleteUserModal"
              @click="listenDeleteConfirm(props.rowItem.id.value)"
              v-if="props.rowItem.id.value != idAdmin"
            >
              <i class="fas fa-trash-alt"></i>
            </button>
            <span v-else>No editable</span>
          </template>
        </Table>
      </template>
    </BlockFull>
  </div>
</template>

<script>
import UserService from "@/services/UserService";
import BlockFull from "@/components/commons/BlockFull";
import Table from "@/components/commons/Table";
import ModalConfirm from "@/components/commons/ModalConfirm";
import Modal from "@/components/commons/Modal";
import UserForm from "@/components/forms/UserForm";
import Input from "@/components/commons/Input";
import { useUsersStore } from '@/stores/UsersVuex';
import { useToastStore } from "@/stores/ToastVuex";
import dayjs from 'dayjs';

export default {
  name: "users-list",
  components: {
    BlockFull,
    UserForm,
    ModalConfirm,
    Modal,
    Table,
    Input
  },
  data() {
    return {
      // Datos de usuario y tabla
      user: [],
      users_rows: [],
      loadingTable: false,
      totalRecords: 0,
      // Parámetros de búsqueda
      findParams: {
        keyText: null
      },
      // Parámetros de paginación
      serverParams: {
        page: 1,
        perPage: 10,
      },
      currentUser: null,
      currentIndex: -1,
      // Definición de columnas de la tabla
      columns: [
        {
          label: "# ID",
          field: "id",
          hidden: true,
          class: 'text-center'
        },
        {
          label: "Nombre",
          field: "nombreuser",
          type: "string",
          class: 'text-center'
        },
        {
          label: "Apellidos",
          field: "apellidosuser",
          type: "string",
          class: 'text-center'
        },
        {
          label: "Email",
          field: "emailuser",
          type: "string",
          class: 'text-center'
        },
        {
          label: "Codigo Socio",
          field: "csociouser",
          type: "string",
          class: 'text-center'
        },
        {
          label: "Rol",
          field: "roluser",
          type: "string",
          class: 'text-center'
        },
        {
          label: "Estado",
          field: "estadouser",
          type: "string",
          class: 'text-center'
        },
        {
          label: "Última modificación",
          field: "fechaactualizacionuser",
          type: "string",
          class: 'text-center'
        },
        {
          label: "Acciones",
          field: "acciones",
          class: 'text-center align-middle'
        },
      ],
      rows: [],
      idAdmin: null
    };
  },
  computed: {},
  async mounted() {
    // Al cargar el componente, obtenemos la lista de usuarios y los datos del usuario actual si no existen
    this.retriveUsers();
    if (!useUsersStore().getData) {
      await useUsersStore().v_getselfdata();
    }
  },
  methods: {
    /************************ FUNCIONES DE TABLA CON PAGINACIÓN **************************/

    /**
     * Actualiza los parámetros del servidor para la tabla
     * @param {*} newProps
     */
    updateParams(newProps) {
      this.serverParams = Object.assign({}, this.serverParams, newProps);
    },

    /**
     * Cambia la página actual de la tabla
     * @param {Object} params
     */
    onPageChange(params) {
      this.updateParams({ page: params.currentPage });
      this.retriveUsers();
    },

    /**
     * Cambia el número de registros por página
     * @param {Object} params
     */
    onPerPageChange(params) {
      this.updateParams({ perPage: params.currentPerPage });
      this.retriveUsers();
    },

    /**
     * Recupera la lista de usuarios desde el servidor
     */
    async retriveUsers() {
      let useFindParams = {};
      if (this.findParams.keyText && this.findParams.keyText != '') {
        useFindParams['keyText'] = this.findParams.keyText;
      }

      try {
        this.loadingTable = true;
        const response = await UserService.getUsersList(this.serverParams, useFindParams);
        if (response.data) {
          this.user = response.data.data;
          this.totalRecords = response.data.totalRecords;
        } else {
          this.user = null;
        }
        await this.populateUsersRows();
        this.loadingTable = false;
      } catch (err) {
        console.log(err);
        this.users_rows = [];
        this.$refs.userTable.clearTable();
        this.loadingTable = false;
      }
    },

    /**
     * Llena el array de filas para la tabla de usuarios
     */
    populateUsersRows() {
      return new Promise((resolve, reject) => {
        this.users_rows = [];
        let localUsersrows = [];
        if (this.user && this.user.length > 0) {
          for (const entry of this.user) {
            let newRow = {
              id: entry._id,
              nombreuser: entry.info.name,
              apellidosuser: entry.info.surname ? entry.info.surname : "-",
              emailuser: entry.info.email ? entry.info.email : "No asociado",
              csociouser: entry.info.csocio ? entry.info.csocio : "-",
              roluser: entry.role ? entry.role.alias : " - ",
              estadouser: entry.info.status ? "Activo" : "Inactivo",
              fechaactualizacionuser: dayjs(new Date(entry.updatedAt)).format('DD/MM/YYYY - H:mm A'),
            }
            if (newRow.roluser == "Administrador") {
              this.idAdmin = newRow.id;
            }
            localUsersrows.push(newRow);
          }
          this.users_rows = JSON.parse(JSON.stringify(localUsersrows));
        } else {
          this.$refs.userTable.clearTable();
        }
        resolve();
      });
    },

    /**
     * Refresca la lista de usuarios
     */
    refreshList() {
      this.retriveUsers();
    },

    /**
     * Elimina un usuario por id
     * @param {String} iduser
     */
    deleteUser(iduser) {
      // Impide que un usuario sin permisos de admin se borre a sí mismo
      if (
        iduser == useUsersStore().v_userdata._id &&
        !((useUsersStore().v_userdata.role.actions).includes('USER_ADMIN'))
      ) {
        useToastStore.showMessage({
          message: "Error: no se tienen permisos necesarios",
          style: "error"
        });
      } else {
        UserService.deleteUser(iduser)
          .then((response) => {
            // Refresca la tabla tras eliminar
            this.refreshList();
          })
          .catch((e) => {
            console.log(e);
          });
      }
    },

    /**
     * Escucha la confirmación de borrado en el modal y ejecuta la eliminación
     * @param {String} id
     */
    listenDeleteConfirm(id) {
      document
        .getElementById("deleteUserModal" + "confirmModalBtn")
        .addEventListener(
          'click',
          () => {
            this.deleteUser(id);
          },
          false
        );
    },

    /**
     * Solicita la información de un usuario para editar
     * @param {String} id
     */
    requestEditInfo(id) {
      this.$refs.useredit.retrieveData(id);
    },

    /**
     * Cierra el modal de agregar usuario
     */
    closeAddModal() {
      this.$refs.addUserModal.closeModal();
    },

    /**
     * Cierra el modal de editar usuario
     */
    closeEditModal() {
      this.$refs.editUserModal.closeModal();
    },

    /**
     * Realiza la búsqueda de usuarios y reinicia la página a la primera
     */
    searchUsers() {
      this.serverParams.page = 1;
      this.$refs.userTable.setParams(this.serverParams.page, this.serverParams.perPage);
      this.retriveUsers();
    }
  }
};
</script>

<style scoped>
/* Puedes agregar estilos aquí si es necesario */
</style>