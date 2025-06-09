<template>
  <div
    class="position-fixed toastPosition cursor-pointer"
    @click="hideToast"
    >
    <div
      ref="toastBox"
      class="toast bg-light"
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      data-bs-autohide="true"
      data-bs-delay="6000"
      data-bs-animation="true"
    >
      <div 
      class="toast-body"
      :class=style>
        <i :class=icon></i>
        <span class="message">{{ message }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { Toast } from "bootstrap";
import { useToastStore } from "@/stores/ToastVuex";

export default {
  data() {
    return {
      icon: null
    };
  },
  computed: {
    // Variables procesadas para que sean reactivas
    message: function () {
      return useToastStore().message;
    },
    style: function () {
      return useToastStore().style;
    },
    display: function () {
      return useToastStore().display;
    },
  },
  watch: {
    // Vemos los cambios en la variable
    display: function (val) {
      this.triggerToast();
    },
    style: function(val){
      if(val == 'success'){
        this.icon="fas fa-check-circle"
      }else{
        this.icon="fas fa-times-circle"
      }
    }
  },
  methods: {
    // Mostrar el Toast
    triggerToast() {
      let toast = new Toast(this.$refs.toastBox);
      toast.show();
    },
    hideToast(){
      let toast = new Toast(this.$refs.toastBox);
      toast.hide();
    }
  },
};
</script>

<style scoped>
.error{
  background-color: #ffeded;
  border-color: #ffdbdb;
  color: #ff4949;
  padding-left:30px;
}

.success{
  background-color: #e7faf0;
  border-color: #d0f5e0;
  color: #13ce66;
  padding-left:30px;
}

.toastPosition{
 z-index:99999;
 top: calc(var(--margin-top-with-banner) + 10px);
 margin-left: calc(100vw - (300px + 3vw));
 position:fixed;

}

.toast{
  max-width: 300px;
}


.message{
  padding-left:10px;
}
</style>