//Importaciones e inicializaciones
let mongoose = require('mongoose');

/**********************************************************/
/* FUNC: Guardar datos en la base de datos  
   @dataSchema: Esquema de datos vinculado al modelo de datos
   @successMessage: Mensaje de exito que se le quiere mostrar al usuario
   @errMessage: Mensaje de error para mostrarle la usuario
*/
/*******************************************************/
function saveDB(dataSchema, succesMessage, errMessage) {
  return new Promise(function (resolve, reject) {
    let res = {
      data: null,
      success: null,
      message: null,
      code: 500
    }
    dataSchema.save()
      .then(data => {
        res.data = data
        res.success = true
        res.message = succesMessage
        res.code = 200
        resolve(res)
      })
      .catch(err => {
        console.error(err);
        res.data = errMessage
        res.success = false
        res.code = err.code
        res.message = errMessage
        reject(res)
      })
  });
}

/**********************************************************/
/* FUNC: Buscar datos en la base de datos  
   @dataModel: Modelo de datos que se va a tratar
   @searchParams: Parámetros para la busqueda selectiva de datos
                  Usar null para recuperar de todos los registros (findAll)
   @successMessage: Mensaje de exito que se le quiere mostrar al usuario
   @errMessage: Mensaje de error para mostrarle la usuario
*/
/*******************************************************/
function findDB(dataModel, searchParams, successMessage, errMessage, populateFields = [], sortParams = {}, skip = 0, limit = 0) {
  return new Promise(function (resolve, reject) {
    let res = {
      data: null,
      success: null,
      message: null,
      code: 500
    };

    let query = dataModel.find(searchParams);

    // Agregar populate
    populateFields.forEach(field => {
      query = query.populate(field);
    });

    // Agregar sort
    if (sortParams && Object.keys(sortParams).length > 0) {
      query = query.sort(sortParams);
    }

    // Agregar paginación
    if (skip > 0) {
      query = query.skip(skip);
    }
    if (limit > 0) {
      query = query.limit(limit);
    }

    // Ejecutar query
    query
      .then(data => {
        res.data = data;
        res.success = true;
        res.message = successMessage;
        res.code = 200;
        resolve(res);
      })
      .catch(err => {
        console.error(err);
        res.data = errMessage;
        res.message = errMessage;
        res.success = false;
        res.code = 500;
        resolve(res);
      });
  });
}

/**********************************************************/
/* FUNC: Busca el primer resultado que cumpla el parámetro de búsqueda en la base de datos  
   @dataModel: Modelo de datos que se va a tratar
   @searchParams: Parámetros para la busqueda selectiva de datos
                  Usar null para recuperar de todos los registros (findAll)
   @populations: Poblar colecciones que están referenciadas a otros modelos de datos vinculados
                 Se pueden poblar varias haciendo 'col1 col2 col3'
   @successMessage: Mensaje de exito que se le quiere mostrar al usuario
   @errMessage: Mensaje de error para mostrarle la usuario
*/
/*******************************************************/
function findOneDB(dataModel, searchParams, populations, succesMessage, errMessage) {
  return new Promise(function (resolve, reject) {
    let res = {
      data: null,
      success: null,
      message: null,
      code: 500
    }
    dataModel.findOne(searchParams)
      .populate(populations)
      .then(data => {
        res.data = data
        res.success = true
        res.message = succesMessage
        res.code = 200
        resolve(res)
      })
      .catch(err => {
        console.error(err);
        res.data = errMessage
        res.message = errMessage
        res.success = false
        res.code = 500
        resolve(res)
      })
  });
}

/**********************************************************/
/* FUNC: Los resuultados que cumplan las especificaciones de búsqueda en la base de datos  
   @dataModel: Modelo de datos que se va a tratar
   @searchParams: Parámetros para la busqueda selectiva de datos
                  Usar null para recuperar de todos los registros (findAll)
   @populations: Poblar colecciones que están referenciadas a otros modelos de datos vinculados
                 Se pueden poblar varias haciendo 'col1 col2 col3'
   @sorts: Parámetros de ordenación de resultados de búsqueda
   @limit: número de resultados a mostrar              
   @successMessage: Mensaje de exito que se le quiere mostrar al usuario
   @errMessage: Mensaje de error para mostrarle la usuario
*/
/*******************************************************/
function findExtended(dataModel, searchParams, populations, sorts, limit, succesMessage, errMessage) {
  return new Promise(function (resolve, reject) {
    let res = {
      data: null,
      success: null,
      message: null,
      code: 500
    }
    dataModel.find(searchParams)
      .sort(sorts)
      .limit(limit)
      .populate(populations)
      .then(data => {
        res.data = data
        res.success = true
        res.message = succesMessage
        res.code = 200
        resolve(res)
      })
      .catch(err => {
        console.error(err);
        res.data = errMessage
        res.message = errMessage
        res.success = false
        res.code = 500
        resolve(res)
      })
  });
}
/**********************************************************/
/* FUNC: Idéntica a la anterior pero con una populación más
*/
/*******************************************************/
function findExtended2(dataModel, searchParams, pop1, pop2, sorts, limit, succesMessage, errMessage) {
  return new Promise(function (resolve, reject) {
    let res = {
      data: null,
      success: null,
      message: null,
      code: 500
    }
    dataModel.find(searchParams)
      .sort(sorts)
      .limit(limit)
      .populate(pop1)
      .populate(pop2)
      .then(data => {
        res.data = data
        res.success = true
        res.message = succesMessage
        res.code = 200
        resolve(res)
      })
      .catch(err => {
        console.error(err);
        res.data = errMessage
        res.message = errMessage
        res.success = false
        res.code = 500
        resolve(res)
      })
  });
}

/**********************************************************/
/* FUNC: Idéntica a la anterior pero añadiendo una populación más y funcionalidad de collation y skip
   @colParam: Parametro para usar el método collation(), en español, intercalación, 
   que permite puntualizar reglas específicas del idioma para la 
   comparación de cadenas, como reglas para letras y tildes.
   @offset: Documentos que van a ser ignorados en la búsqueda con el método .skip()
*/
/*******************************************************/
function findExtended3(dataModel, searchParams, pop1, pop2, pop3, sorts, limit, colParam, offset, succesMessage, errMessage) {
  return new Promise(function (resolve, reject) {
    let res = {
      data: null,
      success: null,
      message: null,
      code: 500
    }
    dataModel.find(searchParams)
      .sort(sorts)
      .populate(pop1)
      .populate(pop2)
      .populate(pop3)
      .collation(colParam)
      .skip(offset)
      .limit(limit)
      .then(data => {
        res.data = data
        res.success = true
        res.message = succesMessage
        res.code = 200
        resolve(res)
      })
      .catch(err => {
        console.error(err);
        res.data = errMessage
        res.message = errMessage
        res.success = false
        res.code = 500
        resolve(res)
      })
  });
}


/**********************************************************/
/* FUNC: Busca y devuelve la lista de un campo especificado de una colleción
   @dataModel: Modelo de datos que se va a tratar
   @searchParams: Parámetros para la busqueda selectiva de datos
                  Usar null para recuperar de todos los registros (findAll)
   @listParams: nombre de la lista. En llamada a función debe ir en comillas simples, ejemplo: 'alias -_id'
   @successMessage: Mensaje de exito que se le quiere mostrar al usuario
   @errMessage: Mensaje de error para mostrarle la usuario
*/
/*******************************************************/
function findListDB(dataModel, searchParams, listParams, succesMessage, errMessage) {
  return new Promise(function (resolve, reject) {
    let res = {
      data: null,
      success: null,
      message: null,
      code: 500
    }
    dataModel.find(searchParams)
      .select(listParams)
      .then(data => {
        res.data = data
        res.success = true
        res.message = succesMessage
        res.code = 200
        resolve(res)
      })
      .catch(err => {
        console.error(err);
        res.data = errMessage
        res.message = errMessage
        res.success = false
        res.code = 500
        resolve(res)
      })
  });
}

/****************************************/
/* FUNC: Borrar todas las entradas de la base de datos que cumplan el parámetro de borrado
   @dataModel: Modelo de datos que se va a tratar
   @deleteParams: Parámetros para el borrado selectivo de datos 
                  Usar null para borrar todos los datos
   @successMessage: Mensaje de exito que se le quiere mostrar al usuario
   @errMessage: Mensaje de error para mostrarle la usuario
*/
/**************************************/
function delDB(dataModel, deleteParams, succesMessage, errMessage) {
  return new Promise(function (resolve, reject) {
    let res = {
      data: null,
      success: null,
      message: null,
      code: 500
    }
    dataModel.deleteMany(deleteParams)
      .then(data => {
        res.data = data
        res.success = true
        res.message = succesMessage
        res.code = 200
        resolve(res)
      })
      .catch(err => {
        console.error(err);
        res.data = errMessage
        res.message = errMessage
        res.success = false
        res.code = 500
        resolve(res)
      })
  });
}

/****************************************/
/* FUNC: Borrar la primera entrada de la base de datos que cumpla el parámetro de borrado
   @dataModel: Modelo de datos que se va a tratar
   @deleteParams: Parámetros para el borrado selectivo de datos 
                  Usar null para borrar todos los datos
   @successMessage: Mensaje de exito que se le quiere mostrar al usuario
   @errMessage: Mensaje de error para mostrarle la usuario
*/
/**************************************/
function delOneDB(dataModel, deleteParams, succesMessage, errMessage) {
  return new Promise(function (resolve, reject) {
    let res = {
      data: null,
      success: null,
      message: null,
      code: 500
    }
    dataModel.deleteOne(deleteParams)
      .then(data => {
        res.data = data
        res.success = true
        res.message = succesMessage
        res.code = 200
        resolve(res)
      })
      .catch(err => {
        console.error(err);
        res.data = errMessage
        res.message = errMessage
        res.success = false
        res.code = 500
        resolve(res)
      })
  });
}

/****************************************/
/* FUNC: Borrar coleccion completa de la base de datos
   @dataModel: Modelo de datos que se va a tratar, coleccion a borrar.
   @successMessage: Mensaje de exito que se le quiere mostrar al usuario
   @errMessage: Mensaje de error para mostrarle la usuario
*/
/**************************************/
function cleanCollection(dataModel, succesMessage, errMessage) {
  return new Promise(function (resolve, reject) {
    let res = {
      data: null,
      success: null,
      message: null,
      code: 500
    }
    dataModel.deleteMany({})
      .then(data => {
        res.data = data
        res.success = true
        res.message = succesMessage
        res.code = 200
        resolve(res)
      })
      .catch(err => {
        console.error(err);
        res.data = errMessage
        res.message = errMessage
        res.success = false
        res.code = 500
        resolve(res)
      })
  });
}

/****************************************/
/* FUNC: Actualiza el campo indicado de UN documento de la colleción indicada
   @dataModel: Modelo de datos que se va a tratar, coleccion a actualizar.
   @targetID: ID del documento que se quiere actualizar.
   @targetField: nuevo valor para el campo del documento.
   @successMessage: Mensaje de exito que se le quiere mostrar al usuario
   @errMessage: Mensaje de error para mostrarle la usuario
*/
/**************************************/
function updateOneDB(dataModel, targetID, targetField, succesMessage, errMessage) {
  
  return new Promise(function (resolve, reject) {
    let res = {
      data: null,
      success: null,
      message: null,
      code: 500
    }
    dataModel.updateOne(targetID, targetField)
      .then(data => {
        res.data = data
        res.success = true
        res.message = succesMessage
        res.code = 200
        resolve(res)
      })
      .catch(err => {
        console.error(err);
        res.data = errMessage
        res.message = errMessage
        res.success = false
        res.code = 500
        resolve(res)
      })
  });
}

/****************************************/
/* FUNC: Actualiza el campo indicado de UN documento de la colleción indicada con opciones
   @dataModel: Modelo de datos que se va a tratar, coleccion a actualizar.
   @targetID: ID del documento que se quiere actualizar.
   @targetField: nuevo valor para el campo del documento.
   @successMessage: Mensaje de exito que se le quiere mostrar al usuario
   @errMessage: Mensaje de error para mostrarle la usuario
*/
/**************************************/
function updateOneDBWithOptions(dataModel, targetID, targetField, options, succesMessage, errMessage) {
  
  return new Promise(function (resolve, reject) {
    let res = {
      data: null,
      success: null,
      message: null,
      code: 500
    }
    dataModel.updateOne(targetID, targetField, options)
      .then(data => {
        res.data = data
        res.success = true
        res.message = succesMessage
        res.code = 200
        resolve(res)
      })
      .catch(err => {
        console.error(err);
        res.data = errMessage
        res.message = errMessage
        res.success = false
        res.code = 500
        resolve(res)
      })
  });
}

/****************************************/
/* FUNC: Actualiza el campo indicado de todos los documento de la colleción indicada que cumplan la condición
   @dataModel: Modelo de datos que se va a tratar, coleccion a actualizar.
   @targetID: ID del documento que se quiere actualizar.
   @targetField: nuevo valor para el campo del documento.
   @successMessage: Mensaje de exito que se le quiere mostrar al usuario
   @errMessage: Mensaje de error para mostrarle la usuario
*/
/**************************************/
function updateDB(dataModel, condition, targetField, succesMessage, errMessage) {
  return new Promise(function (resolve, reject) {
    let res = {
      data: null,
      success: null,
      message: null,
      code: 500
    }
    dataModel.update(condition, targetField)
      .then(data => {
        res.data = data
        res.success = true
        res.message = succesMessage
        res.code = 200
        resolve(res)
      })
      .catch(err => {
        console.error(err);
        res.data = errMessage
        res.message = errMessage
        res.success = false
        res.code = 500
        resolve(res)
      })
  });
}

/****************************************/
/* FUNC: cuenta el número de ocurrencias encontradas para cierta coleccion bajo cienta condición, devuelve un Number
   @dataModel: Modelo de datos que se va a tratar, coleccion en la que buscar.
   @countParam: Condición para realizar el conteo.
   @successMessage: Mensaje de exito que se le quiere mostrar al usuario
   @errMessage: Mensaje de error para mostrarle la usuario
*/
/**************************************/
function countDB(dataModel, countParam, succesMessage, errMessage){
  return new Promise(function (resolve, reject) {
    let res = {
      data: null,
      success: null,
      message: null,
      code: 500
    }
    dataModel.count(countParam)
      .then(data => {
        res.data = data
        res.success = true
        res.message = succesMessage
        res.code = 200
        resolve(res)
      })
      .catch(err => {
        console.error(err);
        res.data = errMessage
        res.message = errMessage
        res.success = false
        res.code = 500
        resolve(res)
      })
  });
}

/****************************************/
/* FUNC: cuenta el número de ocurrencias encontradas para cierta coleccion bajo cienta condición, devuelve un Number
   A diferencia de count, countDocument no usa los metadatos para devolver el recuento. 
   En su lugar, realiza una agregación del documento para devolver un recuento preciso, 
   incluso después de un cierre no limpio o en presencia de documentos huérfanos en un grupo fragmentado.
   @dataModel: Modelo de datos que se va a tratar, coleccion en la que buscar.
   @countParam: Condición para realizar el conteo.
   @successMessage: Mensaje de exito que se le quiere mostrar al usuario
   @errMessage: Mensaje de error para mostrarle la usuario
*/
/**************************************/
function countDocumentsDB(dataModel, countParam, succesMessage, errMessage){
  return new Promise(function (resolve, reject) {
    let res = {
      data: null,
      success: null,
      message: null,
      code: 500
    }
    dataModel.countDocuments(countParam)
      .then(data => {
        res.data = data
        res.success = true
        res.message = succesMessage
        res.code = 200
        resolve(res)
      })
      .catch(err => {
        console.error(err);
        res.data = errMessage
        res.message = errMessage
        res.success = false
        res.code = 500
        resolve(res)
      })
  });
}

/****************************************/
/* FUNC: Crea una coleccion completa en la base de datos.
   @collectionName: Nombre de la colección a crear.
   @errMessage: Mensaje de error para mostrarle la usuario.
*/
/**************************************/
function createCollectionDB(collectionName, errMessage) {
  mongoose.connection.db.createCollection(collectionName, (err) => {
    console.log(errMessage + " " + err);
  })
}

//Exportamos la función
module.exports = {
  saveDB,
  findDB,
  findOneDB,
  findExtended,
  findExtended2,
  findExtended3,
  findListDB,
  delDB,
  delOneDB,
  cleanCollection,
  updateOneDB,
  updateOneDBWithOptions,
  updateDB,
  countDB,
  countDocumentsDB,
  createCollectionDB
  
}