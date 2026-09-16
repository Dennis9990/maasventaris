const { app, BrowserWindow } = require('electron');
const initializeDatabase = require('./database');
const createWindow = require('./windows/mainWindows');
const registerIpcHandlers = require('./ipc');

app.whenReady().then(async() => {

    const db = await initializeDatabase();

    registerIpcHandlers(db);

    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});


app.on('window-all-closed', () => {

    if (process.platform !== 'darwin') {
        app.quit();
    }

});