const fs = require('fs');

function readTokens() {
    const tokens = {};

    try {
        const data = fs.readFileSync('tokens.token', 'utf8');
        const lines = data.split('\n');

        for (const line of lines) {
            const keyValue = line.split('=');

            if (keyValue.length === 2) {
                const [key, value] = keyValue.map(part => part.trim());
                tokens[key] = value;
            }
        }
    } catch (err) {
        console.error('Error reading tokens from tokens.token:', err);
        process.exit(1);
    }

    return tokens;
}

module.exports = { readTokens };
