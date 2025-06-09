<template>
  <div :id="id" class="mt-4">
    <div
      class="d-flex justify-content-between mb-2 tablaOpciones"
      v-if="rows.length != 0"
    >
      <div v-if="searchActive">
        <i class="fas fa-magnifying-glass"></i>
        <input
          type="text"
          id="buscar-fak-class"
          class="ms-2 me-4"
          :placeholder="placeHolderText"
          @input="filterTable($event)"
          style="width: 130px;"
        />
      </div>
      <slot name="top-left-addon" v-if="!searchActive"></slot>
      <div v-if="serverSize" class="text-end">
        <span>{{ entriesText }}</span>
        <select
          name="registry"
          id="registry"
          @change="($event) => changePerPage($event)"
          ref="registrySelect"
          class="cursor-pointer d-inline"
          v-model="params.currentPerPage"
        >
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
        </select>
      </div>
      <div>
        <slot name="top-right-addon"></slot>
      </div>
    </div>

    <div class="table-responsive">
      <table class="table border table-hover" ref="tablaDatos">
        <thead>
          <tr>
            <th
              class="text-center align-middle border"
              @click="sortTable('index', 'defecto')"
              v-if="showRowNumber"
            >
              #
            </th>
            <th
              v-for="(columnItem, index) in columns"
              v-bind:key="index"
              :hidden="columnItem.hidden"
              class="text-center align-middle border cursor-pointer"
              @click="sortTable(columnItem.field, columnItem.label)"
              :id="`${id}_${columnItem.field}`"
            >
              {{ columnItem.label }}
            </th>
            <th
              class="text-center align-middle d-none d-sm-table-cell"
              v-if="showOptions"
            >
              Opcs.
            </th>
          </tr>
        </thead>
        <tbody>
          <transition-group name="fade">
            <tr
              v-for="(rowItem, index) of modifiedRows"
              class="row-element appearing-row align-middle"
              :key="index"
              @click="expandField(index, $event)"
            >
              <td class="text-center border" v-if="showRowNumber">{{ offsetSelect + index }}</td>
              <td
                v-for="(field, key) in rowItem"
                v-bind:key="key"
                :hidden="field.hidden"
                :style="`max-width: ${field.maxWidth}px;`"
                class="align-middle"
              >
                <div
                  class="text-truncate"
                  :class="field.class"
                  :style="field.style"
                  :id="`content-${key}-${index}`"
                >
                  <span v-if="field.value != null && field.type != 'html' && !field.hideValue">
                    {{ castValue(field) }}
                  </span>
                  <!-- en el caso de que queramos renderizar un icono en vez de string -->
                  <span
                    v-if="field.value != null && field.type == 'html' && !field.hideValue"
                    v-html="field.value"
                  ></span>
                  <slot :name="key" v-bind:rowItem="rowItem"></slot>
                </div>
              </td>
              <!-- En el caso de que se quieran mostrar las opciones -->
              <td class="text-center d-none d-sm-table-cell" v-if="showOptions">
                <span title="copy to clipboard"
                  ><i class="bi bi-clipboard2" @click="rowClipboard(index)"></i
                ></span>
              </td>
            </tr>
            <tr :key="'default'">
              <td class="text-center p-4 border" :colspan="columns.length - (hiddenColumns - 1)" v-if="noCoincidences">No coincidences</td>
              <td class="text-center p-4 border" :colspan="columns.length - (hiddenColumns - 1)" v-if="rows.length == 0 && !localIsLoading">No data</td>
              <td class="text-center p-4 border" :colspan="columns.length - (hiddenColumns - 1)" v-if="!noCoincidences && localIsLoading">
                <Spinner></Spinner>
              </td>
            </tr>
          </transition-group>
        </tbody>
      </table>
    </div>

    <!-- Avance//Retroceso -->
    <div
      class="d-flex justify-content-center my-2 tablaOpciones"
      v-if="serverSize && rows.length != 0"
    >
      <div
        class="pageChangeArrow mx-auto"
        @click="changePage(-1)"
        title="Página anterior"
      >
        <i class="fas fa-arrow-left me-2"></i>{{ previousText }}
      </div>
      <div v-if="serverSize">
        <span class="d-none d-sm-inline me-4 p-2 numPaginas"
          >{{ PageText }} {{ params.currentPage }}/{{ totalPages }}</span
        >
      </div>
      <div
        class="pageChangeArrow mx-auto"
        @click="changePage(1)"
        title="Página siguiente"
      >
        {{ nextText }}<i class="fas fa-arrow-right ms-2"></i>
      </div>
    </div>
    <div class="text-center w-100 me-4" v-if="pageJumpOption"><small>{{ jumpPageText }}</small> <input type="number" style="max-width: 50px;" @input="jumpPage($event)"></div>
  </div>
</template>
  
  
<script>
import dayjs from "dayjs";
import "dayjs/locale/es";
import { useCommonStore } from "@/stores/CommonVuex";
import Spinner from "./Spinner.vue";

export default {
  name: "Table",
  props: {
    id: {
      required: true,
    },
    columns: {
      required: true,
      default: [],
    },
    rows: {
      required: true,
      default: [],
    },
    serverSize: {
      default: false,
    },
    showOptions: {
      type: Boolean,
      default: false,
    },
    totalRecords: {
      default: 0,
    },
    searchActive: {
      type: Boolean,
      default: true,
    },
    searchDisabled: {
      type: Boolean,
      default: false
    },
    showRowNumber: {
      type: Boolean,
      default: true
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    pageJumpOption:{
      type: Boolean,
      default: false
    },
    sortAlllowed: {
      type: Boolean,
      default: true
    }
  },
  components: {
    Spinner
  },
  data() {
    return {
      commonStore: useCommonStore(),
      localRows: [],
      modifiedRows: [],
      modifiedRowsCopy: [],
      bgHead: "#B1F7FF",
      currentSelectedSorting: {
        field: "index",
        label: "defecto",
        date: false,
        desc: true,
      },
      noCoincidences: false,
      params: {
        currentPage: 1,
        currentPerPage: 10,
      },
      hiddenColumns: 0,
      localIsLoading: false
    };
  },
  computed: {
    totalPages: function () {
      return Math.ceil(this.totalRecords / this.params.currentPerPage);
    },
    offsetSelect: function () {
      let offset =
        this.params?.currentPage > 1
          ? (this.params?.currentPage - 1) * this.params.currentPerPage + 1
          : this.params?.currentPage;
      return offset;
    },
    language: function(){
      return this.commonStore.lang
    },
    placeHolderText: function(){
      return 'Buscar';
    },
    entriesText: function(){
      return 'Registros por pag: ';
    },
    previousText: function(){
      return 'Anterior';
    },
    PageText: function(){
      return 'Pag.';
    }, 
    nextText: function(){
      return 'Siguiente';
    },
    jumpPageText: function(){
      return 'Saltar a: ';
    },
  },
  watch: {
    rows: function (newVal, oldVal) {
      if (newVal && newVal.length > 0) {
        //Limpiamos el array de rows
        this.cleanBeforePopulate();
      }
    },
    columns: function (newVal, oldVal) {
      if (newVal && newVal.length > 0) {
        this.hiddenColumns = 0;
        for(const column of newVal){
          if(column.hidden){
            this.hiddenColumns++;
          }
        }
      }
    },
    isLoading: function(newVal, oldVal){
      this.localIsLoading = newVal;
    }
  },
  mounted() {
    if (this.rows && this.rows.length > 0) {
      //Limpiamos el array de rows
      this.cleanBeforePopulate();
    }
  },
  methods: {
    /**
     * Método asincrónico para limpiar los arrays antes de prepararlos para su modificación
     */
    async cleanBeforePopulate() {
      this.modifiedRows = await this.generateModifiedRows(
        this.rows,
        this.columns
      );
      this.modifiedRowsCopy = JSON.parse(JSON.stringify(this.modifiedRows));
    },
    clearTable(){
      this.modifiedRows = [];
    },

    /**
     * Método asincrónico para generar las filas adaptadas ordenadas según el objeto columns
     * @param: rows (filas a las que pasarle esto)
     * @param: columns (columnas sobre las que iterar)
     */
    async generateModifiedRows(rows, columns) {
        return Promise.all(  
          rows.map(async (row) => {
            const modifiedRow = {};
            await Promise.all(
              columns.map(async (column) => {
                const field = column.field;
                modifiedRow[field] = this.parseModifiedRows(column, row);
              })
            );
            return modifiedRow;
          })
        );
    },

    /**
     * Metodo para parsear Las filas modificadas
     */
    parseModifiedRows(column, row) {
      let field = column.field;
      let value = row[field] != null ? row[field] : null;
      let highlighted = row.highlighted? true : false;
      switch (column.type) {
        case "string":
          value = value.toString();
          break;
        case "number":
          value = Number(value);
          break;
        case "boolean":
          value = Boolean(value);
          break;
        default:
          break;
      }
      return {
        value: value,
        hidden: column.hidden ? true : false,
        hideValue: column.hideValue? true : false,
        maxWidth: column.maxWidth ? column.maxWidth : null,
        limited: column.limited ? true : null,
        type: column.type ? column.type : null,
        class: column.class ? column.class : "",
        style: column.style ? column.style : highlighted? 'color: rgb(236, 161, 161);':'',
      };
    },

    /**
     * Método para agregar una nueva fila por eventos
     */
    pushNewRow(row) {
      const modified = this.generateModifiedRows([row], this.columns);

      modified.forEach((item) => {
        this.modifiedRows.unshift(item);
        this.modifiedRows.pop();
      });
    },

    castValue(field) {
      const isStringOrNumber = typeof field.type !== 'string' && field.type !== 'number';
      const isNumericValue = !isNaN(field.value);
      const isDateValue = !isNaN(new Date(field.value.toString()).getTime());

      if (isStringOrNumber || isNumericValue) {
        return field.limited ? field.value : field.value;
      } else if (isDateValue && field.value.includes("/")) {
        return this.formatDate(field.value);
      } else {
        // Manejo de otros casos si es necesario
        return field.value;
      }
    },

    /****************************************
     * RESTO DE METODOS
     ***************************************/
    sortTable(field, label) {
      if(!this.sortAlllowed){
        return;
      }
      if (this.currentSelectedSorting.field != field) {
        //Reseteamos el modo de operación si seleccionamos un campo distinto
        this.currentSelectedSorting.field = field;
        this.currentSelectedSorting.label = label;
        this.currentSelectedSorting.date = false;
        this.currentSelectedSorting.desc = true;
      }

      //Recuperamos el array original y reseteamos los hidden de la tabla y el input por si acaso
      this.modifiedRows = JSON.parse(JSON.stringify(this.modifiedRowsCopy));
      this.resetTable();
      if(!this.searchDisabled){
        document.getElementById(this.searchActive? "buscar-fak-class":"i-buscar-fak-class").value = null;
      }
      if (field != "index") {
        if (
          this.modifiedRows.length > 0 &&
          this.modifiedRows[0][field].value != null
        ) {
          //Ejecutando ordenación

          //Determinamos qué tipo de dato queremos ordenar (utilizamos la primera fila de la lista si hay algun elemento)
          let dataType = field == 'senka' && typeof this.modifiedRows[0][field].value != 'number'? 'senka' : (
            typeof this.modifiedRows[0][field].value != "string" ||
            !isNaN(this.modifiedRows[0][field].value)
              ? true
              : isNaN(new Date(this.modifiedRows[0][field].value).getTime())
          )
            ? typeof this.modifiedRows[0][field].value
            : "date";

          switch (dataType) {
            case "string":
              //Si es una string la ordenamos mediante el método de ordenación de strings
              this.modifiedRows.sort(function (a, b) {
                return a[field].value.localeCompare(b[field].value);
              });
              break;
            case "number":
              //Si es un número lo ordenamos mediante el método de ordenación de números
              this.modifiedRows.sort(function (a, b) {
                return a[field].value < b[field].value
                  ? 1
                  : a[field].value > b[field].value
                  ? -1
                  : 0;
              });
              break;
            case "date":
              //Modificamos la bandera date del modo de operación
              this.currentSelectedSorting.date = true;
              //Si es un date lo ordenamos mediante el método de ordenación de números tras obtener el timestamp
              this.modifiedRows.sort(function (a, b) {
                let dateA = new Date(a[field].value);
                let dateB = new Date(b[field].value);
                return dateA.getTime() < dateB.getTime()
                  ? 1
                  : dateA.getTime() > dateB.getTime()
                  ? -1
                  : 0;
              });
              break;
            case "senka":
              this.modifiedRows.sort(function (a, b) {
                let parsedA = parseInt(a[field].value.match(/<span>(\d+)/)[1]);
                let parsedB = parseInt(b[field].value.match(/<span>(\d+)/)[1]);
                return parsedA < parsedB
                  ? 1
                  : parsedA > parsedB
                  ? -1
                  : 0;
              });
              break;
            case "undefined":
              //Si no tiene tipo no hacemos nada
              break;
            default:
              this.modifiedRows.sort(function (a, b) {
                //En cualquier otro caso ordenamos por string
                return a[field].value
                  .toString()
                  .localeCompare(b[field].value.toString());
              });
              break;
          }
        }
      }
      if (this.currentSelectedSorting.desc) {
        //Ordenación desdendente solicitada
        this.modifiedRows.reverse();
      }
      //Cambiamos el modo de operación
      this.currentSelectedSorting.desc = this.currentSelectedSorting.desc
        ? false
        : true;
      this.$emit("sortTable",this.modifiedRows);
    },
    formatDate(datestring) {
      let date = new Date(datestring);
      return dayjs(date).locale("es").format("DD/MM/YY HH:mm:ss");
    },
    filterTable(event) {
      //Tratamos la cadena de entrada
      let inputContent = this.normalizeString(event.target.value.toLowerCase());
      //Reseteamos la bandera de no coincidencias
      this.noCoincidences = false;
      //Creamos contador para filas ocultas
      let hiddenRows = 0;
      //Cogemos todas las filas normales
      let rowElements = document.getElementsByClassName("row-element");

      //Reseteamos la tabla
      this.resetTable();

      //Procedemos si el input no está vacío
      if (inputContent || inputContent != "") {
        //
        this.modifiedRows.forEach((row) => {
          let normalizedFields = [];
          this.columns.forEach((column) => {
            if (!column.hidden && row[column.field].value) {
              let normalizedField = (
                typeof row[column.field].value != "string" ||
                !isNaN(row[column.field].value)
                  ? true
                  : isNaN(new Date(row[column.field].value).getTime())
              )
                ? row[column.field].value
                : this.formatDate(row[column.field].value);
              normalizedFields.push(
                this.normalizeString(normalizedField.toString().toLowerCase())
              );
            }
          });
          let showRow = false;
          if (normalizedFields.length > 0) {
            normalizedFields.forEach((field) => {
              showRow = showRow == true ? true : field.includes(inputContent);
            });
          }
          //Hacemos la comprobación por cada fila
          if (!showRow) {
            //Si ninguno de los campos contiene la cadena del input, ocultamos la fila
            rowElements[this.modifiedRows.indexOf(row)].hidden = true;
            //Aumentamos el contador de filas ocultas
            hiddenRows++;
          }
        });
        //Comprobamos si tenemos que mostrar el mensaje de no coincidencias
        this.noCoincidences = hiddenRows == this.modifiedRows.length;
      }
    },
    /**
     * Normaliza una cadena para su comparación
     * @param {String} cadena Cadena a tratar
     */
    normalizeString(cadena) {
      return cadena.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    },
    resetTable() {
      //Mostramos todas las filas
      let rowElements = document.getElementsByClassName("row-element");
      for (let i = 0; i < rowElements.length; i++) {
        rowElements[i].hidden = false;
      }
    },
    changePage(sum) {
      this.params.currentPage += sum;
      if (this.params.currentPage == 0) {
        this.params.currentPage = 1;
      } else if (this.params.currentPage > this.totalPages) {
        this.params.currentPage = this.totalPages;
      } else {
        this.resetTable();
        if(!this.searchDisabled){
          document.getElementById(this.searchActive? "buscar-fak-class":"i-buscar-fak-class").value = null;
        }
        this.$emit("onPageChange", this.params);
      }
    },
    changePerPage(event) {
      this.resetTable();
      if(!this.searchDisabled){
        document.getElementById(this.searchActive? "buscar-fak-class":"i-buscar-fak-class").value = null;
      }
      this.params.currentPerPage = Number.parseInt(event.target.value);
      this.$emit("onPerPageChange", this.params);
    },
    jumpPage(e){
      let jump = e.target.value;
      if(!isNaN(jump) && parseFloat(jump) % 1 == 0 && parseInt(jump) > 0 && parseInt(jump) <= this.totalPages){
        this.params.currentPage = parseInt(jump);
        this.resetTable();
        if(!this.searchDisabled){
          document.getElementById(this.searchActive? "buscar-fak-class":"i-buscar-fak-class").value = null;
        }
        this.$emit("onPageChange", this.params);
      }
    },
    setParams(page, perPage){
      this.params.currentPage = page;
      this.params.currentPerPage = perPage;
    },
    expandField(rowIndex, e) {
      //console.log(e.target);
      const tablaDatos = this.$refs.tablaDatos;
      const fila = tablaDatos.querySelector(
        "tbody tr:nth-child(" + parseInt(rowIndex + 1) + ")"
      );
      //El primer td es el id
      const celdas = fila.querySelectorAll("td"); // Encuentra todas las celdas <td> dentro de la fila

      celdas.forEach((celda) => {
        const divDentroCelda = celda.querySelector("div"); // Encuentra el elemento <div> dentro de la celda
        if (divDentroCelda) {
          divDentroCelda.classList.toggle("text-truncate"); // Toogle de la clase 'text-truncate' en el <div> dentro de la celda
        }
      });
    },
    rowClipboard(rowIndex) {
      const tablaDatos = this.$refs.tablaDatos;
      const fila = tablaDatos.querySelector(
        "table tbody tr:nth-child(" + parseInt(rowIndex + 1) + ")"
      );

      const contenidoFila = fila.innerText;
      navigator.clipboard
        .writeText(contenidoFila)
        .then(() => {
          console.log("Contenido copiado al portapapeles: " + contenidoFila);
        })
        .catch((err) => {
          console.error("Error al copiar al portapapeles:", err);
        });
    },
  },
};
</script>
  
<style scoped>
table {
  font-size: 0.785rem;
}

thead {
  font-size: 0.8rem;
}

tbody > tr {
  cursor: pointer;
}

.numPaginas {
  font-size: 0.9rem;
}

.tablaOpciones {
  font-size: 0.85rem;
}

.pageChangeArrow {
  cursor: pointer;
  display: inline-block;
  position: relative;
  padding-bottom: 5px;
}

.pageChangeArrow:after {
  background: none repeat scroll 0 0 transparent;
  bottom: 0;
  content: "";
  display: block;
  height: 2px;
  left: 50%;
  position: absolute;
  background: #487e02;
  transition: width 0.3s ease 0s, left 0.3s ease 0s;
  width: 0;
}
.pageChangeArrow:hover:after {
  width: 100%;
  left: 0;
}

/* Estilos para la animación */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>