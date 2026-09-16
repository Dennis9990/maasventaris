const mysql = require('mysql2/promise');

async function initializeDatabase() {

    const pool = mysql.createPool({
        host: '57.129.133.184',
        port: 3316,
        user: 'maasventaris',
        password: 'tdmaas',
        database: 'maasventaris',

        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });


    async function initializeTables() {

        const connection = await pool.getConnection();

        try {

            await connection.query(`
                CREATE TABLE IF NOT EXISTS categories (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL UNIQUE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);


            await connection.query(`
                CREATE TABLE IF NOT EXISTS assets (
                    id INT AUTO_INCREMENT PRIMARY KEY,

                    asset_id VARCHAR(255) UNIQUE,
                    barcode VARCHAR(255) UNIQUE,

                    category VARCHAR(255),
                    brand VARCHAR(255),
                    type VARCHAR(255),
                    serial_number VARCHAR(255),

                    purchase_date TEXT,
                    purchase_price DECIMAL(10, 2),

                    depreciation_period INT,
                    replacement_period INT,
                    replacement_year INT,

                    depreciated BOOLEAN DEFAULT FALSE,

                    notes TEXT,
                    maintenance TEXT,

                    last_check TEXT,

                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                        ON UPDATE CURRENT_TIMESTAMP
                )
            `);


            await connection.query(`
                CREATE TABLE IF NOT EXISTS asset_history (
                    id INT AUTO_INCREMENT PRIMARY KEY,

                    asset_id VARCHAR(255),
                    barcode VARCHAR(255),

                    category VARCHAR(255),
                    brand VARCHAR(255),
                    type VARCHAR(255),
                    serial_number VARCHAR(255),

                    purchase_date TEXT,
                    purchase_price DECIMAL(10, 2),

                    depreciation_period INT,
                    replacement_period INT,
                    replacement_year INT,

                    depreciated BOOLEAN DEFAULT FALSE,

                    notes TEXT,
                    maintenance TEXT,

                    last_check TEXT,

                    imported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            console.log(
                '[Database] Tables initialized successfully.'
            );

        } finally {

            connection.release();

        }

    }


    await initializeTables;

    initializeTables().catch(error => {
        console.error('[Database] Failed to initialize tables:', error);
    });
    return pool;

}


module.exports = initializeDatabase;