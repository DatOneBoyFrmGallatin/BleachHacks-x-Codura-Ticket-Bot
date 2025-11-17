const { SlashCommandBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder()
    .setName('claim')
    .setDescription('Claim the open ticket (admins only).')
    .addChannelOption(option => option.setName('channel').setDescription('Ticket channel to claim (optional)').setRequired(false)),
  async execute(interaction) {
    const channel = interaction.options.getChannel('channel') || interaction.channel;
    const { ADMIN_ROLE_ID } = require('../config.js');
    if (!interaction.member.roles.cache.has(ADMIN_ROLE_ID)) {
      return interaction.reply({ content: 'You do not have permission to claim tickets.', ephemeral: true });
    }
    try {
      await channel.permissionOverwrites.edit(interaction.user.id, { ViewChannel: true, SendMessages: true });
      await channel.setName(`${channel.name}-claimed`);
      await interaction.reply({ content: `Ticket claimed by ${interaction.user.tag}.` });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: 'Could not claim the ticket.' , ephemeral: true });
    }
  }
};
