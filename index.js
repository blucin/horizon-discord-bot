const fs = require('node:fs');
const path = require('node:path');
const {
	Client,
	Events,
	GatewayIntentBits,
	Collection
} = require('discord.js');
require('dotenv').config();

const client = new Client({
	intents: [GatewayIntentBits.Guilds]
});

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// check if it's a command object
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is not a valid command file`);
	}
}

client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN);

// slash command logger
client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;
	//console.log(interaction);
	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (err) {
		console.error(err);
		await interaction.reply({
			content: 'There was an error while executing this command',
			ephemeral: true
		})
	}
});