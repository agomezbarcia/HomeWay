// Importación de módulos y variables globales
const CollectionInstaller = require("./install/collectionInstaller");
const COLLECTIONS_DATA = require("./constans/collections.data");
const Models = require("../models");
const ROLES_DATA = require("./constans/user.roles");

/*
  @ Title: Iniciador de colecciones en base de datos en función del panel
  @ acronym: acronimo del proyecto
*/

// Función principal para inicializar las colecciones necesarias en la base de datos
async function initDBCollections(acronym) {
  // Instala los usuarios por defecto en la colección de usuarios
  await CollectionInstaller.installCollection(ROLES_DATA.defaultUsers, Models.user);

  // Instala los roles en la colección de roles
  await CollectionInstaller.installCollection(ROLES_DATA.roles, Models.roles);
}

// Exportación de la función para su uso en otros módulos
module.exports = {
  initDBCollections
};