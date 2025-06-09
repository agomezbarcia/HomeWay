<template>
  <div>
    <div class="row ms-2 ms-sm-3 me-1 ms-md-0 me-md-0">
      <div class="col">
        <nav class="breadcrumbs">
          <div class="breadcrumbs__item">{{ text }}</div>
          <div class="breadcrumbs__item is-active"></div>
        </nav>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ItemLabel",
  props: {
    text: {
      type: String,
    },
  },
  data() {
    return {};
  },
  computed: {},
  components: {},
  watch: {},
  mounted() {},
  methods: {},
};
</script>


<style scoped>
.breadcrumbs {
  border: 1px solid #cbd2d9;
  border-radius: 0.3rem;
  display: inline-flex;
  overflow: hidden;
  font-size: 0.8rem;
}

.breadcrumbs__item {
  background: #fff;
  color: #333;
  outline: none;
  padding: 0.75em 0.75em 0.75em 1.25em;
  position: relative;
  text-decoration: none;
  transition: background 0.2s linear;
  cursor: default;
}
/*
.breadcrumbs__item:hover:after,
.breadcrumbs__item:hover {
  background: #edf1f5;
}

.breadcrumbs__item:focus:after,
.breadcrumbs__item:focus,
.breadcrumbs__item.is-active:focus {
  background: #323f4a;
  color: #fff;
}
*/

.breadcrumbs__item:after,
.breadcrumbs__item:before {
  background: white;
  bottom: 0;
  clip-path: polygon(50% 50%, -50% -50%, 0 100%);
  content: "";
  left: 100%;
  position: absolute;
  top: 0;
  transition: background 0.2s linear;
  width: 1em;
  z-index: 1;
}

.breadcrumbs__item:before {
  background: #cbd2d9;
  margin-left: 1px;
}

.breadcrumbs__item:last-child {
  border-right: none;
}

.breadcrumbs__item.is-active {
  background: #edf1f5;
}
</style>
