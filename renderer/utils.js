function escapeHtml(value) {

    if (value === null || value === undefined) {
        return '';
    }

    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function cleanValue(value) {

    if (value === null || value === undefined) {
        return '';
    }

    return String(value).trim();
}

export {
    escapeHtml,
    cleanValue
};