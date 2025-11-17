const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder()
    .setName('close')
    .setDescription('Close the ticket (staff only).'),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return interaction.reply({ content: 'You do not have permission to close tickets.', ephemeral: true });
    }
    try {
      await interaction.reply({ content: 'Closing ticket in 5 seconds...' });
      setTimeout(async () => {
        await interaction.channel.delete('Ticket closed');
      }, 5000);
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: 'Could not close ticket.', ephemeral: true });
    }
  }
};
