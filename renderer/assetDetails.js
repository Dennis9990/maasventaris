import { showPage } from './navigation.js';
import { getCategories, loadCategories } from './categories.js';
import { loadInventory } from './inventory.js';

let currentAssetType = null;

function initializeAssetDetails() {

    const form =
        document.getElementById('edit-item-form');

    if (!form) {

        console.error('[AssetDetails] Edit form not found.');
        return;

    }


    form.addEventListener('submit', handleSubmit);

    const moveToHistoryButton = document.getElementById('move-to-history-button');
    const moveToActualButton = document.getElementById('move-to-actual-button');

    if (moveToHistoryButton) {
        moveToHistoryButton.addEventListener(
            'click',
            moveCurrentAssetToHistory
        );
    }

    if (moveToActualButton) {
        moveToActualButton.addEventListener(
            'click',
            moveHistoricalAssetToActual
        );
    }

}


async function openAssetDetails(id) {

    try {

        const asset = await window.inventoryAPI.getAssetById(Number(id));

        if (!asset) {

            alert('Inventarisitem niet gevonden.');
            return;

        }

        showPage('asset-details');

        const form = document.getElementById('edit-item-form');

        if (!form) {
            console.error('[AssetDetails] Edit form not found.');
            return;
        }

        Array.from(form.elements).forEach(element => {
            element.disabled = false;
        });

        currentAssetType = 'actual';

        const moveToHistoryButton = document.getElementById('move-to-history-button');
        const moveToActualButton = document.getElementById('move-to-actual-button');

        if (moveToHistoryButton) {
            moveToHistoryButton.style.display = '';
        }

        if (moveToActualButton) {
            moveToActualButton.style.display = 'none';
        }

        const saveButton = document.getElementById('asset-details-save-button');

        if (saveButton) {

            saveButton.textContent =
                'Opslaan';

            saveButton.type =
                'submit';

            saveButton.disabled =
                false;

            saveButton.onclick =
                null;

        }


        setFormValue(
            form,
            'id',
            asset.id
        );


        setFormValue(
            form,
            'asset_id',
            asset.asset_id
        );


        setFormValue(
            form,
            'barcode',
            asset.barcode
        );


        setFormValue(
            form,
            'brand',
            asset.brand
        );


        setFormValue(
            form,
            'type',
            asset.type
        );


        setFormValue(
            form,
            'serial_number',
            asset.serial_number
        );


        setFormValue(
            form,
            'purchase_date',
            asset.purchase_date
        );


        setFormValue(
            form,
            'purchase_price',
            asset.purchase_price
        );


        setFormValue(
            form,
            'depreciation_period',
            asset.depreciation_period
        );


        setFormValue(
            form,
            'replacement_period',
            asset.replacement_period
        );


        setFormValue(
            form,
            'replacement_year',
            asset.replacement_year
        );


        setFormValue(
            form,
            'owner',
            asset.owner
        );

        const depreciatedInput = form.elements.depreciated;

        if (depreciatedInput) {

            depreciatedInput.checked =
                asset.depreciated === 1;

        }


        setFormValue(
            form,
            'notes',
            asset.notes
        );


        setFormValue(
            form,
            'maintenance',
            asset.maintenance
        );


        await populateCategorySelect(asset.category);


        const title = document.getElementById('asset-details-title');

        if (title) {

            title.textContent =
                asset.asset_id ||
                asset.barcode ||
                'Inventarisitem';

        }

        const createdAt = document.getElementById('created-at');

        if (createdAt) {

            createdAt.textContent =
                asset.created_at
                    ? `Aangemaakt: ${asset.created_at}`
                    : '';

        }

        const updatedAt = document.getElementById('updated-at');

        if (updatedAt) {

            updatedAt.textContent =
                asset.updated_at
                    ? `Laatst gewijzigd: ${asset.updated_at}`
                    : '';

        }

    } catch (error) {

        console.error('[AssetDetails] Error opening asset:', error);
        alert(`Het inventarisitem kon niet worden geopend.\n\n${error.message}`);

    }

}


async function openHistoricalAssetDetails(id) {

    try {

        const asset = await window.inventoryAPI.getAssetHistoryById(Number(id));

        if (!asset) {

            alert('Historisch inventarisitem niet gevonden.');
            return;
        }

        showPage('asset-details');

        const form = document.getElementById('edit-item-form');

        if (!form) {
            console.error('[AssetDetails] Edit form not found.');
            return;
        }


        setFormValue(
            form,
            'id',
            asset.id
        );


        setFormValue(
            form,
            'asset_id',
            asset.asset_id
        );


        setFormValue(
            form,
            'barcode',
            asset.barcode
        );


        setFormValue(
            form,
            'brand',
            asset.brand
        );


        setFormValue(
            form,
            'type',
            asset.type
        );


        setFormValue(
            form,
            'serial_number',
            asset.serial_number
        );


        setFormValue(
            form,
            'purchase_date',
            asset.purchase_date
        );


        setFormValue(
            form,
            'purchase_price',
            asset.purchase_price
        );


        setFormValue(
            form,
            'depreciation_period',
            asset.depreciation_period
        );


        setFormValue(
            form,
            'replacement_period',
            asset.replacement_period
        );


        setFormValue(
            form,
            'replacement_year',
            asset.replacement_year
        );


        setFormValue(
            form,
            'owner',
            asset.owner
        );


        const depreciatedInput = form.elements.depreciated;

        if (depreciatedInput) {

            depreciatedInput.checked =
                asset.depreciated === 1;

        }


        setFormValue(
            form,
            'notes',
            asset.notes
        );


        setFormValue(
            form,
            'maintenance',
            asset.maintenance
        );

        await populateCategorySelect(asset.category);

        const title = document.getElementById('asset-details-title');

        if (title) {

            title.textContent =
                asset.asset_id ||
                asset.barcode ||
                'Historisch inventarisitem';

        }

        const createdAt = document.getElementById('created-at');

        if (createdAt) {

            createdAt.textContent =
                asset.imported_at
                    ? `Geïmporteerd: ${asset.imported_at}`
                    : '';

        }

        const updatedAt = document.getElementById('updated-at');

        if (updatedAt) {

            updatedAt.textContent = '';

        }

        Array.from(form.elements).forEach(
            element => {

                element.disabled = true;

            });

        currentAssetType = 'historical';

        const moveToHistoryButton = document.getElementById('move-to-history-button');
        const moveToActualButton = document.getElementById('move-to-actual-button');

        if (moveToHistoryButton) {
            moveToHistoryButton.style.display = 'none';
        }

        if (moveToActualButton) {
            moveToActualButton.style.display = '';
        }

        const saveButton = document.getElementById('asset-details-save-button');

        if (saveButton) {

            saveButton.textContent =
                'Naar actuele assets verplaatsen';

            saveButton.type =
                'button';

            saveButton.disabled =
                false;

            saveButton.onclick =
                async () => {

                    await restoreAsset(asset.id);

                };

        }

    } catch (error) {
        console.error('[AssetDetails] Error opening historical asset:', error);
        alert(`Het historische inventarisitem kon niet worden geopend.\n\n${error.message}`);
    }
}

async function restoreAsset(id) {

    const confirmed = confirm('Weet je zeker dat je dit historische asset wilt verplaatsen naar de actuele assets?');

    if (!confirmed) {
        return;
    }

    try {

        const result = await window.inventoryAPI.restoreAsset(Number(id));

        if (
            !result ||
            !result.success
        ) {
            alert(result?.error || 'Het historische asset kon niet worden verplaatst.');
            return;

        }

        alert('Het asset is succesvol verplaatst naar de actuele assets.');

        await loadInventory();

        showPage('inventory');

    } catch (error) {

        console.error('[AssetDetails] Error restoring historical asset:', error);
        alert(error.message || 'Er is een fout opgetreden bij het verplaatsen van het asset.');
    }
}


function setFormValue(
    form,
    fieldName,
    value
) {

    const field = form.elements[fieldName];

    if (!field) {

        return;

    }


    field.value =
        value ?? '';

}


async function populateCategorySelect(
    selectedCategory
) {

    const categorySelect = document.getElementById('edit-category-select');

    if (!categorySelect) {

        console.error('[AssetDetails] Category select not found.');

        return;

    }


    let categories =
        getCategories();


    if (!categories.length) {

        try {

            categories = await loadCategories();

        } catch (error) {

            console.error('[AssetDetails] Failed to load categories:', error);
        }
    }

    categorySelect.innerHTML = `
        <option value="">
            Selecteer een categorie...
        </option>
    `;


    categories.forEach(
        category => {

            const option = document.createElement('option');

            option.value =
                category.name;


            option.textContent =
                category.name;


            if (
                category.name ===
                selectedCategory
            ) {

                option.selected =
                    true;

            }


            categorySelect.appendChild(
                option
            );
        }
    );
}

async function handleSubmit(event) {

    event.preventDefault();


    const form = event.target;


    const formData = new FormData(form);


    const asset = {

        id:
            parseInteger(
                formData.get('id')
            ),

        asset_id:
            cleanText(
                formData.get('asset_id')
            ),

        barcode:
            cleanText(
                formData.get('barcode')
            ),

        category:
            cleanText(
                formData.get('category')
            ),

        brand:
            cleanText(
                formData.get('brand')
            ),

        type:
            cleanText(
                formData.get('type')
            ),

        serial_number:
            cleanText(
                formData.get('serial_number')
            ),

        purchase_date:
            cleanText(
                formData.get('purchase_date')
            ),

        purchase_price:
            parseNumber(
                formData.get(
                    'purchase_price'
                )
            ),

        depreciation_period:
            parseInteger(
                formData.get(
                    'depreciation_period'
                )
            ),

        replacement_period:
            parseInteger(
                formData.get(
                    'replacement_period'
                )
            ),

        replacement_year:
            parseInteger(
                formData.get(
                    'replacement_year'
                )
            ),

        owner:
            cleanText(
                formData.get('owner')
            ),

        depreciated:
            formData.get(
                'depreciated'
            ) === 'on',

        notes:
            cleanText(
                formData.get('notes')
            ),

        maintenance:
            cleanText(
                formData.get('maintenance')
            )

    };


    if (!asset.id) {

        alert('Geen geldig inventarisitem geselecteerd.');
        return;
    }


    if (!asset.asset_id) {

        alert('Asset ID is verplicht.');
        return;
    }


    if (!asset.category) {

        alert('Categorie is verplicht.');
        return;
    }


    try {

        const result = await window.inventoryAPI.updateAsset(asset);

        if (
            !result ||
            !result.success
        ) {

            throw new Error(result?.error || 'Het inventarisitem kon niet worden opgeslagen.');

        }


        alert('Inventarisitem succesvol opgeslagen.');

        await loadInventory();
        await openAssetDetails(asset.id);


    } catch (error) {
        console.error('[AssetDetails] Error updating asset:', error);
        alert(`Er is een fout opgetreden bij het opslaan.\n\n${error.message}`);
    }
}


function cleanText(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return null;

    }

    const text = String(value).trim();

    return text === ''
        ? null
        : text;

}


function parseNumber(value) {

    if (
        value === null ||
        value === undefined ||
        String(value).trim() === ''
    ) {

        return null;

    }

    const number = Number(String(value).replace(',', '.').trim());

    return Number.isFinite(number)
        ? number
        : null;

}

function parseInteger(value) {

    if (
        value === null ||
        value === undefined ||
        String(value).trim() === ''
    ) {

        return null;

    }

    const number = Number(String(value).replace(',', '.').trim());

    if (!Number.isFinite(number)) {

        return null;

    }


    return Number.isInteger(number)
        ? number
        : null;

}

async function moveCurrentAssetToHistory() {

    const form =
        document.getElementById('edit-item-form');

    if (!form) {
        return;
    }

    const id =
        Number(form.elements.id?.value);

    if (!Number.isInteger(id) || id <= 0) {
        alert(
            'Geen geldig inventarisitem geselecteerd.'
        );

        return;
    }

    const confirmed =
        confirm(
            'Weet je zeker dat je dit asset naar de historische assets wilt verplaatsen?\n\nHet asset wordt verwijderd uit de actuele inventaris.'
        );

    if (!confirmed) {
        return;
    }

    try {

        const result =
            await window.inventoryAPI.moveAssetToHistory(id);

        if (
            !result ||
            !result.success
        ) {
            throw new Error(
                result?.error ||
                'Het asset kon niet naar de historische inventaris worden verplaatst.'
            );
        }

        alert(
            'Het asset is naar de historische inventaris verplaatst.'
        );

        await loadInventory();

        showPage('inventory');

    } catch (error) {

        console.error(
            '[AssetDetails] Error moving asset to history:',
            error
        );

        alert(
            `Het asset kon niet worden verplaatst.\n\n${error.message}`
        );
    }
}


async function moveHistoricalAssetToActual() {

    const form =
        document.getElementById('edit-item-form');

    if (!form) {
        return;
    }

    const id =
        Number(form.elements.id?.value);

    if (!Number.isInteger(id) || id <= 0) {
        alert(
            'Geen geldig historisch inventarisitem geselecteerd.'
        );

        return;
    }

    const confirmed =
        confirm(
            'Weet je zeker dat je dit asset naar de actuele assets wilt verplaatsen?\n\nHet asset wordt verwijderd uit de historische inventaris.'
        );

    if (!confirmed) {
        return;
    }

    try {

        const result =
            await window.inventoryAPI.restoreAsset(id);

        if (
            !result ||
            !result.success
        ) {
            throw new Error(
                result?.error ||
                'Het historische asset kon niet naar de actuele inventaris worden verplaatst.'
            );
        }

        alert(
            'Het asset is naar de actuele inventaris verplaatst.'
        );

        await loadInventory();

        showPage('inventory');

    } catch (error) {

        console.error(
            '[AssetDetails] Error moving historical asset to actual:',
            error
        );

        alert(
            `Het asset kon niet worden verplaatst.\n\n${error.message}`
        );
    }
}


export {
    initializeAssetDetails,
    openAssetDetails,
    openHistoricalAssetDetails
};