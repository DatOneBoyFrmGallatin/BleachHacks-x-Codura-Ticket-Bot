const { SlashCommandBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder()
    .setName('remove')
    .setDescription('Remove a user from the ticket.')
    .addUserOption(o=>o.setName('user').setDescription('User to remove').setRequired(true)),
  async execute(interaction) {
    const user = interaction.options.getUser('user');
    try {
      await interaction.channel.permissionOverwrites.edit(user.id, { ViewChannel: false });
      await interaction.reply({ content: `${user.tag} has been removed from the ticket.` });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: 'Could not remove user.', ephemeral: true });
    }
  }
};
