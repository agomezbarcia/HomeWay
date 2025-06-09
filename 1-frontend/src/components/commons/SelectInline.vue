<template>
  <div class="row" style="margin: 10px">
    <label class="col-sm-4 form-label">{{ label }}</label>
    <div class="col-sm-8" style="zoom: 0.8">
      <div
        class="input-group input-group-md"
      >
        <span
          class="input-group-text"
          :class="iconReactive ? '' : 'd-none'"
          v-if="icon != 'none'"
        >
          <i :class="icon"></i>
        </span>
        <select
          class="form-select cursor-pointer rounded-end"
          :id="id"
          :disabled="disabled"
          :required="required"
          v-model="localValue"
        >
          <option
            v-for="(item, index) in options"
            v-bind:key="index"
            v-bind:value="item[valKey]"
          >
            {{ item[textKey] }}
          </option>
        </select>
        <div class="invalid-feedback">{{ invalid }}</div>
      </div>
    </div>
  </div>
</template>




<script>
export default {
  name: "Select",
  props: {
    // modelValue ==> Vue3
    modelValue: {
      required: true,
    },
    id: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      default: null,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    icon: {
      type: String,
      default: "none",
    },
    required: {
      type: Boolean,
      default: false,
    },
    invalid: {
      type: String,
      default: "Los datos no cumplen con los criterios",
    },
    options: {
      type: Array,
      default: ["Ninguna"],
    },
    valKey: {
      type: String,
      default: "value",
    },
    textKey: {
      type: String,
      default: "",
    },
  },
  data() {
    return {};
  },
  mounted() {},
  computed: {
    iconReactive: function () {
      return this.icon;
    },
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
  watch: {
    iconReactive: function (val) {
      if (val == "none") {
        return false;
      } else {
        return true;
      }
    },

    options: function (newVal, oldVal) {
      if (newVal.length > 0) {
        this.localValue = this.options[0]._id;
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