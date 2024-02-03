// botController.js
const Discord = require('discord.js');
const axios = require('axios');
const multer = require('multer');
const fs = require('fs');
const { Client, GatewayIntentBits } = Discord;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const uploadedFiles = new Map();

// Read tokens from the configuration file
const { BOT_TOKEN, DISCORD_CHANNEL_ID } = readTokens();

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.login(BOT_TOKEN);

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

module.exports = {
  client,
  upload,
  uploadedFiles,
  DISCORD_CHANNEL_ID
};
