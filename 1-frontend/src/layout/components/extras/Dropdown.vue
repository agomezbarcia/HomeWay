<template>
  <div class="dropdown">
    <a
      class="nav-link dropdown-toggle"
      :class="modo"
      href="#"
      data-bs-toggle="dropdown"
    >
      <span class="d-none d-sm-inline me-sm-3 username">{{ userName }}</span>
      <img src="~@/assets/avatar/default.png" class="avatar rounded-75" />
    </a>
    <div class="dropdown-menu dropdown-menu-end">
      <router-link :to="{ name: 'perfil' }" class="routerLink">
        <a class="dropdown-item" href="#">
          <i class="bi bi-person"></i>
          <span>Mi perfil</span>
        </a>
      </router-link>
      <div class="dropdown-divider"></div>
      <router-link :to="{ name: 'logout' }" class="routerLink">
        <a class="dropdown-item" href="#">Cerrar sesión</a>
      </router-link>
    </div>
  </div>
</template>


<script>
import { useUsersStore } from "@/stores/UsersVuex";

export default {
  props: {
    modo: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      userName: "",
    };
  },
  async mounted() {
    const usersStore = useUsersStore();
    const v_userdata = usersStore.v_userdata;

    if (v_userdata) {
      // Caso de cerrar sesión con un usuario y entrar con otro
      this.userName = v_userdata.info.name;
    } else {
      // Caso de recargar la página (Pinia mantiene los datos del usuario)
      const userToken = await usersStore.v_decodeToken();
      this.userName = userToken?.name || "";
    }
  },
};
</script>

<style scoped>
i {
  margin-right: 10px;
}
.avatar {
  height: 30px;
}
.username {
  font-size: 1rem;
}

.dropdown {
  float: right;
  font-size: 100%;
}

.dropdown-menu {
  margin-right: 1vw;
}

.navbar-toggler {
  border: 0px !important;
}
</style>