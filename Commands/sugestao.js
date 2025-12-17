const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sugestao')
        .setDescription('Configura o sistema de sugestões')
        .addChannelOption(option =>
            option.setName('canal')
                .setDescription('Canal onde as sugestões serão enviadas')
                .setRequired(true))
        .addChannelOption(option =>
            option.setName('logs')
                .setDescription('Canal onde os logs das sugestões serão enviados')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('cargo_aprovador')
                .setDescription('Cargo que poderá aprovar/recusar sugestões')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const channel = interaction.options.getChannel('canal');
        const logsChannel = interaction.options.getChannel('logs');
        const cargoAprovador = interaction.options.getRole('cargo_aprovador');
        
        // Atualiza o arquivo de configuração
        const configPath = path.join(__dirname, '..', 'config.json');
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        config.sugestaoChannel = channel.id;
        config.sugestaoLogsChannel = logsChannel.id;
        config.sugestaoAprovadorRole = cargoAprovador.id;
        fs.writeFileSync(configPath, JSON.stringify(config, null, 4));

        await interaction.reply({
            content: `✅ Sistema de sugestões configurado com sucesso!\nCanal de sugestões: ${channel}\nCanal de logs: ${logsChannel}\nCargo de aprovador: ${cargoAprovador}`,
            flags: 64
        });
    },
}; 