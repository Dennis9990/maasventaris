const { autoUpdater } = require('electron-updater');
const { dialog } = require('electron');

function initializeUpdater() {

    if (!require('electron').app.isPackaged) {
        console.log('[Updater] Development mode - update check skipped.');
        return;
    }

    autoUpdater.autoDownload = true;
    autoUpdater.autoInstallOnAppQuit = true;

    autoUpdater.on('checking-for-update', () => {
        console.log('[Updater] Checking for updates...');
    });

    autoUpdater.on('update-available', info => {
        console.log(
            `[Updater] Update available: ${info.version}`
        );
    });

    autoUpdater.on('update-not-available', () => {
        console.log('[Updater] Application is up to date.');
    });

    autoUpdater.on('update-downloaded', info => {

        console.log(
            `[Updater] Update downloaded: ${info.version}`
        );

        dialog.showMessageBox({
            type: 'info',
            title: 'Update beschikbaar',
            message: 'Een nieuwe versie van Maasventaris is klaar.',
            detail: 'De update wordt geïnstalleerd wanneer Maasventaris opnieuw wordt gestart.',
            buttons: ['OK']
        });

    });

    autoUpdater.on('error', error => {
        console.error(
            '[Updater] Update error:',
            error
        );
    });

    autoUpdater.checkForUpdates();

}

module.exports = initializeUpdater;