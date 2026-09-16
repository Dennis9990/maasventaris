import { escapeHtml } from './utils.js';
import { updateDashboard } from './dashboard.js';

let assets = [];
let historicalAssets = [];
let openAssetDetailsCallback = null;
let openHistoricalAssetDetailsCallback = null;


function initializeInventory(options = {}) {

    const searchInput = document.getElementById('search-input');
    const historicalSearchInput = document.getElementById('historical-search-input');
    const actualAssetsTab = document.getElementById('actual-assets-tab');
    const historicalAssetsTab = document.getElementById('historical-assets-tab');

    if (
        typeof options.onOpenAssetDetails === 'function'
    ) {

        openAssetDetailsCallback = options.onOpenAssetDetails;

    }


    if (searchInput) {

        searchInput.addEventListener(
            'input',
            renderInventory
        );

    }


    if (historicalSearchInput) {

        historicalSearchInput.addEventListener(
            'input',
            renderHistoricalInventory
        );

    }

    if (
        typeof options.onOpenHistoricalAssetDetails === 'function'
    ) {

        openHistoricalAssetDetailsCallback = options.onOpenHistoricalAssetDetails;

    }

    if (actualAssetsTab) {

        actualAssetsTab.addEventListener(
            'click',
            () => switchInventoryTab('actual')
        );

    }

    if (historicalAssetsTab) {

        historicalAssetsTab.addEventListener(
            'click',
            () => switchInventoryTab('historical')
        );

    }

}

function switchInventoryTab(tab) {

    const actualAssetsTab = document.getElementById('actual-assets-tab');
    const historicalAssetsTab = document.getElementById('historical-assets-tab');
    const actualAssetsContent = document.getElementById('actual-assets-content');
    const historicalAssetsContent = document.getElementById('historical-assets-content');

    if (actualAssetsTab) {
        actualAssetsTab.classList.toggle('active', tab === 'actual');
    }


    if (historicalAssetsTab) {
        historicalAssetsTab.classList.toggle('active', tab === 'historical');
    }


    if (actualAssetsContent) {
        actualAssetsContent.classList.toggle('active', tab === 'actual');
    }


    if (historicalAssetsContent) {
        historicalAssetsContent.classList.toggle('active', tab === 'historical');
    }


    if (tab === 'historical') {

        loadHistoricalAssets();

    }

}


async function loadInventory() {

    try {

        const loadedAssets = await window.inventoryAPI.getAssets();

        assets =
            Array.isArray(loadedAssets)
                ? loadedAssets
                : [];


        renderInventory();
        updateDashboard(assets);


    } catch (error) {

        console.error('[Inventory] Error loading inventory:', error);

    }

}


async function loadHistoricalAssets() {

    try {

        const loadedAssets =
            await window.inventoryAPI.getAssetHistory();


        historicalAssets =
            Array.isArray(loadedAssets)
                ? loadedAssets
                : [];


        renderHistoricalInventory();


    } catch (error) {
        console.error('[Inventory] Error loading historical inventory:', error);
    }

}


function renderInventory() {

    const table =
        document.getElementById(
            'inventory-table'
        );


    if (!table) {

        console.error(
            '[Inventory] Inventory table not found.'
        );

        return;

    }


    const searchInput =
        document.getElementById(
            'search-input'
        );


    const search =
        searchInput
            ? searchInput.value
                .toLowerCase()
                .trim()
            : '';


    const filteredAssets =
        assets.filter(asset => {

            return [
                asset.asset_id,
                asset.barcode,
                asset.category,
                asset.brand,
                asset.type,
                asset.serial_number
            ]
                .filter(
                    value =>
                        value !== null &&
                        value !== undefined
                )
                .some(value =>
                    String(value)
                        .toLowerCase()
                        .includes(search)
                );

        });


    table.innerHTML = '';


    if (filteredAssets.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    Geen inventarisitems gevonden.
                </td>
            </tr>
        `;

        return;

    }


    filteredAssets.forEach(asset => {

        const row =
            document.createElement('tr');


        row.innerHTML = `
            <td>${escapeHtml(asset.asset_id)}</td>
            <td>${escapeHtml(asset.barcode)}</td>
            <td>${escapeHtml(asset.category)}</td>
            <td>${escapeHtml(asset.brand)}</td>
            <td>${escapeHtml(asset.type)}</td>
            <td>${escapeHtml(asset.serial_number)}</td>
            <td>
                <button
                    type="button"
                    class="delete-button"
                    data-id="${Number(asset.id)}"
                    title="Verwijderen"
                >
                    🗑️
                </button>
            </td>
        `;


        row.addEventListener(
            'click',
            event => {

                if (
                    event.target.closest(
                        '.delete-button'
                    )
                ) {

                    return;

                }


                if (
                    typeof openAssetDetailsCallback !==
                    'function'
                ) {

                    console.error(
                        '[Inventory] Asset details callback is not initialized.'
                    );

                    return;

                }


                openAssetDetailsCallback(
                    asset.id
                );

            }
        );


        table.appendChild(row);

    });


    table
        .querySelectorAll('.delete-button')
        .forEach(button => {

            button.addEventListener(
                'click',
                () => deleteAsset(
                    button.dataset.id
                )
            );

        });

}


function renderHistoricalInventory() {

    const table =
        document.getElementById(
            'historical-inventory-table'
        );


    if (!table) {

        console.error(
            '[Inventory] Historical inventory table not found.'
        );

        return;

    }


    const searchInput =
        document.getElementById(
            'historical-search-input'
        );


    const search =
        searchInput
            ? searchInput.value
                .toLowerCase()
                .trim()
            : '';


    const filteredAssets =
        historicalAssets.filter(asset => {

            return [
                asset.asset_id,
                asset.barcode,
                asset.category,
                asset.brand,
                asset.type,
                asset.serial_number
            ]
                .filter(
                    value =>
                        value !== null &&
                        value !== undefined
                )
                .some(value =>
                    String(value)
                        .toLowerCase()
                        .includes(search)
                );

        });


    table.innerHTML = '';


    if (filteredAssets.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    Geen historische assets gevonden.
                </td>
            </tr>
        `;

        return;

    }


    filteredAssets.forEach(asset => {

        const row =
            document.createElement('tr');


        row.innerHTML = `
            <td>${escapeHtml(asset.asset_id)}</td>
            <td>${escapeHtml(asset.barcode)}</td>
            <td>${escapeHtml(asset.category)}</td>
            <td>${escapeHtml(asset.brand)}</td>
            <td>${escapeHtml(asset.type)}</td>
            <td>${escapeHtml(asset.serial_number)}</td>
        `;

        row.addEventListener(
            'click',
            event => {

                if (
                    event.target.closest(
                        '.restore-button'
                    )
                ) {

                    return;

                }


                if (
                    typeof openHistoricalAssetDetailsCallback !==
                    'function'
                ) {

                    console.error(
                        '[Inventory] Historical asset details callback is not initialized.'
                    );

                    return;

                }


                openHistoricalAssetDetailsCallback(
                    asset.id
                );

            }
        );


        table.appendChild(row);

    });

}


async function deleteAsset(id) {

    const numericId =
        Number(id);


    if (
        !Number.isInteger(numericId) ||
        numericId <= 0
    ) {

        console.error(
            '[Inventory] Invalid asset ID:',
            id
        );

        alert(
            'Ongeldig inventarisitem.'
        );

        return;

    }


    const confirmed =
        confirm(
            'Weet je zeker dat je dit inventarisitem wilt verwijderen?'
        );


    if (!confirmed) {
        return;
    }


    try {

        const result =
            await window.inventoryAPI.deleteAsset(
                numericId
            );


        if (
            !result ||
            !result.success
        ) {

            alert(
                result?.error ||
                'Het inventarisitem kon niet worden verwijderd.'
            );

            return;

        }


        await loadInventory();


    } catch (error) {

        console.error(
            '[Inventory] Error deleting asset:',
            error
        );

        alert(
            'Er is een fout opgetreden bij het verwijderen van het inventarisitem.'
        );

    }

}


export {
    initializeInventory,
    loadInventory,
    renderInventory,
    deleteAsset
};