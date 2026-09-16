import { escapeHtml, cleanValue } from './utils.js';
import { showPage } from './navigation.js';
import { loadInventory } from './inventory.js';
import { loadCategories } from './categories.js';

let selectedExcelFile = null;
let validatedExcelData = null;
let importAnalysis = null;

function initializeExcelImport() {

    const excelSuccessDialog =
        document.getElementById(
            'excel-import-success-dialog'
        );

    const excelSuccessMessage =
        document.getElementById(
            'excel-import-success-message'
        );

    const excelSuccessButton =
        document.getElementById(
            'excel-import-success-button'
        );

    const excelImportLoading =
        document.getElementById(
            'excel-import-loading'
        );

    const excelModal =
        document.getElementById(
            'excel-import-modal'
        );

    const importExcelButton =
        document.getElementById(
            'import-excel-button'
        );

    const closeExcelModalButton =
        document.getElementById(
            'close-excel-modal'
        );

    const cancelExcelImportButton =
        document.getElementById(
            'cancel-excel-import'
        );

    const selectExcelButton =
        document.getElementById(
            'select-excel-button'
        );

    const confirmExcelButton =
        document.getElementById(
            'confirm-excel-import'
        );

    const excelFileInfo =
        document.getElementById(
            'excel-file-info'
        );

    const excelFileName =
        document.getElementById(
            'excel-file-name'
        );

    const excelPreview =
        document.getElementById(
            'excel-preview'
        );

    const importModeContainer =
        document.getElementById(
            'import-mode-container'
        );

    const importSummary =
        document.getElementById(
            'import-summary'
        );


    if (
        !excelModal ||
        !importExcelButton ||
        !closeExcelModalButton ||
        !cancelExcelImportButton ||
        !selectExcelButton ||
        !confirmExcelButton ||
        !excelFileInfo ||
        !excelFileName ||
        !excelPreview ||
        !importModeContainer ||
        !importSummary ||
        !excelImportLoading ||
        !excelSuccessDialog ||
        !excelSuccessMessage ||
        !excelSuccessButton
    ) {

        console.error('[Excel] Required import elements not found.');
        return;
    }


    importExcelButton.addEventListener(
        'click',
        () => {

            excelModal.classList.remove(
                'hidden'
            );

        }
    );

    excelSuccessButton.addEventListener(
        'click',
        () => {
            excelSuccessDialog.close();
        }
    );


    closeExcelModalButton.addEventListener(
        'click',
        () => closeExcelModal({
            excelModal,
            excelFileInfo,
            confirmExcelButton,
            excelPreview,
            importModeContainer,
            importSummary
        })
    );


    cancelExcelImportButton.addEventListener(
        'click',
        () => closeExcelModal({
            excelModal,
            excelFileInfo,
            confirmExcelButton,
            excelPreview,
            importModeContainer,
            importSummary
        })
    );


    selectExcelButton.addEventListener(
        'click',
        () =>
            selectExcelFile({
                excelFileInfo,
                excelFileName,
                excelPreview,
                confirmExcelButton,
                importModeContainer,
                importSummary
            })
    );


    confirmExcelButton.addEventListener(
        'click',
        () =>
            confirmExcelImport({
                excelModal,
                excelFileInfo,
                confirmExcelButton,
                excelPreview,
                importModeContainer,
                importSummary,
                excelImportLoading,
                excelSuccessDialog,
                excelSuccessMessage
            })
    );

}

function closeExcelModal(elements) {

    const {
        excelModal,
        excelFileInfo,
        confirmExcelButton,
        excelPreview,
        importModeContainer,
        importSummary
    } = elements;


    excelModal.classList.add(
        'hidden'
    );


    selectedExcelFile = null;
    validatedExcelData = null;
    importAnalysis = null;


    excelFileInfo.classList.add(
        'hidden'
    );


    confirmExcelButton.disabled =
        true;

    confirmExcelButton.textContent =
        'Importeren';


    excelPreview.innerHTML = `
        <p>
            Kies een Excelbestand om
            een preview te bekijken.
        </p>
    `;


    importModeContainer.classList.add(
        'hidden'
    );


    importSummary.innerHTML = '';

}

async function selectExcelFile(elements) {

    const {
        excelFileInfo,
        excelFileName,
        excelPreview,
        confirmExcelButton,
        importModeContainer,
        importSummary
    } = elements;


    try {

        const result =
            await window.inventoryAPI
                .selectExcelFile();


        if (
            result.canceled ||
            !result.filePath
        ) {

            return;

        }


        selectedExcelFile =
            result.filePath;


        const fileName =
            result.filePath
                .split(/[\\/]/)
                .pop();


        excelFileName.textContent =
            fileName;


        excelFileInfo.classList.remove(
            'hidden'
        );


        excelPreview.innerHTML = `
            <p>
                Excelbestand wordt gelezen...
            </p>
        `;


        const readResult =
            await window.inventoryAPI
                .readExcelFile(
                    selectedExcelFile
                );


        if (!readResult.success) {

            excelPreview.innerHTML = `
                <p class="error-message">
                    ❌ ${escapeHtml(
                readResult.error
            )}
                </p>
            `;

            return;

        }


        renderExcelPreview(
            excelPreview,
            readResult.data
        );


        await validateExcelImport(
            selectedExcelFile,
            {
                excelPreview,
                confirmExcelButton,
                importModeContainer,
                importSummary
            }
        );


    } catch (error) {

        console.error('[Excel] File selection failed:', error);

        excelPreview.innerHTML = `
            <p class="error-message">
                ❌ ${escapeHtml(
            error.message
        )}
            </p>
        `;

    }

}

async function validateExcelImport(
    filePath,
    elements
) {

    const {
        excelPreview,
        confirmExcelButton,
        importModeContainer,
        importSummary
    } = elements;


    try {

        const result =
            await window.inventoryAPI
                .analyzeExcelFile(
                    filePath
                );


        if (!result.success) {

            throw new Error(
                result.error ||
                'Validatie mislukt.'
            );

        }


        validatedExcelData =
            result.data;


        const validation =
            result.validation;


        const errors =
            validation.errors || [];

        const warnings =
            validation.warnings || [];


        excelPreview.innerHTML += `
            <div class="import-validation">

                <h3>
                    Import controleren
                </h3>

                <div class="validation-grid">

                    <div>
                        <strong>
                            ${validation.currentAssets}
                        </strong>

                        <span>
                            Actuele assets
                        </span>
                    </div>

                    <div>
                        <strong>
                            ${validation.historyAssets}
                        </strong>

                        <span>
                            Historische assets
                        </span>
                    </div>

                    <div>
                        <strong>
                            ${validation.categories}
                        </strong>

                        <span>
                            Categorieën
                        </span>
                    </div>

                    <div>
                        <strong>
                            ${validation.duplicateAssetIds}
                        </strong>

                        <span>
                            Dubbele AssetID's
                        </span>
                    </div>

                    <div>
                        <strong>
                            ${validation.duplicateBarcodes}
                        </strong>

                        <span>
                            Dubbele barcodes
                        </span>
                    </div>

                </div>

            </div>
        `;


        if (warnings.length > 0) {

            excelPreview.innerHTML += `
                <div class="import-warnings">

                    <strong>
                        ⚠️ ${warnings.length}
                        waarschuwingen
                    </strong>

                    <p>
                        Ontbrekende gegevens worden
                        niet automatisch ingevuld.
                    </p>

                </div>
            `;

        }


        if (errors.length > 0) {

            excelPreview.innerHTML += `
                <div class="error-message">

                    <strong>
                        ❌ Importeren geblokkeerd
                    </strong>

                    <br><br>

                    ${errors
                    .slice(0, 10)
                    .map(error =>
                        escapeHtml(error)
                    )
                    .join('<br>')}

                </div>
            `;


            validatedExcelData = null;

            confirmExcelButton.disabled =
                true;

            return;

        }


        excelPreview.innerHTML += `
            <div class="success-message">
                ✓ Bestand is gecontroleerd en
                kan worden geïmporteerd.
            </div>
        `;


        await analyzeImportData();

        renderImportMode(
            importModeContainer
        );

        renderImportSummary(
            importSummary
        );

        if (
            !importAnalysis ||
            !importAnalysis.conflicts ||
            importAnalysis.conflicts.length === 0
        ) {
            confirmExcelButton.disabled = false;
        } else {
            confirmExcelButton.disabled = true;
        }

    } catch (error) {

        console.error('[Excel] Validation failed:', error);

        validatedExcelData = null;

        confirmExcelButton.disabled =
            true;


        excelPreview.innerHTML += `
            <div class="error-message">

                ❌ Validatie mislukt:

                <br><br>

                ${escapeHtml(
            error.message
        )}

            </div>
        `;

    }

}

async function analyzeImportData() {

    if (!validatedExcelData) {
        return;
    }

    const existingAssets =
        await window.inventoryAPI
            .getAssets();

    const byAssetId =
        new Map();

    const byBarcode =
        new Map();

    existingAssets.forEach(asset => {

        if (asset.asset_id) {

            byAssetId.set(
                cleanValue(asset.asset_id),
                asset
            );

        }

        if (asset.barcode) {

            byBarcode.set(
                cleanValue(asset.barcode),
                asset
            );

        }

    });

    let newItems = 0;
    let existingItems = 0;

    const matches = [];
    const conflicts = [];

    validatedExcelData.currentRows.forEach(
        (row, index) => {

            const assetId =
                cleanValue(
                    row['AssetID']
                );

            const barcode =
                cleanValue(
                    row['Barcode']
                );

            const assetById =
                assetId &&
                    byAssetId.has(assetId)
                    ? byAssetId.get(assetId)
                    : null;

            const assetByBarcode =
                barcode &&
                    byBarcode.has(barcode)
                    ? byBarcode.get(barcode)
                    : null;

            if (
                assetById &&
                assetByBarcode &&
                assetById.id !== assetByBarcode.id
            ) {

                conflicts.push({
                    rowNumber: index + 2,
                    excelRow: row,
                    assetById,
                    assetByBarcode
                });

                return;
            }

            const existing =
                assetById ||
                assetByBarcode;

            if (existing) {

                existingItems++;

                matches.push({
                    excelRow: row,
                    existingAsset: existing
                });

            } else {

                newItems++;

                matches.push({
                    excelRow: row,
                    existingAsset: null
                });

            }

        }
    );

    importAnalysis = {
        newItems,
        existingItems,
        conflicts,
        matches
    };

    validatedExcelData.matches =
        matches;
}

function renderImportMode(
    container
) {

    container.classList.remove(
        'hidden'
    );

}

function renderImportSummary(container) {

    if (!container || !importAnalysis) {
        return;
    }

    const conflicts =
        importAnalysis.conflicts || [];

    container.innerHTML = `
        <strong>
            Importanalyse
        </strong>

        <div class="import-summary-grid">

            <div class="import-summary-item">

                <strong>
                    ${importAnalysis.newItems}
                </strong>

                <span>
                    Nieuwe items
                </span>

            </div>

            <div class="import-summary-item">

                <strong>
                    ${importAnalysis.existingItems}
                </strong>

                <span>
                    Bestaande items
                </span>

            </div>

            <div class="import-summary-item">

                <strong>
                    ${validatedExcelData.currentRows.length}
                </strong>

                <span>
                    Totaal actuele assets
                </span>

            </div>

        </div>
    `;

    if (conflicts.length === 0) {
        return;
    }


    const conflictMessages =
        conflicts
            .slice(0, 10)
            .map(conflict => {

                const assetId =
                    cleanValue(
                        conflict.excelRow['AssetID']
                    );

                const barcode =
                    cleanValue(
                        conflict.excelRow['Barcode']
                    );

                const assetByIdName =
                    conflict.assetById.asset_id ||
                    conflict.assetById.barcode ||
                    String(conflict.assetById.id);

                const assetByBarcodeName =
                    conflict.assetByBarcode.asset_id ||
                    conflict.assetByBarcode.barcode ||
                    String(conflict.assetByBarcode.id);

                return `
                    <li>
                        Excelregel
                        <strong>
                            ${conflict.rowNumber}
                        </strong>:

                        Asset ID
                        <strong>
                            ${escapeHtml(
                    assetId || '-'
                )}
                        </strong>

                        verwijst naar bestaand item
                        <strong>
                            ${escapeHtml(
                    assetByIdName
                )}
                        </strong>,

                        terwijl barcode
                        <strong>
                            ${escapeHtml(
                    barcode || '-'
                )}
                        </strong>

                        verwijst naar bestaand item
                        <strong>
                            ${escapeHtml(
                    assetByBarcodeName
                )}
                        </strong>.
                    </li>
                `;

            })
            .join('');


    const remainingConflicts =
        conflicts.length > 10
            ? conflicts.length - 10
            : 0;


    container.innerHTML += `
        <div class="error-message">

            <strong>
                ❌ ${conflicts.length}
                importconflict(en) gevonden
            </strong>

            <p>
                De Excel-import is geblokkeerd omdat
                één of meerdere Excelregels een Asset ID
                en barcode bevatten die naar verschillende
                bestaande inventarisitems verwijzen.
            </p>

            <ul>
                ${conflictMessages}
            </ul>

            ${remainingConflicts > 0
            ? `
                        <p>
                            ... en nog
                            ${remainingConflicts}
                            conflict(en).
                        </p>
                    `
            : ''
        }

            <p>
                Los deze conflicten op in het
                Excelbestand en probeer de import
                opnieuw.
            </p>

        </div>
    `;
}

function getSelectedImportMode() {

    const selected =
        document.querySelector(
            'input[name="import-mode"]:checked'
        );


    return selected
        ? selected.value
        : 'new-only';

}

async function confirmExcelImport(
    elements
) {

    const {
        excelModal,
        confirmExcelButton,
        excelFileInfo,
        excelPreview,
        importModeContainer,
        importSummary,
        excelImportLoading,
        excelSuccessDialog,
        excelSuccessMessage
    } = elements;


    if (
        !validatedExcelData ||
        !importAnalysis
    ) {

        alert(
            'Het Excelbestand is nog niet succesvol gecontroleerd.'
        );

        return;

    }


    if (
        importAnalysis.conflicts &&
        importAnalysis.conflicts.length > 0
    ) {

        alert(
            'De Excel-import kan niet worden uitgevoerd omdat er importconflicten zijn gevonden. Los deze eerst op.'
        );

        return;

    }


    const confirmed =
        confirm('Weet je zeker dat je de Excel-inventaris wilt importeren?');


    if (!confirmed) {
        return;
    }


    confirmExcelButton.disabled =
        true;

    confirmExcelButton.textContent =
        'Importeren...';

    excelImportLoading.classList.remove(
        'hidden'
    );


    try {

        const importMode =
            getSelectedImportMode();


        const result =
            await window.inventoryAPI
                .importExcelData({

                    ...validatedExcelData,

                    importMode

                });


        if (
            !result ||
            !result.success
        ) {

            throw new Error(
                result?.error ||
                'Onbekende fout tijdens import.'
            );

        }


        excelSuccessMessage.innerHTML =
            `De Excel-inventaris is succesvol geïmporteerd.<br><br>` +
            `<strong>${result.imported.assets}</strong> actuele assets<br>` +
            `<strong>${result.imported.history}</strong> historische assets<br>` +
            `<strong>${result.imported.categories}</strong> nieuwe categorieën`;

        excelSuccessDialog.showModal();


        closeExcelModal({
            excelModal,
            excelFileInfo,
            confirmExcelButton,
            excelPreview,
            importModeContainer,
            importSummary
        });


        await loadCategories();
        await loadInventory();

        showPage('inventory');


    } catch (error) {

        console.error('[Excel] Import failed:', error);

        alert(`Import mislukt:\n\n${error.message}`);

    } finally {

        excelImportLoading.classList.add(
            'hidden'
        );

        confirmExcelButton.textContent =
            'Importeren';

        confirmExcelButton.disabled =
            !validatedExcelData ||
            !importAnalysis ||
            (
                importAnalysis.conflicts &&
                importAnalysis.conflicts.length > 0
            );

    }

}

function renderExcelPreview(
    container,
    data
) {

    container.innerHTML = '';


    const heading =
        document.createElement(
            'h3'
        );

    heading.textContent =
        'Excelbestand gevonden';


    container.appendChild(
        heading
    );


    const summary =
        document.createElement(
            'div'
        );

    summary.className =
        'excel-summary';


    data.sheets.forEach(
        sheet => {

            const card =
                document.createElement(
                    'div'
                );

            card.className =
                'sheet-card';


            card.innerHTML = `
                <strong>
                    ${escapeHtml(
                sheet.name
            )}
                </strong>

                <span>
                    ${sheet.rowCount}
                    regels
                </span>
            `;


            summary.appendChild(
                card
            );

        }
    );


    container.appendChild(
        summary
    );


    data.sheets.forEach(
        sheet => {

            if (
                sheet.rows.length === 0
            ) {

                return;

            }


            const title =
                document.createElement(
                    'h4'
                );

            title.textContent =
                `${sheet.name} — voorbeeld`;


            container.appendChild(
                title
            );


            const table =
                document.createElement(
                    'table'
                );

            table.className =
                'preview-table';


            const headers =
                Object.keys(
                    sheet.rows[0]
                );


            const thead =
                document.createElement(
                    'thead'
                );

            const headerRow =
                document.createElement(
                    'tr'
                );


            headers.forEach(
                header => {

                    const th =
                        document.createElement(
                            'th'
                        );

                    th.textContent =
                        header;

                    headerRow.appendChild(
                        th
                    );

                }
            );


            thead.appendChild(
                headerRow
            );


            table.appendChild(
                thead
            );


            const tbody =
                document.createElement(
                    'tbody'
                );


            sheet.rows
                .slice(0, 5)
                .forEach(
                    row => {

                        const tr =
                            document.createElement(
                                'tr'
                            );


                        headers.forEach(
                            header => {

                                const td =
                                    document.createElement(
                                        'td'
                                    );

                                td.textContent =
                                    row[header] ??
                                    '';

                                tr.appendChild(
                                    td
                                );

                            }
                        );


                        tbody.appendChild(
                            tr
                        );

                    }
                );


            table.appendChild(
                tbody
            );


            container.appendChild(
                table
            );

        }
    );

}


export {
    initializeExcelImport
};