<template>
  <div>
    <label class="form-label">{{ label }}</label>
    <div class="form-control form-check form-switch">
      <div class="ms-2">
        <input
          type="checkbox"
          class="form-check-input cursor-pointer"
          :id="id"
          :disabled="disabled"
          v-model="localValue"
        />
        <label class="form-check-label cursor-pointer" :class="claseMessage" :for="id"
          ><small>{{ message }}</small></label
        >
      </div>
    </div>
  </div>
</template>



<script>
export default {
  name: "SwitchBordered",
  props: {
    // modelValue ==> Vue3
    modelValue: {
      required: true,
    },
    id: {
      required: true,
    },
    label: {
      type: String,
      default: "...",
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    message: {
      type: String,
      default: "",
    },
    claseMessage: {
      type: String,
      default: ""
    }
  },
  data() {
    return {};
  },
  mounted() {},
  computed: {
    localValue: {
      get() {
        return this.modelValue;
      },
      set(value) {
        // update v-model
           this.$emit("update:modelValue", value);
      },
    },
  },
};
</script>

<style scoped>
.form-label {
  font-size: 0.875rem;
  font-weight: 500;
}
.activa{
  color: green;
}
.inactiva{
  color: red;
}
</style>