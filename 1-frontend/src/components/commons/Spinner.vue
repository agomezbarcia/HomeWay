<template>
  <div>
    <div class="d-flex justify-content-center align-items-center h-100">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
    </div>
  </div>
</template>


<script>
export default {
  name: "Loader",
  props: { },
  data() {
    return {

    };
  },
  computed: { },
  watch: { },
};
</script>

<style scoped>
.spinner-border {
  opacity: 0.8;
  width: 3rem;
  height: 3rem;
}
</style>