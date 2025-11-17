const fs = require('fs');
const path = require('path');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const { CLIENT_ID, GUILD_ID, TOKEN } = require('./config.js');

if (!TOKEN || !CLIENT_ID || !GUILD_ID) {
  console.error('TOKEN, CLIENT_ID and GUILD_ID must be set as environment variables.');
  process.exit(1);
}

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
  const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));
  for (const file of commandFiles) {
    const cmd = require(path.join(commandsPath, file));
    if (cmd.data) commands.push(cmd.data.toJSON ? cmd.data.toJSON() : cmd.data);
  }
}

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();
