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
                <a class="nav-link active" id="upcoming-tab" data-bs-toggle="tab" href="#upcoming" role="tab"
                  aria-controls="upcoming" aria-selected="true">Próximas Reservas</a>
                </li>
              <li class="nav-item">
                <a class="nav-link" id="past-tab" data-bs-toggle="tab" href="#past" role="tab" aria-controls="past"
                  aria-selected="false">Reservas pasadas</a>
              </li>
            </ul>
            <!-- FINAL -->
          </div>
        </div>
      </div>

      <!-- TABS -->
      <div class="row">
        <div class="tab-content" id="myTabContent">
          <div class="tab-pane fade show active" id="upcoming" role="tabpanel" aria-labelledby="profile-tab">
            <!-- Reservas de usuario proximas -->
            <ReservationsGuest :upcoming="true" :isHostAdmin="isHostAdmin" :isAdmin="isAdmin" />
          </div>
          <div class="tab-pane fade" id="past" role="tabpanel" aria-labelledby="activity-tab">
            <!-- Reservas de usuario pasadas -->
            <ReservationsGuest :upcoming="false" :isHostAdmin="isHostAdmin" :isAdmin="isAdmin" />
          </div>
        </div>
      </div>
      <!-- TABS -->
    </div>

    <!-- PESTAÑAS -->
  </div>
</template>
  
<script>
import ReservationsGuest from './components/ReservationsGuest.vue';
import { useUsersStore } from '@/stores/UsersVuex';
export default {
  data() {
    return {};
  },
  components: { ReservationsGuest },
  computed: {
    isHostAdmin() {
      return useUsersStore().v_userdata?.role.actions.includes('PROPERTY_ADMIN')
    },
    isAdmin() {
      return useUsersStore().v_userdata?.role.actions.includes('ADMIN')
    },
  },
  methods: {},
  async mounted() { },
};
</script>
  
<style scoped></style>