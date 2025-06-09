<template>
  <div class="row w-100 maxWrapperWidth mb-4 gx-2 g-sm-3 mt-2">
    <!-- RESUMEN CUENTA -->
    <div class="col-md-12 col-lg-4 col-xl-3">
      <Info />
    </div>
    <!-- RESUMEN CUENTA -->

    <!-- PESTAÑAS -->
    <div class="col-md-12 col-lg-8 col-xl-9">
      <div class="card">
        <div class="card-body h-100">
          <div class="d-flex align-items-start">
            <div class="flex-grow-1">
              <!-- TABS -->
              <ul class="nav nav-tabs">
                <li class="nav-item">
                  <a
                    class="nav-link active"
                    id="profile-tab"
                    data-bs-toggle="tab"
                    href="#profile"
                    role="tab"
                    aria-controls="profile"
                    aria-selected="true"
                    >Datos de la cuenta</a
                  >
                </li>
                <li class="nav-item">
                  <a
                    class="nav-link"
                    id="activity-tab"
                    data-bs-toggle="tab"
                    href="#activity"
                    role="tab"
                    aria-controls="activity"
                    aria-selected="false"
                    >Actividad reciente</a
                  >
                </li>
              </ul>

              <div
                class="tab-content"
                id="myTabContent"
                style="padding: 4vh 1vw 1vh 1vw"
              >
                <div
                  class="tab-pane fade show active"
                  id="profile"
                  role="tabpanel"
                  aria-labelledby="profile-tab"
                >
                  <UserForm id="user-form-profile" mode="profile" ref="profileuser" />
                </div>
                <div
                  class="tab-pane fade"
                  id="activity"
                  role="tabpanel"
                  aria-labelledby="activity-tab"
                >
                  <Activity />
                </div>
              </div>

              <!-- TABS -->
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- PESTAÑAS -->
  </div>
</template>

<script>
import Info from "./components/Info";
import UserForm from "@/components/forms/UserForm";
import Activity from "./components/Activity";
import { useUsersStore } from '@/stores/UsersVuex'; 

export default {
  data() {
    return {
      user: {},
    };
  },
  components: {
    Info,
    UserForm,
    Activity,
  },
  computed: {},
  methods: { },
  async mounted() {
    /* En caso de que en el amacen de VUEX no estén los datos
       completos del usuario, los solicitamos de nuevo para que
       se populen a través de la secciones de forma reactiva */
    if (!useUsersStore().getData) {
      await useUsersStore().v_getselfdata();
    }
  },
};
</script>

<style scoped>
/* Sobreescribir configuraciones por defecto */
.card{
max-width: 100%;
}
</style>