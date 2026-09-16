import { loadInventory } from './inventory.js';


function initializeAssetForm() {

    const modal =
        document.getElementById('add-item-modal');

    const addButton =
        document.getElementById('add-item-button');

    const closeModalButton =
        document.getElementById('close-modal');

    const cancelModalButton =
        document.getElementById('cancel-modal');

    const form =
        document.getElementById('add-item-form');


    if (
        !modal ||
        !addButton ||
        !closeModalButton ||
        !cancelModalButton ||
        !form
    ) {

        console.error(
            '[AssetForm] Required form elements not found.'
        );

        return;

    }

    addButton.addEventListener(
        'click',
        () => {

            form.reset();

            modal.classList.remove(
                'hidden'
            );

        }
    );

    function closeModal() {

        modal.classList.add(
            'hidden'
        );

        form.reset();

    }


    closeModalButton.addEventListener(
        'click',
        closeModal
    );


    cancelModalButton.addEventListener(
        'click',
        closeModal
    );

    form.addEventListener(
        'submit',
        async event => {

            event.preventDefault();


            const formData =
                new FormData(form);


            const asset = {

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

            if (!asset.asset_id) {

                alert(
                    'Asset ID is verplicht.'
                );

                return;

            }


            if (!asset.category) {

                alert(
                    'Categorie is verplicht.'
                );

                return;

            }


            try {

                const result =
                    await window.inventoryAPI
                        .addAsset(asset);


                if (
                    !result ||
                    !result.success
                ) {

                    throw new Error(
                        result?.error ||
                        'Het inventarisitem kon niet worden toegevoegd.'
                    );

                }


                closeModal();

                await loadInventory();


                alert(
                    'Inventarisitem succesvol toegevoegd.'
                );


            } catch (error) {

                console.error(
                    '[AssetForm] Error adding asset:',
                    error
                );


                alert(
                    `Het item kon niet worden toegevoegd.\n\n${error.message}`
                );

            }

        }
    );

}

function cleanText(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return null;

    }


    const text =
        String(value).trim();


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


    const number =
        Number(
            String(value)
                .replace(',', '.')
                .trim()
        );


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


    const number =
        Number(
            String(value)
                .replace(',', '.')
                .trim()
        );


    if (!Number.isFinite(number)) {
        return null;
    }


    return Number.isInteger(number)
        ? number
        : null;

}

export {
    initializeAssetForm
};