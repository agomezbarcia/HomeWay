<template>
  <div>
    <HomesMap :isDark="themeIsDark"></HomesMap>
  </div>
</template>

<script>
import HomesMap from './components/HomesMap.vue';
export default {
  data() {
    return {
      storedTheme: localStorage.getItem("theme")
    };
  },
  components: { HomesMap },
  computed: {
    themeIsDark() {
      return this.storedTheme === 'dark' || this.storedTheme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
  },
  mounted() {
    this.setupThemeObserver();
  },
  methods: {
    setupThemeObserver() {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.attributeName === 'data-bs-theme') {
            this.storedTheme = document.documentElement.getAttribute('data-bs-theme');
          }
        });
      });

      observer.observe(document.documentElement, {
        attributes: true
      });
    }
  },


};
</script>

<style scoped></style>