<template>
  <div class="breadcrumb d-flex flex-wrap">
    <div class="breadcrumb-item d-flex align-items-center">
      <span>Panel de control</span>
      <span v-for="(item, index) in crumbs" :key="index">
        <span class="ms-2 me-2">/</span>
        <router-link :to="{ name: item.name }" class="routerLink">
          <span class="cursor-pointer">
            <a :href="item.to" class="text-decoration-none">{{ item.text }}</a>
          </span>
        </router-link>
      </span>
    </div>
  </div>
</template>


<script>
export default {
  computed: {
    crumbs: function () {
      let pathArray = this.$route.path.split("/");
      pathArray.shift();
      let breadcrumbs = pathArray.reduce((breadcrumbArray, path, idx) => {
        breadcrumbArray.push({
          path: path,
          to: breadcrumbArray[idx - 1]
            ? "/" + breadcrumbArray[idx - 1].path + "/" + path
            : "/" + path,
          text: this.$route.matched[idx].meta.breadCrumb || path,
        });
        return breadcrumbArray;
      }, []);
      return breadcrumbs;
    },
  },
  watch: {},
};
</script>

<style scoped>
.breadcrumb-item {
  font-size: 0.9rem;
}
</style>