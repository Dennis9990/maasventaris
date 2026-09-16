const registerAssetHandlers = require('./assets');
const registerCategoriesHandlers = require('./categories');
const registerExcelHandlers = require('./excel');

function registerIpcHandlers(db) {
    registerAssetHandlers(db);
    registerCategoriesHandlers(db);
    registerExcelHandlers(db);
}

module.exports = registerIpcHandlers;