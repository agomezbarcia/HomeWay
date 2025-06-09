<template>
  <div  class="block">
        <Timeline>
              <Elements v-for="(item,index) of activity.slice().reverse()" :key="index" :fecha="getHumanDate(item.createdAt)" :pos="index" :items="activity.length">
                  <h4>Acceso al sistema</h4>
                  <p>Se ha registrado un acceso al sistema desde la dirección <i>{{ item.ip }}</i></p>
              </Elements>
        </Timeline>
  </div>
</template>

<script>
/* Importante:: hacemos un reverse slice para ordenarlos de forma inversa */
import dayjs from 'dayjs';
import 'dayjs/locale/es'; 
import Timeline from "./../timeline";
import Elements from "./../timeline/Elements"
import { useUsersStore } from '@/stores/UsersVuex'; 


export default {
  name: "Details",
  data() {
    return { };
  },
  components: {
    Timeline,
    Elements
  },
  computed: {
    activity: function(){
      if(useUsersStore().v_userdata && useUsersStore().v_userdata.activity){
       return useUsersStore().v_userdata.activity;
      }else {
        return []
      }
    },
  },
  methods: {
   getHumanDate (date){
     return dayjs(date).format('DD/MM/YYYY HH:mm:ss');
   }
  }    
}
</script>

<style scoped>
h4 {
     display: block;
     font-size:1rem;
     font-weight: 600;
}
</style>