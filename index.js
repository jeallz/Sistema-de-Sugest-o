const { Client, GatewayIntentBits, Collection, Events, AttachmentBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js')
const Discord = require('discord.js');
const { REST, Routes } = require('discord.js');
const Colors = require('colors');
const fs = require('fs');
const path = require('path');

const dotenv = require('dotenv')
dotenv.config()
const { TOKEN, CLIENT_ID } = process.env

const client = new Discord.Client({
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ] 
});

client.commands = new Collection();

const commandsPath = path.join(__dirname, "Commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

for (const file of commandFiles){
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ("data" in command && "execute" in command) {
        client.commands.set(command.data.name, command);
    } else  {
        console.log(`Esse comando em ${filePath} está com "data" ou com "execute ausentes"`);
    } 
}

const eventsPath = path.join(__dirname, "Events")
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith(".js"))

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file)
    const event = require(filePath)
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client))
    } else {
        client.on(event.name, (...args) => event.execute(...args, client))
    }
}

const commandsFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

const commands = []

for (const file of commandsFiles){
    const command = require(`./Commands/${file}`);
    commands.push(command.data.toJSON());
}

const rest = new REST({version: '10'}).setToken(TOKEN);

(async () => {
    try {
        console.log(`Resetando ${commands.length} comandos...`.yellow);
        const data = await rest.put(
            Routes.applicationCommands(CLIENT_ID),
          { body: commands },
            console.log(`${commands.length} registrados com sucesso!`.green)
        )
    } catch (error){
        console.error(error.red);
    }
})();

client.once(Discord.Events.ClientReady, async (c) => {
    console.log(`Pronto! Login realizado como ${c.user.username}.`.magenta);
});

client.on('interactionCreate', async interaction => {
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Ocorreu um erro ao executar este comando!', ephemeral: true });
        }
    } else if (interaction.isButton() || interaction.isModalSubmit()) {
        await interaction.deferUpdate();
        const result = await require('./Events/sugestaoInteractions.js').execute(interaction, client);
        if (result) {
            await interaction.editReply(result);
        }
    }
});

client.login(TOKEN);

function random(items){
    let index = Math.floor(Math.random() * items.length);
    return items[index];
};