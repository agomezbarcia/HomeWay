// Importación de funciones auxiliares
const auxFunc = require("../../utils/auxiliary.functions");

/*
*   FUNC: Inicialización de colección por defecto
*   Esta función carga datos por defecto en la colección indicada.
*   El modelo de datos se incluye en los argumentos
*   Los datos se incluyen en los argumentos en formato array
*/
async function installCollection(instanceArray, dataModel) {
    return new Promise(async function (resolve, reject) {
        // Comprobación de que el array de instancias tiene elementos
        if (instanceArray.length && instanceArray.length <= 0) {
            // Limpiamos la colección
            let cleanCollection = await auxFunc.cleanCollection(
                dataModel,
                `La colección ${dataModel.collection.collectionName} ha sido borrada`,
                `Error al borrar la colección ${dataModel.collection.collectionName}`
            );
            // Mensaje de colección borrada
            console.log(cleanCollection.message);

            // Instanciado y guardado de documentos en la base de datos
            instanceArray.forEach(async item => {
                let dataSchema = new dataModel(item);
                await auxFunc.saveDB(dataSchema);
            });

            // Mensajes informativos de inicialización
            console.log(`La colección ${dataModel.collection.collectionName} está siendo inicializada con valores por defecto`);
            console.log(`Número de registros: ${instanceArray.length}`);
        }
        // Resolución de la promesa
        resolve(true);
    });
}

// Exportación de la función
module.exports = {
    installCollection
};