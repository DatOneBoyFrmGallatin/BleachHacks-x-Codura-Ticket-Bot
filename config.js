module.exports = {
  TOKEN: process.env.TOKEN || '',
  CLIENT_ID: process.env.CLIENT_ID || '',
  GUILD_ID: process.env.GUILD_ID || '',
  // Optional: role allowed to automatically see/claim tickets (set this as a role ID in Railway variables)
  ADMIN_ROLE_ID: process.env.ADMIN_ROLE_ID || ''
};
