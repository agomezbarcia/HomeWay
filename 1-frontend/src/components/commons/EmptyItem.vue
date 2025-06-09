<template>
  <BlockFull>
    <template v-slot:content>
      <div
        class="cursor-pointer p-2 p-sm-5"
        data-bs-toggle="modal"
        :data-bs-target="localAddFormID"
      >
        <div class="d-flex justify-content-center text-center">
          <i :class="iconClass"></i>
        </div>
        <div class="d-flex justify-content-center text-center mt-3">
          <!-- SLOT -->
          <slot name="content"></slot>
          <!-- SLOT -->
        </div>
      </div>
    </template>
  </BlockFull>
</template>


<script>
import BlockFull from "@/components/commons/BlockFull";

export default {
  name: "LocationEmpty",
  data() {
    return {
      location: {},
    };
  },
  props: {
    addFormID: {
      type: String,
    },
    iconClass: {
      type: String,
      default: "far fa-plus-square fa-5x addBtn",
    },
  },
  computed: {
    localAddFormID: function () {
      return "#" + this.addFormID;
    },
  },
  components: {
    BlockFull,
  },
  mounted() {},
  watch: {},
  methods: {},
};
</script>

<style scoped>
.addBtn {
  opacity: 0.6;
}
</style>
