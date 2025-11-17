
// Updated working index.js with slash command deploy for Discord.js v14

const { Client, GatewayIntentBits, Collection, REST, Routes, Partials } = require("discord.js");
const fs = require("fs");
const path = require("path");

// Initialize client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: [Partials.Channel]
});

// Load commands
client.commands = new Collection();
const commands = [];

const commandsFolder = path.join(__dirname, "commands");
const files = fs.readdirSync(commandsFolder).filter(f => f.endsWith(".js"));

for (const file of files) {
    const cmd = require(path.join(commandsFolder, file));
    if (cmd.data && cmd.execute) {
        client.commands.set(cmd.data.name, cmd);
        commands.push(cmd.data.toJSON());
    } else {
        console.log("❌ Invalid command:", file);
    }
}

// Deploy slash commands
const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log("Deploying slash commands...");
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands }
        );
        console.log("Commands deployed!");
    } catch (err) {
        console.error(err);
    }
})();

// Interaction handler
client.on("interactionCreate", async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const cmd = client.commands.get(interaction.commandName);
    if (!cmd) return;

    try {
        await cmd.execute(interaction, client);
    } catch (err) {
        console.error("Command error:", err);
        await interaction.reply({ content: "❌ Error running that command.", ephemeral: true });
    }
});

// Ready
client.once("ready", () => {
    console.log(`Bot logged in as ${client.user.tag}`);
});

// Login
client.login(process.env.TOKEN);
