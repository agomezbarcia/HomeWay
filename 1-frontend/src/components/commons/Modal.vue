<template>
  <div
    class="modal fade"
    :id="id"
    tabindex="-1"
    aria-labelledby="exampleModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered" :class="clase" :id="id + 'control'">
      <div class="modal-content">
        <div class="modal-header" :style="styleHeader">
          <h5 class="modal-title" id="exampleModalLabel" v-if="title != null">
            {{ title }}
            <div v-if="subtitle1"><small :class="subtitle1Class">{{ subtitle1 }}</small></div>
            <div v-if="subtitle2"><small :class="subtitle2Class">{{ subtitle2 }}</small></div>
            <div v-if="subtitle3"><small :class="subtitle3Class">{{ subtitle3 }}</small></div>
          </h5>
          <!-- SLOT -->
          <slot name="modalHeader"></slot>
          <!-- SLOT -->
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
            :style="styleBtnClose"
          ></button>
        </div>
        <div class="modal-body">
          <div>
            <div :class="frameless ? '' : 'card p-3'">
              <div :class="frameless ? '' : 'card-body'">
                <div class="row">
                  <div class="col">
                    <!-- SLOT -->
                    <slot name="modalBody"></slot>
                    <!-- SLOT -->
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer" v-if="footer">
          <!-- SLOT -->
          <slot name="modalFooter"></slot>
          <!-- SLOT -->
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import { Modal } from "bootstrap";
export default {
  name: "Modal",
  props: {
    id: {
      required: true,
    },
    title: {
      type: String,
      default: null,
    },
    footer: {
      type: Boolean,
      default: false,
    },
    clase: {
      type: String,
      default: "modal-xl",
    },
    frameless: {
      type: Boolean,
      default: false,
    },
    styleHeader: {
      type: String,
      default: null
    },
    styleBtnClose: {
      type: String,
      default: null
    },
    subtitle1: {
      type: String,
      default: null
    },
    subtitle2: {
      type: String,
      default: null
    },
    subtitle3: {
      type: String,
      default: null
    },
    subtitle1Class: {
      type: String,
      default: null
    },
    subtitle2Class: {
      type: String,
      default: null
    },
    subtitle3Class: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      modal: null, // Declarar la variable modal
    };
  },
  mounted() {
    // Espera a que el DOM esté completamente cargado
    this.$nextTick(() => {
      // Accede al elemento modal por su ID
      const modalElement = document.getElementById(this.id);

      // Verifica que el elemento modal exista
      if (modalElement) {
        // Inicializa la instancia de modal
        const modal = new Modal(modalElement);

        // Asigna la instancia de modal a this.modal
        this.modal = modal;
      }
    });    
  },
  computed: {
    localConfirmBtn: function () {
      return this.id + "confirmModalBtn";
    },
  },
  methods: {
    openModal() {
      // Abre el modal utilizando la instancia de modal
      if (this.modal) {
        this.modal.show();
      }
    },

    closeModal() {
      // Cierra el modal utilizando la instancia de modal
      if (this.modal) {
        this.modal.hide();
      }
    },
  },
  computed: {},
};
</script>

<style scoped>
.row {
  margin-right: 0px !important;
}
</style>