const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('inventoryAPI', {

    // Assets
    getAssets: () =>
        ipcRenderer.invoke('assets:getAll'),

    getAssetById: (id) =>
        ipcRenderer.invoke('assets:getById', id),

    addAsset: (asset) =>
        ipcRenderer.invoke('assets:add', asset),

    updateAsset: (asset) =>
        ipcRenderer.invoke('assets:update', asset),

    deleteAsset: (id) =>
        ipcRenderer.invoke('assets:delete', id),

    getAssetHistory: () =>
        ipcRenderer.invoke('assets:getHistory'),

    restoreAsset: (id) =>
        ipcRenderer.invoke('assets:restore', id),

    getAssetHistoryById: (id) =>
        ipcRenderer.invoke('assets:getHistoryById', id),

    moveAssetToHistory: (id) =>
    ipcRenderer.invoke('assets:moveToHistory', id),

    // Categories
    getCategories: () =>
        ipcRenderer.invoke('categories:getAll'),

    addCategory: (name) =>
        ipcRenderer.invoke('categories:add', name),

    // Excel
    selectExcelFile: () =>
        ipcRenderer.invoke('excel:select'),

    readExcelFile: (filePath) =>
        ipcRenderer.invoke('excel:read', filePath),

    analyzeExcelFile: (filePath) =>
        ipcRenderer.invoke('excel:import', filePath),

    importExcelData: (data) =>
        ipcRenderer.invoke('excel:importConfirmed', data)

});