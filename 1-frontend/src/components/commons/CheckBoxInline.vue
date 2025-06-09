<template>
  <div>
    <div class="form-check">
      <input
        class="form-check-input cursor-pointer"
        type="checkbox"
        :id="id"        
        :checked="localValue"
        :disabled="disabled"
        v-model="localValue"
      />
      <label class="form-check-label cursor-pointer" :for="id">
        {{ label }}
      </label>
    </div>
  </div>
</template>




<script>
export default {
  name: "CheckBoxInline",  
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
  },
  data() {
    return {
      localValue: true
    };
  },
  computed: {},
  watch: {
    localValue: function(newVal, oldVal){
      //console.log(newVal)
      this.$emit('update:modelValue', newVal)
    }
  },
  mounted() {
    this.localValue = this.modelValue
  }
};
</script>

<style scoped>
.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #333333;
}
</style>