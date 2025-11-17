const { SlashCommandBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder()
    .setName('close')
    .setDescription('Close this ticket'),
  async execute(interaction) {
    const channel = interaction.channel;
    await interaction.reply({ content: 'Closing ticket in 5 seconds...', ephemeral: true });
    setTimeout(()=>{ channel.delete().catch(()=>{}); }, 5000);
  }
};
