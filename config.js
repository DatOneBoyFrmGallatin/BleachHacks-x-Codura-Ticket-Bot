module.exports = {
  TOKEN: process.env.TOKEN,
  CLIENT_ID: process.env.CLIENT_ID,
  GUILD_ID: process.env.GUILD_ID,
  LOG_CHANNEL_ID: process.env.LOG_CHANNEL_ID || null,
  STAFF_ROLE_ID: process.env.STAFF_ROLE_ID || "", // comma-separated role IDs allowed
  TICKET_CATEGORY_ID: process.env.TICKET_CATEGORY_ID || null,
  BANNER_PATH: './assets/banner.png'
};
