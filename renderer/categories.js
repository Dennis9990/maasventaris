import { escapeHtml } from './utils.js';

let categories = [];

function getCategories() {
    return categories;
}

async function loadCategories() {

    try {

        const loadedCategories =
            await window.inventoryAPI.getCategories();

        categories =
            Array.isArray(loadedCategories)
                ? loadedCategories
                : [];

        populateCategorySelect();
        renderCategories();

        return categories;

    } catch (error) {

        console.error(
            'Error loading categories:',
            error
        );

        categories = [];

        populateCategorySelect();
        renderCategories();

        return categories;
    }
}

function populateCategorySelect() {

    const select =
        document.getElementById(
            'category-select'
        );

    if (!select) {
        return;
    }

    select.innerHTML = `
        <option value="">
            Selecteer een categorie...
        </option>
    `;

    categories.forEach(category => {

        if (!category || !category.name) {
            return;
        }

        const option =
            document.createElement('option');

        option.value = category.name;
        option.textContent = category.name;

        select.appendChild(option);

    });
}

function renderCategories() {

    const container =
        document.getElementById(
            'categories-list'
        );

    if (!container) {
        return;
    }

    container.innerHTML = '';

    if (categories.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                Geen categorieën gevonden.
            </div>
        `;

        return;
    }

    categories.forEach(category => {

        if (!category || !category.name) {
            return;
        }

        const item =
            document.createElement('div');

        item.className =
            'category-item';

        item.innerHTML = `
            <span>
                ${escapeHtml(category.name)}
            </span>
        `;

        container.appendChild(item);

    });
}

function initializeCategories() {

    const addCategoryButton =
        document.getElementById(
            'add-category-button'
        );

    const categoryDialog =
        document.getElementById(
            'category-dialog'
        );

    const newCategoryInput =
        document.getElementById(
            'new-category-name'
        );

    const cancelButton =
        document.getElementById(
            'cancel-category-button'
        );

    const successDialog =
        document.getElementById(
            'category-success-dialog'
        );

    const successMessage =
        document.getElementById(
            'category-success-message'
        );

    const successButton =
        document.getElementById(
            'category-success-button'
        );

    if (
        !addCategoryButton ||
        !categoryDialog ||
        !newCategoryInput ||
        !cancelButton
    ) {
        return;
    }

    addCategoryButton.addEventListener(
        'click',
        () => {

            newCategoryInput.value = '';

            categoryDialog.showModal();

            newCategoryInput.focus();

        }
    );


    cancelButton.addEventListener(
        'click',
        () => {

            categoryDialog.close();

        }
    );

    successButton.addEventListener(
        'click',
        () => {

            successDialog.close();

        }
    );


    categoryDialog.addEventListener(
        'close',
        () => {

            newCategoryInput.value = '';

        }
    );


    categoryDialog.addEventListener(
        'submit',
        async event => {

            event.preventDefault();

            const name =
                newCategoryInput.value.trim();

            if (!name) {

                alert(
                    'Vul een categorienaam in.'
                );

                return;
            }

            try {

                await window.inventoryAPI.addCategory(
                    name
                );

                categoryDialog.close();

                await loadCategories();

                successMessage.textContent =
                    `De categorie "${name}" is succesvol toegevoegd.`;

                successDialog.showModal();

            } catch (error) {

                console.error(
                    '[Categories] Failed to add category:',
                    error
                );

                alert(error.message);

            }

        }
    );
}

export {
    loadCategories,
    getCategories,
    initializeCategories
};