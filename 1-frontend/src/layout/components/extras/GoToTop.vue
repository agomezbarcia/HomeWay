<template>
  <div :class="activateGoTop ? 'd-sm-none d-md-block' : 'd-none'">
    <div id="volver-arriba" title="Volver arriba" @click="moveToTop">
      <i class="fas fa-chevron-up fa-stack-2x"></i>
    </div>
  </div>
</template>


<script>
export default {
  name: "GoToTop",
  data() {
    return {
      activateGoTop: false,
      scrollPosition: 0,
      parentInstance: null,
    };
  },
  watch: {
    // If the scroll value is greater than the window height,
    //let's add a class to the scroll-to-top button to show it!
    scrollPosition: function (value) {
      if (value > 100) {
        return (this.activateGoTop = true);
      } else {
        return (this.activateGoTop = false);
      }
    },
  },
  props: {},
  methods: {
    handleScroll(event) {
      this.scrollPosition = event.target.scrollTop;
    },
    moveToTop() {
      /* OJO TRUCO:: Cogemos el #id del elemento principal de VUE en App.vue para desplezarnos hasta esa zona */
      const root = document.getElementById("appInner");
      root.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth",
      });
    },
  },
  beforeUnmount() {
    window.removeEventListener("scroll", this.handleScroll, true);
  },
  mounted() {
    window.addEventListener("scroll", this.handleScroll, true);
  },
};
</script>

<style scoped>
#volver-arriba {
  position: fixed;
  background-color: rgba(0, 0, 0, 0.26);
  bottom: 25px;
  right: 2vw;
  height: 45px;
  width: 45px;
  font-size: 12px;
  cursor: pointer;
  display: block;
  padding: 10px;
  z-index: 9;
  transition: 0.35s;
  color: #fff;
}

#volver-arriba:hover {
  background-color: rgba(116, 114, 114, 0.8);
}
</style>