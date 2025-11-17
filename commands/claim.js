const { SlashCommandBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder()
    .setName('claim')
    .setDescription('Claim the current ticket (staff only)'),
  async execute(interaction) {
    const config = require('../config.js');
    const allowedRoles = (config.STAFF_ROLE_ID||'').split(',').map(s=>s.trim()).filter(Boolean);
    const isStaff = allowedRoles.length === 0 ? interaction.member.permissions.has('ManageGuild') : allowedRoles.some(r => interaction.member.roles.cache.has(r));
    if (!isStaff) return interaction.reply({ content: 'You are not allowed to claim tickets.', ephemeral: true });
    const channel = interaction.channel;
    await channel.send({ content: `<@${interaction.user.id}> claimed this ticket.` });
    return interaction.reply({ content: 'Ticket claimed.', ephemeral: true });
  }
};
