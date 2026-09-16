import { initializeNavigation } from './navigation.js';
import { initializeInventory, loadInventory } from './inventory.js';
import { loadCategories, initializeCategories } from './categories.js';
import { initializeAssetForm } from './assetForm.js';
import { initializeAssetDetails, openAssetDetails, openHistoricalAssetDetails } from './assetDetails.js';
import { initializeExcelImport } from './excelImport.js';
import { initializeBarcode } from './barcode.js';

async function initializeApp() {

    try {

        initializeNavigation();
        initializeInventory({ onOpenAssetDetails: openAssetDetails, onOpenHistoricalAssetDetails: openHistoricalAssetDetails });
        initializeAssetForm();
        initializeAssetDetails();
        initializeCategories();
        initializeExcelImport();
        initializeBarcode({ onOpenAssetDetails: openAssetDetails });

        await loadCategories();

        await loadInventory();

        console.log('[Renderer] Application initialized successfully.');

    } catch (error) {
        console.error('[Renderer] Failed to initialize application:', error);
    }
}

initializeApp();