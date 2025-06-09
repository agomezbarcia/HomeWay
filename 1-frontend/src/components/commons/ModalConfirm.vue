<template>
  <div
    class="modal fade"
    :id="id"
    tabindex="-1"
    aria-labelledby="exampleModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-md modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header" style="background: #305680; color: #fff">
          <h5 class="modal-title" id="exampleModalLabel" v-if="title != null">
            {{ title }}
          </h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <div>
            <div class="groupBox">
              <div :class="frameless ? '' : 'card mt-3'" id="datacard">
                <div :class="frameless ? '' : 'card-body me-2'">
                  <div class="row">
                    <div class="col">
                      <div v-html="message"></div>
                      <!-- SLOT para elementos extras-->
                      <slot name="modalBody"></slot>
                      <!-- SLOT  para elementos extras -->
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-secondary"
            data-bs-dismiss="modal"
          >
            {{ reject }}
          </button>
          <button
            type="button"
            :class="`btn btn-${confirmClass}`"
            :id="localConfirmBtn"
            @click="performAction(elementID)"
            data-bs-dismiss="modal"
          >
            {{ confirm }}
          </button>
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
    message: {
      type: String,
      default: "",
    },
    confirm: {
      type: String,
      default: "",
    },
    frameless: {
      type: Boolean,
      default: false,
    },
    reject: {
      type: String,
      default: "",
    },
    confirmClass: {
      type: String,
      default: "danger",
    },
  },
  data() {
    return {
      modal: null, // Declarar la variable modal
      elementID: null,
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
    // Abre el modal utilizando la instancia de modal
    openModal(elementID) {
      if (this.modal) {
        this.elementID = elementID;
        this.modal.show();
      }
    },

    // Cierra el modal utilizando la instancia de modal
    closeModal() {
      if (this.modal) {
        this.modal.hide();
      }
    },

    //Confirmar la accion pasando el ID del eleemnto a borrar
    // que preivamente se lo hemos pasado en el openModal
    performAction(elementID) {
      this.$emit("performAction", elementID, "perform");
    },
  },
};
</script>