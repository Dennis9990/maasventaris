const { ipcMain } = require('electron');

function registerCategoriesHandlers(db) {

    ipcMain.handle(
        'categories:getAll',
        async () => {

            const [rows] = await db.query(`
                SELECT *
                FROM categories
                ORDER BY name ASC
            `);

            return rows;

        }
    );


    ipcMain.handle(
        'categories:add',
        async (event, name) => {

            const categoryName =
                String(name || '').trim();

            if (!categoryName) {

                throw new Error(
                    'Categorie naam mag niet leeg zijn.'
                );

            }

            try {

                const [result] =
                    await db.query(`
                        INSERT INTO categories (name)
                        VALUES (?)
                    `, [
                        categoryName
                    ]);

                return {
                    success: true,
                    id: result.insertId,
                    name: categoryName
                };

            } catch (error) {

                if (
                    error.code ===
                    'ER_DUP_ENTRY'
                ) {

                    throw new Error(
                        'Deze categorie bestaat al.'
                    );

                }

                throw error;

            }

        }
    );

}

module.exports = registerCategoriesHandlers;