<template>
  <div>
    <BlockFull titulo="Logs del sistema">
      <template v-slot:content>
        <div class="row">
          <!-- Filtro por tipo de log -->
          <div class="col-4">
            <Select
              v-model="findParams.authorizer"
              id="find-authorizer"
              label="Seleccione el tipo"
              icon="fas fa-filter"
              :options="options"
              valKey="name"
              textKey="name"
              @change="changeTypeFind($event)"
              :allowNullDefault="true"
              defaultText="Cualquiera"
            />
          </div>
          <!-- Tabla de logs -->
          <div class="col-12">
            <Table 
              ref="logsTable" 
              :columns="logs_columns" 
              :rows="logs_rows" 
              id="logsTable" 
              :isLoading="loadingTable"
              :serverSize="true" 
              :totalRecords="totalRecords" 
              :showOptions="false" 
              :searchActive="false"
              :searchDisabled="true" 
              :showRowNumber="false" 
              :pageJumpOption="true" 
              :sortAlllowed="false"
              @onPageChange="onPageChange" 
              @onPerPageChange="onPerPageChange"
            />
          </div>
        </div>
      </template>
    </BlockFull>
  </div>
</template>

<script>
import dayjs from 'dayjs';
import LogsService from '../../../services/LogsService';
import Table from "../../../components/commons/Table.vue";
import BlockFull from "@/components/commons/BlockFull";
import Select from "@/components/commons/Select";

export default {
  components: {
    Table,
    BlockFull,
    Select
  },
  data() {
    return {
      // Datos de logs obtenidos del servidor
      logs: null,
      // Estado de carga de la tabla
      loadingTable: false,
      // Total de registros para paginación
      totalRecords: 0,
      // Definición de columnas de la tabla
      logs_columns: [
        {
          label: 'Tipo',
          field: "type",
          type: "html",
          class: "text-center",
        },
        {
          label: 'Log',
          field: "log",
          type: "string",
          class: "text-center",
        },
        {
          label: 'Fecha',
          field: "createdAt",
          type: "string",
          class: "text-center",
        }
      ],
      // Filas a mostrar en la tabla
      logs_rows: [],
      // Parámetros de búsqueda
      findParams: {
        type: null
      },
      // Parámetros de paginación del servidor
      serverParams: {
        page: 1,
        perPage: 10,
      },
      // Opciones para el filtro de tipo de log
      options: [
        { name: "CREATE PROPERTY" },
        { name: "CREATE USER" },
        { name: "CREATE DOC" },
        { name: "CREATE ROLE" },
        { name: "MODIFY USER" },
        { name: "MODIFY DOC" },
        { name: "MODIFY PROPERTY" },
        { name: "MODIFY PANEL" },
        { name: "MODIFY ROLE" },
        { name: "DELETE ROLE" },
        { name: "DELETE USER" },
        { name: "DELETE PROPERTY" },
        { name: "DELETE DOC" },
        { name: "SYSTEM ACCESS" }
      ]
    };
  },
  mounted() {
    // Al montar el componente, obtener los logs
    this.retrieveLogs();
  },
  methods: {
    /**
     * Actualiza los parámetros de paginación del servidor
     * @param {*} newProps
     */
    updateParams(newProps) {
      this.serverParams = Object.assign({}, this.serverParams, newProps);
    },

    /**
     * Cambia la página actual de la tabla
     * @param {Object} params
     */
    onPageChange(params) {
      this.updateParams({ page: params.currentPage });
      this.retrieveLogs();
    },

    /**
     * Cambia el número de registros por página
     * @param {Object} params
     */
    onPerPageChange(params) {
      this.updateParams({ perPage: params.currentPerPage });
      this.retrieveLogs();
    },

    /**
     * Obtiene los logs del servidor según los filtros y paginación
     */
    async retrieveLogs() {
      let useFindParams = {};
      if (this.findParams.type && this.findParams.type != '') {
        useFindParams['logType'] = this.findParams.type;
      }

      try {
        this.loadingTable = true;
        const response = await LogsService.getLogsList(this.serverParams, useFindParams);
        if (response.data) {
          this.logs = response.data.data;
          this.totalRecords = response.data.totalRecords;
        } else {
          this.logs = null;
        }
        await this.populateLogsRows();
        this.loadingTable = false;
      } catch (err) {
        console.log(err);
        this.logs_rows = [];
        this.$refs.logsTable.clearTable();
        this.loadingTable = false;
      }
    },

    /**
     * Llena las filas de la tabla con los datos de logs
     */
    populateLogsRows() {
      return new Promise((resolve, reject) => {
        this.logs_rows = [];
        let localLogsRow = [];
        if (this.logs && this.logs.length > 0) {
          for (const entry of this.logs) {
            let color = this.getColor(entry.logType);
            let newRow = {
              type: `<div class="p2 rounded bg-${color} text-white fw-bold">${entry.logType}</div>`,
              log: entry.log,
              createdAt: dayjs(entry.createdAt).format('DD-MM-YYYY H:mm A')
            };
            localLogsRow.push(newRow);
          }
          this.logs_rows = JSON.parse(JSON.stringify(localLogsRow));
        } else {
          // Si no hay logs, limpiar la tabla
          this.$refs.docsTable.clearTable();
        }
        resolve();
      });
    },

    /**
     * Devuelve el color de fondo según el tipo de log
     * @param {String} type
     * @returns {String}
     */
    getColor(type) {
      switch (type.split(' ')[0]) {
        case 'CREATE':
          return 'primary';
        case 'MODIFY':
          return 'success';
        case 'DELETE':
          return 'danger';
        case 'SYSTEM':
          return 'info';
      }
    },

    /**
     * Cambia el filtro de tipo de log y recarga los datos
     * @param {Event} event
     */
    changeTypeFind(event) {
      this.findParams.type = event.target.value;
      this.logs_rows = [];
      this.$refs.logsTable.clearTable();
      this.retrieveLogs();
    }
  }
};
</script>

<style scoped>
/* Estilos específicos del componente (vacío) */
</style>