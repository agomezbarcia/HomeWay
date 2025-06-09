// Importamos el modelo de logs
const Log = require('../models').logs;

/**
 * Función para crear y guardar un nuevo log en la base de datos
 * @param {String} type - Tipo de log
 * @param {String} message - Mensaje del log
 * @param {String} user - Usuario relacionado con el log
 * @returns {Promise}
 */
exports.postLog = (type, message, user) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Creamos una nueva instancia del log
            const NewLog = new Log({
                logType: type,
                log: message,
                user: user
            });
            // Guardamos el log en la base de datos
            await NewLog.save();
            resolve();
        } catch (err) {
            // En caso de error, rechazamos la promesa
            reject(err);
        }
    });
}

/**
 * Controlador para obtener la lista de logs con filtros, orden y paginación
 * @param {Object} req - Objeto de solicitud HTTP
 * @param {Object} res - Objeto de respuesta HTTP
 */
exports.getLogsList = async (req, res) => {
    try {
        // Obtenemos los parámetros del servidor desde los headers
        let serverParams = req.headers.serverParams ? JSON.parse(req.headers.serverParams) : req.headers.serverparams ? JSON.parse(req.headers.serverparams) : {};
        // Obtenemos los parámetros de búsqueda desde los headers
        let findParams = req.headers.findParams ? JSON.parse(req.headers.findParams) : req.headers.findparams ? JSON.parse(req.headers.findparams) : {};
        // Obtenemos los parámetros de ordenación desde los headers
        let sortParams = req.headers.sortParams ? JSON.parse(req.headers.sortParams) : req.headers.sortparams ? JSON.parse(req.headers.sortparams) : { _id: -1 };
        
        // Si el tipo de log es "default", no aplicamos filtros
        findParams = findParams.logType == "default" ? {} : findParams;

        // Definimos el límite y el offset para la paginación
        let limit = serverParams.perPage;
        let offset = limit * (serverParams.page - 1);

        // Contamos el número total de documentos que cumplen con los filtros
        const LogsCount = await Log.countDocuments(findParams);

        // Buscamos los logs aplicando filtros, orden y paginación
        const foundLogs = await Log.find(findParams).sort(sortParams).skip(offset).limit(limit);

        // Si se encontraron logs, los devolvemos junto con el total de registros
        if (foundLogs && foundLogs.length > 0) {
            let response = {
                data: foundLogs,
                totalRecords: LogsCount
            }
            return res.status(200).send({ data: response, code: 2001 });
        } else {
            // Si no se encontraron logs, devolvemos un mensaje informativo
            return res.status(200).send({ message: 'No se encontraron logs', code: 3001 });
        }
    } catch (err) {
        // En caso de error, lo mostramos por consola y devolvemos un mensaje de error
        console.error("Log controller: getLogsList")
        console.error(err);
        return res.status(500).send({ message: "Ha ocurrido un error procesando su solicitud", code: 3000 });
    }
}