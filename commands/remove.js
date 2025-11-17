const { SlashCommandBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder()
    .setName('remove')
    .setDescription('Remove a user from the ticket')
    .addUserOption(opt => opt.setName('user').setDescription('User to remove').setRequired(true)),
  async execute(interaction) {
    const user = interaction.options.getUser('user');
    try {
      await interaction.channel.permissionOverwrites.edit(user.id, { ViewChannel: false });
      await interaction.reply({ content: `Removed ${user.tag} from this ticket.`, ephemeral: true });
    } catch (e) {
      await interaction.reply({ content: `Could not remove user: ${e.message}`, ephemeral: true });
    }
  }
};
