const { ipcMain, dialog } = require('electron');
const XLSX = require('xlsx');
const { cleanValue, mapExcelAsset } = require('../utils/excelHelpers');

function registerExcelHandlers(db) {

    ipcMain.handle('excel:select', async () => {

        const result = await dialog.showOpenDialog({
            title: 'Selecteer Excel inventaris',

            properties: [
                'openFile'
            ],

            filters: [
                {
                    name: 'Excel bestanden',

                    extensions: [
                        'xlsx',
                        'xls'
                    ]
                }
            ]
        });

        if (result.canceled) {

            return {
                canceled: true
            };

        }

        return {
            canceled: false,
            filePath: result.filePaths[0]
        };

    });


    ipcMain.handle(
        'excel:read',
        async (event, filePath) => {

            try {

                if (!filePath) {
                    throw new Error(
                        'Geen Excel-bestand geselecteerd.'
                    );
                }

                const workbook =
                    XLSX.readFile(filePath);

                const result = {
                    filePath,
                    sheets: []
                };

                for (
                    const sheetName
                    of workbook.SheetNames
                ) {

                    const worksheet =
                        workbook.Sheets[sheetName];

                    const rows =
                        XLSX.utils.sheet_to_json(
                            worksheet,
                            {
                                defval: null
                            }
                        );

                    result.sheets.push({
                        name: sheetName,
                        rowCount: rows.length,
                        rows: rows.slice(0, 10)
                    });

                }

                return {
                    success: true,
                    data: result
                };

            } catch (error) {

                console.error(
                    '[Excel] Error reading Excel file:',
                    error
                );

                return {
                    success: false,
                    error: error.message
                };

            }

        }
    );


    ipcMain.handle(
        'excel:import',
        async (event, filePath) => {

            try {

                if (!filePath) {

                    throw new Error(
                        'Geen Excel-bestand geselecteerd.'
                    );

                }

                const workbook =
                    XLSX.readFile(
                        filePath,
                        {
                            cellDates: true
                        }
                    );

                const currentSheet =
                    workbook.Sheets['Asset actueel'];

                const historySheet =
                    workbook.Sheets['Asset historie'];

                const categorySheet =
                    workbook.Sheets['Categorie'];

                if (!currentSheet) {

                    throw new Error(
                        'Het tabblad "Asset actueel" ontbreekt.'
                    );

                }

                const currentRows =
                    XLSX.utils.sheet_to_json(
                        currentSheet,
                        {
                            defval: null
                        }
                    );

                const historyRows =
                    historySheet
                        ? XLSX.utils.sheet_to_json(
                            historySheet,
                            {
                                defval: null
                            }
                        )
                        : [];

                const categoryRows =
                    categorySheet
                        ? XLSX.utils.sheet_to_json(
                            categorySheet,
                            {
                                defval: null
                            }
                        )
                        : [];

                const errors = [];
                const warnings = [];

                const assetIds =
                    new Map();

                const barcodes =
                    new Map();

                currentRows.forEach(
                    (row, index) => {

                        const rowNumber =
                            index + 2;

                        const assetId =
                            cleanValue(
                                row['AssetID']
                            );

                        const barcode =
                            cleanValue(
                                row['Barcode']
                            );

                        if (assetId) {

                            if (
                                assetIds.has(assetId)
                            ) {

                                errors.push(
                                    `Dubbele AssetID "${assetId}" op regels ${assetIds.get(assetId)} en ${rowNumber}.`
                                );

                            } else {

                                assetIds.set(
                                    assetId,
                                    rowNumber
                                );

                            }

                        }

                        if (barcode) {

                            if (
                                barcodes.has(barcode)
                            ) {

                                errors.push(
                                    `Dubbele barcode "${barcode}" op regels ${barcodes.get(barcode)} en ${rowNumber}.`
                                );

                            } else {

                                barcodes.set(
                                    barcode,
                                    rowNumber
                                );

                            }

                        }

                        if (!assetId) {

                            warnings.push(
                                `Regel ${rowNumber} heeft geen AssetID.`
                            );

                        }

                        if (!barcode) {

                            warnings.push(
                                `Regel ${rowNumber} heeft geen barcode.`
                            );

                        }

                    }
                );

                const categoryNames =
                    new Set();

                categoryRows.forEach(
                    row => {

                        const value =
                            cleanValue(
                                row['Categorie Naam']
                            );

                        if (value) {

                            categoryNames.add(
                                value
                            );

                        }

                    }
                );

                return {

                    success: true,

                    validation: {

                        currentAssets:
                            currentRows.length,

                        historyAssets:
                            historyRows.length,

                        categories:
                            categoryNames.size,

                        duplicateAssetIds:
                            errors.filter(
                                error =>
                                    error.includes(
                                        'Dubbele AssetID'
                                    )
                            ).length,

                        duplicateBarcodes:
                            errors.filter(
                                error =>
                                    error.includes(
                                        'Dubbele barcode'
                                    )
                            ).length,

                        errors,

                        warnings

                    },

                    data: {

                        currentRows,

                        historyRows,

                        categories:
                            [...categoryNames]

                    }

                };

            } catch (error) {

                console.error(
                    '[Excel] Import validation error:',
                    error
                );

                return {

                    success: false,

                    error: error.message

                };

            }

        }
    );


    ipcMain.handle(
        'excel:importConfirmed',
        async (event, data) => {

            let connection;

            try {

                console.log(
                    '[Excel] Starting database import...'
                );

                if (!data) {

                    throw new Error(
                        'Geen importgegevens ontvangen.'
                    );

                }

                if (!Array.isArray(data.currentRows)) {

                    throw new Error(
                        'Ongeldige actuele inventarisgegevens.'
                    );

                }

                if (!Array.isArray(data.historyRows)) {

                    throw new Error(
                        'Ongeldige historische inventarisgegevens.'
                    );

                }

                if (!Array.isArray(data.categories)) {

                    throw new Error(
                        'Ongeldige categoriegegevens.'
                    );

                }

                const allowedImportModes = [
                    'new-only',
                    'update-existing',
                    'new-and-update'
                ];

                const importMode =
                    data.importMode ||
                    'new-only';

                if (
                    !allowedImportModes.includes(
                        importMode
                    )
                ) {

                    throw new Error(
                        `Ongeldige importmodus: ${importMode}`
                    );

                }

                connection =
                    await db.getConnection();

                await connection.beginTransaction();


                const [existingAssets] =
                    await connection.query(`
                        SELECT *
                        FROM assets
                    `);


                const assetsById =
                    new Map();

                const assetsByBarcode =
                    new Map();

                existingAssets.forEach(
                    asset => {

                        if (asset.asset_id) {

                            assetsById.set(
                                asset.asset_id,
                                asset
                            );

                        }

                        if (asset.barcode) {

                            assetsByBarcode.set(
                                asset.barcode,
                                asset
                            );

                        }

                    }
                );


                let importedAssets = 0;
                let importedHistory = 0;
                let importedCategories = 0;


                for (
                    const category
                    of data.categories
                ) {

                    const cleanCategory =
                        cleanValue(category);

                    if (!cleanCategory) {
                        continue;
                    }

                    const [result] =
                        await connection.query(`
                            INSERT IGNORE INTO categories (
                                name
                            )
                            VALUES (?)
                        `, [
                            cleanCategory
                        ]);

                    if (
                        result.affectedRows > 0
                    ) {

                        importedCategories++;

                    }

                }


                for (
                    const row
                    of data.currentRows
                ) {

                    const assetId =
                        cleanValue(
                            row['AssetID']
                        );

                    const barcode =
                        cleanValue(
                            row['Barcode']
                        );


                    const assetById =
                        assetId
                            ? assetsById.get(assetId)
                            : null;


                    const assetByBarcode =
                        barcode
                            ? assetsByBarcode.get(barcode)
                            : null;


                    if (
                        assetById &&
                        assetByBarcode &&
                        assetById.id !==
                            assetByBarcode.id
                    ) {

                        throw new Error(
                            `Import geblokkeerd: AssetID "${assetId}" en barcode "${barcode}" verwijzen naar verschillende bestaande inventarisitems.`
                        );

                    }


                    const existingAsset =
                        assetById ||
                        assetByBarcode ||
                        null;


                    const mappedAsset =
                        mapExcelAsset(row);


                    if (existingAsset) {

                        if (
                            importMode ===
                            'new-only'
                        ) {

                            continue;

                        }


                        if (
                            importMode ===
                            'update-existing' ||
                            importMode ===
                            'new-and-update'
                        ) {

                            await connection.query(`
                                UPDATE assets
                                SET
                                    asset_id = ?,
                                    barcode = ?,
                                    category = ?,
                                    brand = ?,
                                    type = ?,
                                    serial_number = ?,
                                    purchase_date = ?,
                                    purchase_price = ?,
                                    depreciation_period = ?,
                                    replacement_period = ?,
                                    replacement_year = ?,
                                    depreciated = ?,
                                    notes = ?,
                                    maintenance = ?,
                                    last_check = NULL
                                WHERE id = ?
                            `, [
                                mappedAsset.asset_id,
                                mappedAsset.barcode,
                                mappedAsset.category,
                                mappedAsset.brand,
                                mappedAsset.type,
                                mappedAsset.serial_number,
                                mappedAsset.purchase_date,
                                mappedAsset.purchase_price,
                                mappedAsset.depreciation_period,
                                mappedAsset.replacement_period,
                                mappedAsset.replacement_year,
                                mappedAsset.depreciated,
                                mappedAsset.notes,
                                mappedAsset.maintenance,
                                existingAsset.id
                            ]);

                            importedAssets++;

                            continue;

                        }

                    }


                    if (
                        importMode ===
                        'update-existing'
                    ) {

                        continue;

                    }


                    await connection.query(`
                        INSERT INTO assets (
                            asset_id,
                            barcode,
                            category,
                            brand,
                            type,
                            serial_number,
                            purchase_date,
                            purchase_price,
                            depreciation_period,
                            replacement_period,
                            replacement_year,
                            depreciated,
                            notes,
                            maintenance,
                            last_check
                        )
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `, [
                        mappedAsset.asset_id,
                        mappedAsset.barcode,
                        mappedAsset.category,
                        mappedAsset.brand,
                        mappedAsset.type,
                        mappedAsset.serial_number,
                        mappedAsset.purchase_date,
                        mappedAsset.purchase_price,
                        mappedAsset.depreciation_period,
                        mappedAsset.replacement_period,
                        mappedAsset.replacement_year,
                        mappedAsset.depreciated,
                        mappedAsset.notes,
                        mappedAsset.maintenance,
                        null
                    ]);

                    importedAssets++;

                }


                for (
                    const row
                    of data.historyRows
                ) {

                    const mappedAsset =
                        mapExcelAsset(row);

                    await connection.query(`
                        INSERT INTO asset_history (
                            asset_id,
                            barcode,
                            category,
                            brand,
                            type,
                            serial_number,
                            purchase_date,
                            purchase_price,
                            depreciation_period,
                            replacement_period,
                            replacement_year,
                            depreciated,
                            notes,
                            maintenance,
                            last_check
                        )
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `, [
                        mappedAsset.asset_id,
                        mappedAsset.barcode,
                        mappedAsset.category,
                        mappedAsset.brand,
                        mappedAsset.type,
                        mappedAsset.serial_number,
                        mappedAsset.purchase_date,
                        mappedAsset.purchase_price,
                        mappedAsset.depreciation_period,
                        mappedAsset.replacement_period,
                        mappedAsset.replacement_year,
                        mappedAsset.depreciated,
                        mappedAsset.notes,
                        mappedAsset.maintenance,
                        null
                    ]);

                    importedHistory++;

                }


                await connection.commit();


                console.log(
                    '[Excel] Import completed successfully.'
                );


                return {

                    success: true,

                    imported: {

                        assets:
                            importedAssets,

                        history:
                            importedHistory,

                        categories:
                            importedCategories

                    }

                };

            } catch (error) {

                if (connection) {

                    try {
                        await connection.rollback();
                    } catch (rollbackError) {
                        console.error(
                            '[Excel] Rollback failed:',
                            rollbackError
                        );
                    }

                }

                console.error(
                    '[Excel] Import failed:',
                    error
                );

                return {

                    success: false,

                    error:
                        error.message

                };

            } finally {

                if (connection) {
                    connection.release();
                }

            }

        }
    );

}

module.exports = registerExcelHandlers;