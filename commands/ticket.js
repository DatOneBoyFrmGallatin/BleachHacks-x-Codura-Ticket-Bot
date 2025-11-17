const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Open a new support ticket.'),
  async execute(interaction) {
    const guild = interaction.guild;
    const member = interaction.member;
    const name = `ticket-${member.user.username}`.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 90);

    // Find if a ticket already exists for this user
    const existing = guild.channels.cache.find(c => c.name.startsWith(`ticket-${member.user.username.toLowerCase()}`) && c.topic && c.topic.includes(`userId:${member.id}`));
    if (existing) {
      return interaction.reply({ content: `You already have an open ticket: ${existing}`, ephemeral: true });
    }

    try {
      const channel = await guild.channels.create({
        name,
        type: 0, // GUILD_TEXT
        topic: `Ticket for ${member.user.tag} — userId:${member.id}`,
        permissionOverwrites: [
          { id: guild.roles.everyone, deny: ['ViewChannel'] },
          { id: member.id, allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'] },
        ],
      });

      // Ticket message with buttons
      const claimBtn = new ButtonBuilder().setCustomId('claim_ticket').setLabel('Claim').setStyle(ButtonStyle.Primary);
      const closeBtn = new ButtonBuilder().setCustomId('close_ticket').setLabel('Close').setStyle(ButtonStyle.Danger);
      const row = new ActionRowBuilder().addComponents(claimBtn, closeBtn);

      await channel.send({ content: `Ticket opened by ${member.user.tag}. Staff will be with you shortly.`, components: [row] });

      await interaction.reply({ content: `Ticket created: ${channel}`, ephemeral: true });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: 'Failed to create ticket.', ephemeral: true });
    }
  }
};
