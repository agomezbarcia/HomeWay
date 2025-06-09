<template>
  <div class="row">
    <div :class="titleCol">
      <span :class="titleClass">{{ title }}</span>
    </div>
    <div :class="textCol">
      <span :class="textClass">{{ text }}</span>
    </div>
  </div>
</template>



<script>
export default {
  name: "TitleDescription",
  props: {
    title: {
      type: String,
    },
    // Number or String
    text: {},
    titleCol: {
      type: String,
      default: "col",
    },
    textCol: {
      type: String,
      default: "col",
    },
    titleClass: {
      type: String,
      default: "",
    },
    textClass: {
      type: String,
      default: "",
    },
  },
  data() {
    return {};
  },
  mounted() {},
  computed: {},
};
</script>