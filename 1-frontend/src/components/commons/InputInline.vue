<template>
  <div class="row" style="margin:10px;">
    <label class="col-sm-4 form-label">{{ label }}</label>
    <div class="col-sm-8" style="zoom: 0.8">
      <input
        :value="modelValue"
        :id="id"
        :type="type"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        :minlength="minlength"
        :icon="icon"
        class="form-control"
        @input="(event) => $emit('update:modelValue', event.target.value)"
      />
      <slot></slot>
      <div class="invalid-feedback">{{ invalid }}</div>
    </div>
  </div>
</template>


<script>
export default {
  name: "InputInline",
  props: {
    // modelValue ==> Vue3
    modelValue: {
      required: true,
    },
    id: {
      required: true,
    },
    type: {
      type: String,
      default: "text",
    },
    label: {
      type: String,
      default: "...",
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    placeholder: {
      type: String,
      default: "...",
    },
    invalid: {
      type: String,
      default: "Los datos no cumplen con los criterios",
    },
    required: {
      type: String,
      default: "false",
    },
    minlength: {
      type: String,
      default: "0",
    },
    icon: {
      type: String,
      default: "none",
    },
  },
  data() {
    return {
      showIcon: false,
    };
  },
  computed: {
    iconReactive: function () {
      return this.icon;
    },
  },
  watch: {
    iconReactive: function (val) {
      if (val == "none") {
        return false;
      } else {
        return true;
      }
    },
  },
};
</script>

<style scoped>
.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #333333;
}
</style>