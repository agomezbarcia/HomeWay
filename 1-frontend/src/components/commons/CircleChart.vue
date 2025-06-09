<template>
  <v-chart
    :id="chartID"
    style="width: 100%; height: 200px"
    :option="option"
    :autoresize="true"
  />
</template>


<script>
import { mapState, mapActions } from "vuex";
import * as echarts from "echarts";
import VChart, { THEME_KEY } from "vue-echarts";

export default {
  name: "CircleChart",
  props: {
    dataSet: {
      type: Object,
      required: true,
    },
    chartID: {
      type: String,
      required: true
    }
  },
  components: {
    "v-chart": VChart,
  },
  data() {
    return {
      myChart: null,
      option: {
        tooltip: {
          formatter: '{a} <br/>{b} : {c}%'
        },
        series: [
          {   
            name: "eusebio",
            type: "gauge",
            startAngle: 0,
            endAngle: 360,
            pointer: {
              show: false,
            },
            progress: {
              show: true,
              overlap: true,
              roundCap: false,
              clip: true,
              itemStyle: {
                borderWidth: 1,
                borderColor: "#464646",
              },
            },
            axisLine: {
              lineStyle: {
                width: 40,
              },
            },
            splitLine: {
              show: false,
              distance: 0,
              length: 10,
            },
            axisTick: {
              show: false,
            },
            axisLabel: {
              show: false,
              distance: 50,
            },
            data: [],
            title: {
              fontSize: 12,
            },
            detail: {
              width: 60,
              height: 50,
              fontSize: 18,
              color: "auto",
              borderColor: "auto",
              formatter: '{value}'
            },
          },
        ],
      },
    };
  },
  watch: {
    /* dataSet: async function (newVal, oldVal) {
      if (newVal) {
        this.option.series[0].data = await [newVal];
        this.option.series[0].detail.formatter = await this.genFormatterFlow();
      }
    }, */
  },
  async mounted() {
    console.log(this.chartID);
    console.log(this.dataSet);
    this.option.series[0].name = `Acumulado ${this.dataSet.name.toLowerCase()}`;
    this.option.series[0].data = await [this.dataSet];
    this.option.series[0].detail.formatter = () => {
      return this.dataSet.value + " m³";
    }
    
  },
  methods: { },
};
</script>