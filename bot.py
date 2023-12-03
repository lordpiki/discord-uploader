import discord
from discord.ext import commands
from discord.ext.commands import Bot
from discord import File

intents = discord.Intents.default()
intents.message_content = True

bot = commands.Bot(command_prefix='$', intents=intents)

@bot.event
async def on_ready():
    print(f'We have logged in as {bot.user}')

@bot.command(name='upload')
async def upload_file(ctx):
    # Check if the command is sent by the bot owner (replace with your user ID)
    if True:
        # Get the first attached file from the message
        attachment = ctx.message.attachments[0] if ctx.message.attachments else None
        print("jst here")
        if attachment:
            # Save the file to your local directory
            file_path = f'./{attachment.filename}'  # Change the path if needed
            await attachment.save(file_path)
            print("here", file_path)

            # Upload the file to the same channel
            with open(file_path, 'rb') as file:
                uploaded_file = File(file)
                await ctx.send(content='Here is the uploaded file:', file=uploaded_file)

            # Optionally, you can delete the local file after uploading
            import os
            os.remove(file_path)
        else:
            await ctx.send('No file attached.')
    else:
        await ctx.send('You do not have permission to use this command.')

# Run the bot
bot.run('MTE4MDg5MjY4Mzc2MjQxNzY4NA.GdEdgT.VPRPDaIEahXJMOeqI68IXEV3xdd39g-6RHeIt0')
