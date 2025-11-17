const { SlashCommandBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder()
    .setName('add')
    .setDescription('Add a user to the ticket')
    .addUserOption(opt => opt.setName('user').setDescription('User to add').setRequired(true)),
  async execute(interaction) {
    const user = interaction.options.getUser('user');
    try {
      await interaction.channel.permissionOverwrites.edit(user.id, { ViewChannel: true, SendMessages: true });
      await interaction.reply({ content: `Added ${user.tag} to this ticket.`, ephemeral: true });
    } catch (e) {
      await interaction.reply({ content: `Could not add user: ${e.message}`, ephemeral: true });
    }
  }
};
