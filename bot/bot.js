const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const tokens = readTokens();
client.tokens = tokens;

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.login(tokens.BOT_TOKEN);

// Function to read tokens from the configuration file
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

module.exports = { client, tokens };
