let assets = [];
let openAssetDetailsCallback = null;

function initializeBarcode(options = {}) {

    openAssetDetailsCallback =
        options.onOpenAssetDetails || null;

    const barcodeInput =
        document.getElementById('barcode-input');

    const barcodeSearchButton =
        document.getElementById('barcode-search-button');

    if (!barcodeInput || !barcodeSearchButton) {
        console.error(
            '[Barcode] Barcode elements not found.'
        );

        return;
    }

    barcodeSearchButton.addEventListener(
        'click',
        searchBarcode
    );

    barcodeInput.addEventListener(
        'keydown',
        event => {

            if (event.key === 'Enter') {

                event.preventDefault();

                searchBarcode();

            }

        }
    );

    loadBarcodeAssets();

}


async function loadBarcodeAssets() {

    try {

        assets =
            await window.inventoryAPI.getAssets();

    } catch (error) {

        console.error(
            '[Barcode] Failed to load assets:',
            error
        );

    }

}


async function searchBarcode() {

    const barcodeInput =
        document.getElementById('barcode-input');

    const result =
        document.getElementById('barcode-search-result');

    if (!barcodeInput || !result) {
        return;
    }

    const barcode =
        barcodeInput.value.trim();

    if (!barcode) {

        result.innerHTML = `
            <p>
                Voer een barcode in.
            </p>
        `;

        return;
    }

    await loadBarcodeAssets();

    const normalizedBarcode =
        barcode.replace(/^\*|\*$/g, '');

    const asset =
        assets.find(
            item => {

                const storedBarcode =
                    String(item.barcode || '')
                        .trim()
                        .replace(/^\*|\*$/g, '');

                return storedBarcode === normalizedBarcode;

            }
        );

    if (!asset) {

        result.innerHTML = `
            <div class="barcode-result-error">
                <strong>Geen asset gevonden</strong>

                <p>
                    Er is geen inventarisitem gevonden
                    met barcode
                    <strong>${escapeHtml(barcode)}</strong>.
                </p>
            </div>
        `;

        return;
    }

    displayBarcodeResult(asset);

}


function displayBarcodeResult(asset) {

    const result =
        document.getElementById('barcode-search-result');

    if (!result) {
        return;
    }

    result.innerHTML = `
        <div class="barcode-result-card">

            <div class="barcode-result-header">
                <strong>Asset gevonden</strong>
            </div>

            <div class="barcode-result-details">

                <div>
                    <span>Asset ID</span>
                    <strong>${escapeHtml(asset.asset_id || '-')}</strong>
                </div>

                <div>
                    <span>Barcode</span>
                    <strong>${escapeHtml(asset.barcode || '-')}</strong>
                </div>

                <div>
                    <span>Merk</span>
                    <strong>${escapeHtml(asset.brand || '-')}</strong>
                </div>

                <div>
                    <span>Type</span>
                    <strong>${escapeHtml(asset.type || '-')}</strong>
                </div>

            </div>

            <div class="barcode-result-actions">

                <button
                    type="button"
                    class="secondary-button"
                    id="barcode-view-asset-button"
                >
                    Asset bekijken
                </button>

                <button
                    type="button"
                    class="primary-button"
                    id="barcode-select-print-button"
                >
                    🖨️ Label afdrukken
                </button>

            </div>

        </div>
    `;

    const viewButton =
        document.getElementById(
            'barcode-view-asset-button'
        );

    if (viewButton) {

        viewButton.addEventListener(
            'click',
            () => {

                if (openAssetDetailsCallback) {

                    openAssetDetailsCallback(asset.id);

                }

            }
        );

    }


    const printButton =
        document.getElementById(
            'barcode-select-print-button'
        );

    if (printButton) {

        printButton.addEventListener(
            'click',
            () => {

                selectAssetForPrinting(asset);

            }
        );

    }

}


function selectAssetForPrinting(asset) {

    const selectedAsset =
        document.getElementById(
            'barcode-selected-asset'
        );

    if (!selectedAsset) {
        return;
    }

    selectedAsset.classList.remove('hidden');

    selectedAsset.innerHTML = `
        <div class="barcode-selected-header">
            <strong>Geselecteerd asset</strong>
        </div>

        <div class="barcode-selected-details">

            <div>
                <span>Asset ID</span>
                <strong>${escapeHtml(asset.asset_id || '-')}</strong>
            </div>

            <div>
                <span>Barcode</span>
                <strong>${escapeHtml(asset.barcode || '-')}</strong>
            </div>

            <div>
                <span>Merk</span>
                <strong>${escapeHtml(asset.brand || '-')}</strong>
            </div>

            <div>
                <span>Type</span>
                <strong>${escapeHtml(asset.type || '-')}</strong>
            </div>

        </div>

        <div class="barcode-print-actions">

            <button
                type="button"
                class="primary-button"
                id="barcode-print-button"
            >
                🖨️ Label afdrukken
            </button>

        </div>
    `;

    selectedAsset.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
    });

}


function escapeHtml(value) {

    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');

}


export {
    initializeBarcode
};