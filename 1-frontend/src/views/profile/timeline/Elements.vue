<template>
  <li class="el-timeline-item">
    <div class="el-timeline-item__tail" v-if="pos != items - 1"></div>
    <div
      class="
        el-timeline-item__node
        el-timeline-item__node--normal
        el-timeline-item__node--
      "
    ></div>
    <div class="el-timeline-item__wrapper">
      <div class="fecha">
        {{ fecha }}
      </div>
      <div class="el-timeline-item__content">
        <div class="card">
          <div class="card-body">
            <!-- SLOT -->
            <slot></slot>
            <!-- SLOT -->
          </div>
        </div>
      </div>
    </div>
  </li>
</template>

<script>
export default {
  name: "Elements",
  props: {
    fecha: {
      type: String,
      default: "text",
    },
    pos: {
      type: Number,
    },
    items: {
      type: Number,
    },
  },
};
</script>


<style scoped>
.card {
  border-radius: 4px;
  border: 1px solid #e6ebf5;
  background-color: #ffffff;
  overflow: hidden;
  color: #303133;
  -webkit-transition: 0.3s;
  transition: 0.3s;
  max-width: initial;
}

.card-body {
  padding: 20px;
}

.fecha {
  padding: 5px;
  color: #909399;
  line-height: 1;
  font-size: 13px;
}

.el-timeline-item__wrapper {
  position: relative;
  padding-left: 28px;
  top: -18px;
}

.el-timeline-item__tail {
  position: absolute;
  height: 140px;
  border-left: 2px solid #dfe4ed;
}

.el-timeline-item__node {
  position: relative;
  background-color: #dfe4ed;
  border-radius: 50%;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-pack: center;
  -ms-flex-pack: center;
  justify-content: center;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
}

.el-timeline-item__node--normal {
  left: -5px;
  width: 12px;
  height: 12px;
}
</style>