<template>
  <div class="card mb-3">
    <div class="card-header">
      <h5 class="card-title mb-0">Sobre mi</h5>
    </div>
    <div class="card-body text-center">
      <img
        src="~@/assets/avatar/default.png"
        :alt="nombre"
        class="img-fluid rounded-circle mb-2"
        width="128"
        height="128"
         />
      <h5 class="card-title mb-0">{{ nombre }}</h5>
      <h6 class="card-title mb-0">{{ apellidos }}</h6>
    </div>

    <hr class="my-0" />
    <div class="card-body">
      <p class="infoTitle">Permisos: <span class="infoData">{{ role }}</span></p>
      <p class="infoTitle">Ultimo acceso: <span class="infoData">{{ ultimoacceso }}</span></p>
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs';
import 'dayjs/locale/es'; 
import { useUsersStore } from '@/stores/UsersVuex'; 

export default {
  name: "Info",
  data() {
    return {  };
  },
  computed: {
    nombre: function(){
      if(useUsersStore().v_userdata && useUsersStore().v_userdata.info)
       return useUsersStore().v_userdata.info.name;
    },
    apellidos: function(){
      if(useUsersStore().v_userdata  && useUsersStore().v_userdata.info)
       return useUsersStore().v_userdata.info.surname;
    },
    role: function(){
      if(useUsersStore().v_userdata  && useUsersStore().v_userdata.role)
       return useUsersStore().v_userdata.role.alias;
    },
    ultimoacceso: function(){
      if(useUsersStore().v_userdata && useUsersStore().v_userdata.activity)
      /* Devolvemos el ultimo login del usuario */
       return dayjs(useUsersStore().v_userdata.activity[useUsersStore().v_userdata.activity.length - 1].createdAt).format('DD/MM/YYYY HH:mm:ss');
    }                
  },
  watch: {
    nombre: function(val){
      return val
    },
    apellidos: function(val){
      return val
    },
    role: function(val){
      return val
    },
    ultimoacceso: function(val){
      return val
    }           
  },
};
</script>

<style scoped>
.infoTitle{
  font-size: 0.93rem;
  font-weight: 500;
}

.infoData{
  font-size: 0.87rem;
  font-weight: 300;
}
</style>