<template>
  <div>
    <button
      class="btn btn-lg"
      :class="compClass"
      type="button"
      :disabled="disabled"
      :id="id"
      @click="downloadManager"
    >
      <i class="fas fa-arrow-alt-circle-down"></i>
      <span v-if="isDownloading" class="text-uppercase span-advanced-settings"
        >Descargando... {{ progressBar }} Mb
      </span>
      <span v-else class="text-uppercase span-advanced-settings">
        {{ localLabel }}
      </span>
    </button>
  </div>
</template>



<script>
import { mapState } from "vuex";
import MediaService from "@/services/MediaService";

export default {
  name: "DownloadButton",
  props: {
    id: {
      type: String,
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
    compClass: {
      type: String,
    },
    endpoint: {
      type: String,
      required: true,
      default: null,
    },
  },
  computed: {
    ...mapState("media", ["downloadQueue"]),
    progressBar: function () {
      if (this.downloadQueue) {
        let index = this.downloadQueue.findIndex((x) => x.id == this.id);
        if (index === -1) {
          // Devolvemos 0 en caso no posible
          return 0;
        } else {
          return this.downloadQueue[index].downloadProgress;
        }
      }
    },
    localLabel: function () {
      if (!this.isDownloading && this.endpoint) {
        return this.label;
      } else {
        return "Endpoint incorrecto";
      }
    },
  },
  data() {
    return {
      isDownloading: false,
    };
  },
  mounted() {},
  methods: {
    async downloadManager(event) {
      event.preventDefault();

      if (!this.isDownloading) {
        this.isDownloading = true;
        //let refreshIntervalId = setInterval(this.updateProgressbar, 100);
        this.downloadFile().then(() => {
          this.isDownloading = false;
          //clearInterval(refreshIntervalId);
        });
      }
    },

    async downloadFile() {
      if (this.endpoint != null) {
        await MediaService.downloadFile(this.id, this.endpoint)
          .then(async (response) => {
            //Download Files
            var data = new Blob([response.data]);
            var url = window.URL.createObjectURL(data);

            var link = document.createElement("a");
            var filename = response.headers["content-disposition"]
              .split("filename=")[1]
              .split(";")[0];
            link.setAttribute("href", url);
            link.setAttribute("download", filename);
            document.body.appendChild(link); // Required for FF

            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
          })
          .catch((error) => {});
      }
    },
  },
};
</script>

