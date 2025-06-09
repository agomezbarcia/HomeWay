<template>
  <div class="form-group">
    <label :for="id" class="form-label">{{ label }}</label>
    <div class="input-group input-group-md" :class="label != null && label != '' ? 'mb-3' : ''">
      <span class="input-group-text" :class="iconReactive ? '' : 'd-none'" v-if="icon != 'none'">
        <i :class="icon"></i>
      </span>
      <select
        class="form-select cursor-pointer rounded-end"
        :id="id"
        :disabled="disabled"
        :required="required"
        v-model="localValue"
      >
        <option id="defaultOption" value="default" class="text-danger" disabled v-if="!removeDefault && !allowNullDefault">{{ defaultText }}</option>
        <option id="defaultOption-alt" value="default" v-if="!removeDefault && allowNullDefault">{{ defaultText }}</option>
        <option
          v-for="(item, index) in options"
          v-bind:key="index"
          v-bind:value="item[valKey]"
        >
        <span v-if="textKey">{{ item[textKey] }}</span>
        <span v-if="textKey01">&nbsp;[{{ item[textKey01] }}]</span>
        <span v-if="textKey02">&nbsp;{{ item[textKey02] }}</span>
        <span v-if="textKey03"> - {{ item[textKey03] }}</span>
        </option>
      </select>
      <div class="invalid-feedback">{{ invalid }}</div>
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
      type: String
    },
    textKey01: {
      type: String
    },
    textKey02: {
      type: String
    },
    textKey03: {
      type: String
    },
    defaultText: {
      type: String,
      default: "Select an option"
    },
    removeDefault: {
      type: Boolean,
      default: false
    },
    allowNullDefault:{
      type: Boolean,
      default: false
    },
  },
  data() {
    return {};
  },
  mounted() {

  },
  computed: {
    iconReactive: function () {
      return this.icon;
    },
    localValue: {
      get() {
        return this.modelValue? this.modelValue : 'default';
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

    modelValue: function (newVal, oldVal){
      //console.log(`Model value: ${newVal}`);
    }
  },
};
</script>

<style scoped>
.form-label {
  font-size: 0.875rem;
  font-weight: 500;
}
</style>