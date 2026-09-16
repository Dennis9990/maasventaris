function updateDashboard(assets) {

    if (!Array.isArray(assets)) {
        console.error(
            '[Dashboard] Invalid assets data:',
            assets
        );

        return;
    }


    const totalItems =
        assets.length;


    const depreciatedItems =
        assets.filter(
            asset =>
                asset.depreciated === 1 ||
                asset.depreciated === true
        ).length;


    const maintenanceItems =
        assets.filter(
            asset =>
                asset.maintenance !== null &&
                asset.maintenance !== undefined &&
                String(asset.maintenance).trim() !== ''
        ).length;


    const availableItems =
        assets.filter(asset => {

            const depreciated =
                asset.depreciated === 1 ||
                asset.depreciated === true;

            const inMaintenance =
                asset.maintenance !== null &&
                asset.maintenance !== undefined &&
                String(asset.maintenance).trim() !== '';

            return !depreciated && !inMaintenance;

        }).length;


    const totalElement =
        document.getElementById(
            'total-items'
        );

    const availableElement =
        document.getElementById(
            'available-items'
        );

    const maintenanceElement =
        document.getElementById(
            'maintenance-items'
        );

    const depreciatedElement =
        document.getElementById(
            'depreciated-items'
        );


    if (totalElement) {
        totalElement.textContent =
            totalItems;
    }


    if (availableElement) {
        availableElement.textContent =
            availableItems;
    }


    if (maintenanceElement) {
        maintenanceElement.textContent =
            maintenanceItems;
    }


    if (depreciatedElement) {
        depreciatedElement.textContent =
            depreciatedItems;
    }

}


export {
    updateDashboard
};