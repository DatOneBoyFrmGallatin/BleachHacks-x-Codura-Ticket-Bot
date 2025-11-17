const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionsBitField } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Open a support ticket'),
  async execute(interaction) {
    const guild = interaction.guild;
    const user = interaction.user;
    const config = require('../config.js');
    const categoryId = config.TICKET_CATEGORY_ID || null;
    // create channel name unique
    const channelName = `ticket-${user.username.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Date.now().toString().slice(-4)}`;
    const overwrites = [
      { id: guild.roles.everyone.id, deny: [PermissionsBitField.Flags.ViewChannel] },
      { id: user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
    ];
    const channel = await guild.channels.create({
      name: channelName,
      type: 0, // GUILD_TEXT in v14 code constants = 0
      parent: categoryId || undefined,
      permissionOverwrites: overwrites,
      reason: `Ticket created by ${user.tag}`
    });
    // Buttons: claim, close
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder().setCustomId('claim:' + channel.id).setLabel('Claim').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('close:' + channel.id).setLabel('Close').setStyle(ButtonStyle.Danger)
      );
    const embed = new EmbedBuilder()
      .setTitle('Ticket created')
      .setDescription(`Thanks ${user}. A staff member will be with you shortly.`)
      .setThumbnail(user.displayAvatarURL())
      .setColor(0xff6600);
    // optional banner attachment
    try {
      if (config.BANNER_PATH && require('fs').existsSync(config.BANNER_PATH)) {
        embed.setImage('attachment://banner.png');
        await channel.send({ embeds: [embed], components: [row], files: [{ attachment: config.BANNER_PATH, name: 'banner.png' }] });
      } else {
        await channel.send({ embeds: [embed], components: [row] });
      }
    } catch (e) {
      console.error('Failed to send ticket message:', e);
      await channel.send({ embeds: [embed], components: [row] });
    }
    await interaction.reply({ content: `Ticket created: ${channel}`, ephemeral: true });
  }
};
