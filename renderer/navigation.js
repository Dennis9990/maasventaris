const navButtons =
    document.querySelectorAll('.nav-button');

const pages =
    document.querySelectorAll('.page');

function showPage(pageName) {

    pages.forEach(page => {

        page.classList.remove('active');

    });


    const selectedPage =
        document.getElementById(
            `page-${pageName}`
        );


    if (selectedPage) {

        selectedPage.classList.add('active');

    }

    navButtons.forEach(button => {

        button.classList.toggle(
            'active',
            button.dataset.page === pageName
        );

    });

}

function initializeNavigation() {
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            showPage(button.dataset.page);
        });
    });

    const backToInventory =
        document.getElementById('back-to-inventory');

    if (backToInventory) {
        backToInventory.addEventListener('click', () => {
            showPage('inventory');
        });
    }
}

export { showPage, initializeNavigation };