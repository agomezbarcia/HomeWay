<template>
  <div class="card">
    <div class="card-body">
      <div class="row">
        <div class="col mt-0" v-if="titulo">
          <h5>{{ titulo }}</h5>
        </div>
        <!-- SLOT -->
        <slot></slot>
        <!-- SLOT -->
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Block",
  props: {
    titulo: {
      type: String,
      default: null,
    },
  },
};
</script>