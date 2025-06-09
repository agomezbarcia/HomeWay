<template>
  <div class="card">
    <div class="card-body">
      <div class="row">
        <div class="col-md-3">
          <!-- SLOT -->
          <slot name="firstCol"></slot>
          <!-- SLOT -->
        </div>
        <div class="col">
          <!-- SLOT -->
          <slot name="secondCol"></slot>
          <!-- SLOT -->
        </div>
      </div>
    </div>
  </div>
</template>


<script>
export default {
  name: "HorizontalCard",
  props: {},
};
</script>

<style scoped>
.row>* {
    padding-right: calc(var(--bs-gutter-x) * .5) !important;
}

.card{
    min-height:100px;
}
</style>