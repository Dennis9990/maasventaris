const { ipcMain } = require('electron');


function emptyToNull(value) {

    if (value === undefined || value === null) {
        return null;
    }

    if (typeof value === 'string' && value.trim() === '') {
        return null;
    }

    return value;
}


function numberOrNull(value) {

    if (value === undefined || value === null || value === '') {
        return null;
    }

    const number = Number(value);

    if (!Number.isFinite(number)) {
        return null;
    }

    return number;
}


function integerOrNull(value) {

    if (value === undefined || value === null || value === '') {
        return null;
    }

    const number = Number(value);

    if (!Number.isInteger(number)) {
        return null;
    }

    return number;
}


function validateAsset(asset) {

    if (!asset || typeof asset !== 'object') {
        throw new Error(
            'Geen geldig inventarisitem ontvangen.'
        );
    }

    if (!emptyToNull(asset.asset_id)) {
        throw new Error(
            'Asset ID is verplicht.'
        );
    }

    if (!emptyToNull(asset.category)) {
        throw new Error(
            'Categorie is verplicht.'
        );
    }

    const numericFields = [
        ['purchase_price', asset.purchase_price],
        ['depreciation_period', asset.depreciation_period],
        ['replacement_period', asset.replacement_period],
        ['replacement_year', asset.replacement_year]
    ];

    for (const [field, value] of numericFields) {

        if (
            value === null ||
            value === undefined ||
            value === ''
        ) {
            continue;
        }

        const number = Number(value);

        if (!Number.isFinite(number)) {
            throw new Error(
                `${field} moet een geldig getal zijn.`
            );
        }
    }


    const integerFields = [
        ['depreciation_period', asset.depreciation_period],
        ['replacement_period', asset.replacement_period],
        ['replacement_year', asset.replacement_year]
    ];

    for (const [field, value] of integerFields) {

        if (
            value === null ||
            value === undefined ||
            value === ''
        ) {
            continue;
        }

        if (!Number.isInteger(Number(value))) {
            throw new Error(
                `${field} moet een geheel getal zijn.`
            );
        }
    }

}


function getDatabaseErrorMessage(error) {

    if (!error) {
        return 'Onbekende databasefout.';
    }

    const message =
        String(error.message || error);


    if (
        error.code === 'ER_DUP_ENTRY' &&
        message.includes('asset_id')
    ) {
        return 'Dit Asset ID bestaat al.';
    }


    if (
        error.code === 'ER_DUP_ENTRY' &&
        message.includes('barcode')
    ) {
        return 'Deze barcode bestaat al.';
    }


    return message;
}


function normalizeAsset(asset) {

    return {

        asset_id: emptyToNull(asset.asset_id),

        barcode: emptyToNull(asset.barcode),

        category: emptyToNull(asset.category),

        brand: emptyToNull(asset.brand),

        type: emptyToNull(asset.type),

        serial_number:
            emptyToNull(asset.serial_number),

        purchase_date:
            emptyToNull(asset.purchase_date),

        purchase_price:
            numberOrNull(asset.purchase_price),

        depreciation_period:
            integerOrNull(asset.depreciation_period),

        replacement_period:
            integerOrNull(asset.replacement_period),

        replacement_year:
            integerOrNull(asset.replacement_year),

        depreciated:
            asset.depreciated ? 1 : 0,

        notes:
            emptyToNull(asset.notes),

        maintenance:
            emptyToNull(asset.maintenance)

    };

}


function registerAssetHandlers(db) {


    // ========================================
    // GET ALL ASSETS
    // ========================================

    ipcMain.handle(
        'assets:getAll',
        async () => {

            try {

                const [rows] =
                    await db.query(`
                        SELECT *
                        FROM assets
                        ORDER BY id DESC
                    `);

                return rows;

            } catch (error) {

                console.error(
                    '[IPC Assets] Error getting assets:',
                    error
                );

                throw new Error(
                    getDatabaseErrorMessage(error)
                );

            }

        }
    );


    // ========================================
    // GET ASSET BY ID
    // ========================================

    ipcMain.handle(
        'assets:getById',
        async (event, id) => {

            try {

                const numericId =
                    Number(id);


                if (
                    !Number.isInteger(numericId) ||
                    numericId <= 0
                ) {

                    throw new Error(
                        'Ongeldig inventarisitem ID.'
                    );

                }


                const [rows] =
                    await db.query(
                        `
                        SELECT *
                        FROM assets
                        WHERE id = ?
                        `,
                        [numericId]
                    );


                return rows[0] || null;

            } catch (error) {

                console.error(
                    '[IPC Assets] Error getting asset:',
                    error
                );

                throw new Error(
                    getDatabaseErrorMessage(error)
                );

            }

        }
    );


    // ========================================
    // ADD ASSET
    // ========================================

    ipcMain.handle(
        'assets:add',
        async (event, asset) => {

            try {

                validateAsset(asset);

                const normalized =
                    normalizeAsset(asset);


                const [result] =
                    await db.query(
                        `
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
                        VALUES (
                            ?,
                            ?,
                            ?,
                            ?,
                            ?,
                            ?,
                            ?,
                            ?,
                            ?,
                            ?,
                            ?,
                            ?,
                            ?,
                            ?,
                            NULL
                        )
                        `,
                        [
                            normalized.asset_id,
                            normalized.barcode,
                            normalized.category,
                            normalized.brand,
                            normalized.type,
                            normalized.serial_number,
                            normalized.purchase_date,
                            normalized.purchase_price,
                            normalized.depreciation_period,
                            normalized.replacement_period,
                            normalized.replacement_year,
                            normalized.depreciated,
                            normalized.notes,
                            normalized.maintenance
                        ]
                    );


                return {
                    success: true,
                    id: result.insertId
                };

            } catch (error) {

                console.error(
                    '[IPC Assets] Error adding asset:',
                    error
                );

                return {
                    success: false,
                    error:
                        getDatabaseErrorMessage(error)
                };

            }

        }
    );


    // ========================================
    // GET HISTORICAL ASSET BY ID
    // ========================================

    ipcMain.handle(
        'assets:getHistoryById',
        async (event, id) => {

            try {

                const numericId =
                    Number(id);


                if (
                    !Number.isInteger(numericId) ||
                    numericId <= 0
                ) {

                    throw new Error(
                        'Ongeldig historisch inventarisitem ID.'
                    );

                }


                const [rows] =
                    await db.query(
                        `
                        SELECT *
                        FROM asset_history
                        WHERE id = ?
                        `,
                        [numericId]
                    );


                return rows[0] || null;

            } catch (error) {

                console.error(
                    '[IPC Assets] Error getting historical asset:',
                    error
                );

                throw new Error(
                    getDatabaseErrorMessage(error)
                );

            }

        }
    );


    // ========================================
    // UPDATE ASSET
    // ========================================

    ipcMain.handle(
        'assets:update',
        async (event, asset) => {

            try {

                validateAsset(asset);


                const id =
                    Number(asset.id);


                if (
                    !Number.isInteger(id) ||
                    id <= 0
                ) {

                    throw new Error(
                        'Ongeldig inventarisitem ID.'
                    );

                }


                const normalized =
                    normalizeAsset(asset);


                const [existingRows] =
                    await db.query(
                        `
                        SELECT id
                        FROM assets
                        WHERE id = ?
                        `,
                        [id]
                    );


                if (existingRows.length === 0) {

                    throw new Error(
                        'Het inventarisitem bestaat niet meer.'
                    );

                }


                await db.query(
                    `
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
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                    `,
                    [
                        normalized.asset_id,
                        normalized.barcode,
                        normalized.category,
                        normalized.brand,
                        normalized.type,
                        normalized.serial_number,
                        normalized.purchase_date,
                        normalized.purchase_price,
                        normalized.depreciation_period,
                        normalized.replacement_period,
                        normalized.replacement_year,
                        normalized.depreciated,
                        normalized.notes,
                        normalized.maintenance,
                        id
                    ]
                );


                return {
                    success: true
                };

            } catch (error) {

                console.error(
                    '[IPC Assets] Error updating asset:',
                    error
                );

                return {
                    success: false,
                    error:
                        getDatabaseErrorMessage(error)
                };

            }

        }
    );


    // ========================================
    // DELETE ASSET
    // ========================================

    ipcMain.handle(
        'assets:delete',
        async (event, id) => {

            try {

                const numericId =
                    Number(id);


                if (
                    !Number.isInteger(numericId) ||
                    numericId <= 0
                ) {

                    throw new Error(
                        'Ongeldig inventarisitem ID.'
                    );

                }


                const [existingRows] =
                    await db.query(
                        `
                        SELECT id
                        FROM assets
                        WHERE id = ?
                        `,
                        [numericId]
                    );


                if (existingRows.length === 0) {

                    throw new Error(
                        'Het inventarisitem bestaat niet.'
                    );

                }


                await db.query(
                    `
                    DELETE FROM assets
                    WHERE id = ?
                    `,
                    [numericId]
                );


                return {
                    success: true
                };

            } catch (error) {

                console.error(
                    '[IPC Assets] Error deleting asset:',
                    error
                );

                return {
                    success: false,
                    error:
                        getDatabaseErrorMessage(error)
                };

            }

        }
    );


    // ========================================
    // GET HISTORY
    // ========================================

    ipcMain.handle(
        'assets:getHistory',
        async () => {

            try {

                const [rows] =
                    await db.query(`
                        SELECT *
                        FROM asset_history
                        ORDER BY imported_at DESC, id DESC
                    `);

                return rows;

            } catch (error) {

                console.error(
                    '[IPC Assets] Error getting asset history:',
                    error
                );

                throw new Error(
                    getDatabaseErrorMessage(error)
                );

            }

        }
    );


    // ========================================
    // RESTORE HISTORICAL ASSET
    // ========================================

    ipcMain.handle(
        'assets:restore',
        async (event, id) => {

            let connection;

            try {

                const numericId =
                    Number(id);


                if (
                    !Number.isInteger(numericId) ||
                    numericId <= 0
                ) {

                    throw new Error(
                        'Ongeldig historisch inventarisitem ID.'
                    );

                }


                const [assetRows] =
                    await db.query(
                        `
                        SELECT *
                        FROM asset_history
                        WHERE id = ?
                        `,
                        [numericId]
                    );


                const asset =
                    assetRows[0];


                if (!asset) {

                    throw new Error(
                        'Het historische inventarisitem bestaat niet meer.'
                    );

                }


                if (asset.asset_id) {

                    const [existingAssetRows] =
                        await db.query(
                            `
                            SELECT id
                            FROM assets
                            WHERE asset_id = ?
                            `,
                            [asset.asset_id]
                        );


                    if (existingAssetRows.length > 0) {

                        throw new Error(
                            'Dit Asset ID bestaat al in de actuele inventaris.'
                        );

                    }

                }


                if (asset.barcode) {

                    const [existingBarcodeRows] =
                        await db.query(
                            `
                            SELECT id
                            FROM assets
                            WHERE barcode = ?
                            `,
                            [asset.barcode]
                        );


                    if (existingBarcodeRows.length > 0) {

                        throw new Error(
                            'Deze barcode bestaat al in de actuele inventaris.'
                        );

                    }

                }


                connection =
                    await db.getConnection();


                await connection.beginTransaction();


                await connection.query(
                    `
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
                    VALUES (
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?
                    )
                    `,
                    [
                        asset.asset_id,
                        asset.barcode,
                        asset.category,
                        asset.brand,
                        asset.type,
                        asset.serial_number,
                        asset.purchase_date,
                        asset.purchase_price,
                        asset.depreciation_period,
                        asset.replacement_period,
                        asset.replacement_year,
                        asset.depreciated,
                        asset.notes,
                        asset.maintenance,
                        asset.last_check
                    ]
                );


                await connection.query(
                    `
                    DELETE FROM asset_history
                    WHERE id = ?
                    `,
                    [numericId]
                );


                await connection.commit();


                return {
                    success: true
                };

            } catch (error) {

                if (connection) {

                    try {
                        await connection.rollback();
                    } catch (rollbackError) {
                        console.error(
                            '[IPC Assets] Rollback error:',
                            rollbackError
                        );
                    }

                }


                console.error(
                    '[IPC Assets] Error restoring historical asset:',
                    error
                );


                return {
                    success: false,
                    error:
                        getDatabaseErrorMessage(error)
                };

            } finally {

                if (connection) {
                    connection.release();
                }

            }

        }
    );


    // ========================================
    // MOVE ASSET TO HISTORY
    // ========================================

    ipcMain.handle(
        'assets:moveToHistory',
        async (event, id) => {

            let connection;

            try {

                const numericId =
                    Number(id);


                if (
                    !Number.isInteger(numericId) ||
                    numericId <= 0
                ) {

                    throw new Error(
                        'Ongeldig inventarisitem ID.'
                    );

                }


                const [assetRows] =
                    await db.query(
                        `
                        SELECT *
                        FROM assets
                        WHERE id = ?
                        `,
                        [numericId]
                    );


                const asset =
                    assetRows[0];


                if (!asset) {

                    throw new Error(
                        'Het inventarisitem bestaat niet meer.'
                    );

                }


                connection =
                    await db.getConnection();


                await connection.beginTransaction();


                await connection.query(
                    `
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
                    VALUES (
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?
                    )
                    `,
                    [
                        asset.asset_id,
                        asset.barcode,
                        asset.category,
                        asset.brand,
                        asset.type,
                        asset.serial_number,
                        asset.purchase_date,
                        asset.purchase_price,
                        asset.depreciation_period,
                        asset.replacement_period,
                        asset.replacement_year,
                        asset.depreciated,
                        asset.notes,
                        asset.maintenance,
                        asset.last_check
                    ]
                );


                await connection.query(
                    `
                    DELETE FROM assets
                    WHERE id = ?
                    `,
                    [numericId]
                );


                await connection.commit();


                return {
                    success: true
                };

            } catch (error) {

                if (connection) {

                    try {
                        await connection.rollback();
                    } catch (rollbackError) {
                        console.error(
                            '[IPC Assets] Rollback error:',
                            rollbackError
                        );
                    }

                }


                console.error(
                    '[IPC Assets] Error moving asset to history:',
                    error
                );


                return {
                    success: false,
                    error:
                        getDatabaseErrorMessage(error)
                };

            } finally {

                if (connection) {
                    connection.release();
                }

            }

        }
    );

}


module.exports = registerAssetHandlers;