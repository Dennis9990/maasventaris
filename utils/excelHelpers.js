function cleanValue(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return null;
    }

    const stringValue =
        String(value).trim();

    if (stringValue === '') {
        return null;
    }

    return stringValue;
}

function parseNumber(value) {

    if (
        value === null ||
        value === undefined ||
        value === ''
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
        value === ''
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

function parseBoolean(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return 0;
    }

    const normalized =
        String(value)
            .trim()
            .toLowerCase();

    return (
        normalized === 'ja' ||
        normalized === 'yes' ||
        normalized === 'true' ||
        normalized === '1'
    )
        ? 1
        : 0;
}

function formatExcelDate(value) {

    if (
        value === null ||
        value === undefined ||
        value === ''
    ) {
        return null;
    }

    if (value instanceof Date) {

        if (Number.isNaN(value.getTime())) {
            return null;
        }

        const year =
            value.getFullYear();

        const month =
            String(
                value.getMonth() + 1
            ).padStart(2, '0');

        const day =
            String(
                value.getDate()
            ).padStart(2, '0');

        return `${year}-${month}-${day}`;
    }


    return String(value).trim() || null;
}


function mapExcelAsset(row) {

    return {

        asset_id:
            cleanValue(
                row['AssetID']
            ),

        barcode:
            cleanValue(
                row['Barcode']
            ),

        category:
            cleanValue(
                row['Categorie']
            ),

        brand:
            cleanValue(
                row['Merk']
            ),

        type:
            cleanValue(
                row['Type']
            ),

        serial_number:
            cleanValue(
                row['Serienummer']
            ),

        purchase_date:
            formatExcelDate(
                row['Aanschaf Datum']
            ),

        purchase_price:
            parseNumber(
                row['Aanschaf Prijs']
            ),

        depreciation_period:
            parseInteger(
                row['Afschrijving Termijn']
            ),

        replacement_period:
            parseInteger(
                row['Vervang Termijn']
            ),

        replacement_year:
            parseInteger(
                row['Vervang Jaar']
            ),

        owner:
            cleanValue(
                row['Eigenaar']
            ),

        depreciated:
            parseBoolean(
                row['Afgeschreven']
            ),

        notes:
            cleanValue(
                row['Opmerking']
            ),

        maintenance:
            cleanValue(
                row['Onderhoud']
            ),

        last_check:
            formatExcelDate(
                row['Laatste check']
            )

    };

}


export {
    cleanValue,
    parseNumber,
    parseInteger,
    parseBoolean,
    formatExcelDate,
    mapExcelAsset
};