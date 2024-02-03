# Discord File Uploader Bot

A Discord bot that allows users to upload files to a Discord channel, with support for large files split into chunks.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Contributing](#contributing)
- [License](#license)

## Features

- File upload to a designated Discord channel.
- Support for large files split into chunks.
- Download files from Discord.
- List uploaded files.

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/discord-file-uploader-bot.git
   ```

2. Install dependencies:

   ```bash
   cd discord-file-uploader-bot
   npm install
   ```

3. Set up your Discord bot and obtain the bot token.

4. Create a `tokens.token` file in the project root with the following content:

   ```
   BOT_TOKEN=your_discord_bot_token
   DISCORD_CHANNEL_ID=your_discord_channel_id
   ```

## Usage

1. Start the bot and web server:

   ```bash
   npm start
   ```

2. Visit `http://localhost:3000` in your web browser.

3. Use the file upload form to upload files to Discord.

## Configuration

Create a `tokens.token` file to configure your Discord bot token and channel ID.
The file should look something like this:
```txt
BOT_TOKEN=<your discord bot's token>
DISCORD_CHANNEL_ID=<id of discord's chat room>

```

## Contributing

Contributions are welcome! Feel free to submit issues or pull requests.

## License

This project is licensed under the [MIT License](LICENSE).
