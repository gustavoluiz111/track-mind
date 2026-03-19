const { query } = require('../config/db');

const generateUniqueToken = async () => {
    const currentYear = new Date().getFullYear();
    let token = '';
    let isUnique = false;

    while (!isUnique) {
        const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
        token = `EQP-${currentYear}-${randomChars}`;

        // Check if it already exists in the database
        const result = await query('SELECT 1 FROM itens WHERE token = $1', [token]);
        if (result.rowCount === 0) {
            isUnique = true;
        }
    }

    return token;
};

module.exports = {
    generateUniqueToken
};
