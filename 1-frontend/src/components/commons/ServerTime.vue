<template>
  <div
    class="serverTime"
  >
    <span class="labelServidor d-none d-sm-inline">Fecha del sistema:</span>
    <span class="fechaServidor" v-if="serverTime == null">Solicitando</span>
    <span class="fechaServidor" v-else>{{ serverTime }}</span>
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "app",
  data() {
    return {
      interval: null,
      serverTime: null,
      diffTime: null,        
    };
  },
  computed: {
    ...mapState("common", ["v_basicSettings"]),
  },  
  methods: {
    async getServerTime() {
      // Si el tiempo está nulo lo solicitamos al servidor
      if (this.diffTime == null) {
        // Calcular diferencia de tiempo
        this.diffTime = Date.now() - new Date(this.v_basicSettings.serverTime);
        // En caso contrario solicitamos la fecha actual desde la fecha
        // solicitada al servidor
      } else {
        let syncDates = Date.now() - this.diffTime;
        this.serverTime = Intl.DateTimeFormat(navigator.language, {
          hour: "numeric",
          minute: "2-digit",
          second: "numeric",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).format(syncDates);
      }
    },
  },
  beforeDestroy() {
    // prevent memory leak
    clearInterval(this.interval);
  },
  async mounted(){
    // Crear timer desde una fecha determinada
    // update the time every second
    //await getServerTime();
    this.interval = setInterval(async () => {
      // Concise way to format time according to system locale.
      // In my case this returns "3:48:00 am"
      this.getServerTime();
    }, 1000);    
  }
};
</script>

<style scoped>
.serverTime{
  background-color: #fff !important;
  margin-bottom: 0px !important;
  padding: 0px !important;
  font-size:0.75rem;
  font-weight: 500;
  color: #55595c;
}

.labelServidor{
    padding-right: 8px;
}
</style>