const { SlashCommandBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder()
    .setName('add')
    .setDescription('Add a user to the ticket.')
    .addUserOption(o=>o.setName('user').setDescription('User to add').setRequired(true)),
  async execute(interaction) {
    const user = interaction.options.getUser('user');
    try {
      await interaction.channel.permissionOverwrites.edit(user.id, { ViewChannel: true, SendMessages: true, ReadMessageHistory: true });
      await interaction.reply({ content: `${user.tag} has been added to the ticket.` });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: 'Could not add user.', ephemeral: true });
    }
  }
};
