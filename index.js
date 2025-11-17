const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits, Partials, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { TOKEN, CLIENT_ID, GUILD_ID, LOG_CHANNEL_ID, STAFF_ROLE_ID, TICKET_CATEGORY_ID, BANNER_PATH } = require('./config.js');

if (!TOKEN) {
  console.error("TOKEN is not set in environment variables.");
  process.exit(1);
}

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages], partials: [Partials.Channel] });
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
  const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));
  for (const file of commandFiles) {
    const cmd = require(path.join(commandsPath, file));
    if (cmd.data && cmd.execute) client.commands.set(cmd.data.name, cmd);
  }
}

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
  try {
    if (interaction.isChatInputCommand()) {
      const cmd = client.commands.get(interaction.commandName);
      if (!cmd) return;
      await cmd.execute(interaction, client);
    } else if (interaction.isButton()) {
      // Generic button handling for claim/close/add/remove (buttons created by this bot)
      const [action, ticketId] = interaction.customId.split(':'); // e.g. claim:1234
      if (action === 'claim') {
        // allow only staff roles (supports comma-separated STAFF_ROLE_ID)
        const allowedRoles = (STAFF_ROLE_ID || "").split(',').map(s => s.trim()).filter(Boolean);
        const isStaff = allowedRoles.length === 0 ? interaction.member.permissions.has('ManageGuild') : allowedRoles.some(r => interaction.member.roles.cache.has(r));
        if (!isStaff) return interaction.reply({ content: "You are not allowed to claim tickets.", ephemeral: true });
        const channel = interaction.channel;
        await channel.setName(ch => ch.name.includes('ticket') ? `${channel.name}` : channel.name).catch(()=>{});
        // store claimer as channel topic (or send message)
        await channel.send({ content: `<@${interaction.user.id}> claimed this ticket.` });
        return interaction.reply({ content: `You claimed the ticket.`, ephemeral: true });
      } else if (action === 'close') {
        const channel = interaction.channel;
        await channel.send({ content: `This ticket will be closed by <@${interaction.user.id}>.` });
        // optionally set permissions to prevent sending and archive or delete after 30s
        setTimeout(() => {
          channel.delete().catch(()=>{});
        }, 5000);
        return interaction.reply({ content: 'Closing ticket...', ephemeral: true });
      } else if (action === 'add') {
        const id = interaction.customId.split(':')[1];
        // second part is user id to add
        const userId = id;
        try {
          await interaction.channel.permissionOverwrites.edit(userId, { ViewChannel: true, SendMessages: true });
          await interaction.reply({ content: `Added <@${userId}> to this ticket.`, ephemeral: true });
        } catch (e) {
          await interaction.reply({ content: `Failed to add user: ${e.message}`, ephemeral: true });
        }
      } else if (action === 'remove') {
        const id = interaction.customId.split(':')[1];
        const userId = id;
        try {
          await interaction.channel.permissionOverwrites.edit(userId, { ViewChannel: false });
          await interaction.reply({ content: `Removed <@${userId}> from this ticket.`, ephemeral: true });
        } catch (e) {
          await interaction.reply({ content: `Failed to remove user: ${e.message}`, ephemeral: true });
        }
      }
    }
  } catch (err) {
    console.error('Interaction handler error:', err);
    if (interaction.replied || interaction.deferred) {
      try { await interaction.followUp({ content: 'There was an error.', ephemeral: true }); } catch(e) {}
    } else {
      try { await interaction.reply({ content: 'There was an error.', ephemeral: true }); } catch(e) {}
    }
  }
});

client.login(TOKEN);
