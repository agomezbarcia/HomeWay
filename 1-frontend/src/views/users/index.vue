<template>
  <div class="w-100">
    <!-- PESTAÑAS -->
    <div>
      <div class="h-100 px-2">
        <div class="d-flex align-items-start">
          <div class="flex-grow-1">
            <!-- INICIO -->
            <ul class="nav nav-tabs">
              <li class="nav-item">
                <a class="nav-link active" id="users-tab" data-bs-toggle="tab" href="#users" role="tab"
                  aria-controls="users" aria-selected="true">Usuarios</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" id="roles-tab" data-bs-toggle="tab" href="#roles" role="tab" aria-controls="roles"
                  aria-selected="false">Permisos</a>
              </li>
            </ul>
            <!-- FINAL -->
          </div>
        </div>
      </div>

      <!-- TABS -->
      <div class="row">
        <div class="tab-content" id="myTabContent">
          <div class="tab-pane fade show active" id="users" role="tabpanel" aria-labelledby="profile-tab">
            <!-- LISTA DE USUARIOS -->
            <!-- Este componente está referido como userlist -->
            <Users ref="userlist" />
          </div>
          <div class="tab-pane fade" id="roles" role="tabpanel" aria-labelledby="activity-tab">
            <!-- ROLES -->
            <!-- Este componente está referido como roles -->
            <Roles ref="roles" @refreshUsersList="refreshUsersList" />
          </div>
        </div>
      </div>
      <!-- TABS -->
    </div>

    <!-- PESTAÑAS -->
  </div>
</template>

<script>
//Importamos los componentes de usuarios y roles
import Users from "./components/Users";
import Roles from "./components/Roles";
import UserForm from "@/components/forms/UserForm";

export default {
  data() {
    return {};
  },
  components: {
    Users,
    Roles,
    UserForm,
  },
  methods: {
    refreshUsersList() {
      this.$refs.userlist.refreshList();
    }
  },
  mounted() { },
};
</script>