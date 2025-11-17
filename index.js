const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits, REST, Routes, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');
const { TOKEN, CLIENT_ID, GUILD_ID, ADMIN_ROLE_ID } = require('./config.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages] });

client.commands = new Collection();
const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON());
  } else {
    console.log(`Skipped ${file}: missing "data" or "execute"`);
  }
}

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);

  // register guild commands
  const rest = new REST({ version: '10' }).setToken(TOKEN);
  try {
    console.log('Refreshing slash commands...');
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands },
    );
    console.log('Slash commands registered!');
  } catch (error) {
    console.error(error);
  }
});

client.on('interactionCreate', async interaction => {
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try {
      await command.execute(interaction, client);
    } catch (error) {
      console.error(error);
      if (interaction.replied || interaction.deferred) {
        await interaction.editReply({ content: 'There was an error executing this command.' });
      } else {
        await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
      }
    }
  } else if (interaction.isButton()) {
    // Button handlers for claim/close/add/remove
    const id = interaction.customId;
    const member = interaction.member;
    const channel = interaction.channel;

    if (id === 'claim_ticket') {
      // Only allow admins (by role) to claim
      if (!ADMIN_ROLE_ID || !member.roles.cache.has(ADMIN_ROLE_ID)) {
        return interaction.reply({ content: 'You do not have permission to claim tickets.', ephemeral: true });
      }
      try {
        await channel.permissionOverwrites.edit(interaction.user.id, { ViewChannel: true, SendMessages: true });
        await channel.setName(`${channel.name}-claimed`);
        await interaction.reply({ content: `Ticket claimed by ${interaction.user.tag}.`, ephemeral: false });
      } catch (err) {
        console.error(err);
        await interaction.reply({ content: 'Could not claim the ticket (permissions?).', ephemeral: true });
      }
    } else if (id === 'close_ticket') {
      if (!member.permissions.has(PermissionsBitField.Flags.ManageChannels) && !member.roles.cache.has(ADMIN_ROLE_ID || '')) {
        return interaction.reply({ content: 'You do not have permission to close tickets.', ephemeral: true });
      }
      try {
        await interaction.reply({ content: 'Closing ticket in 5 seconds...' });
        setTimeout(async () => {
          await channel.delete('Ticket closed');
        }, 5000);
      } catch (err) {
        console.error(err);
        await interaction.reply({ content: 'Could not close the ticket.', ephemeral: true });
      }
    }
  }
});

client.login(TOKEN);
