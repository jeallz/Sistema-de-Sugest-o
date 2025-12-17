const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'messageCreate',
    async execute(message, client) {
        if (message.author.bot) return;

        const configPath = path.join(__dirname, '..', 'config.json');
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

        if (message.channel.id === config.sugestaoChannel) {
            // Deleta a mensagem original
            await message.delete().catch(console.error);

            // Cria a embed com a sugestão
            const sugestaoEmbed = new EmbedBuilder()
                .setColor('#7b359c')
                .setAuthor({ 
                    name: `Sugestão de ${message.author.tag}`, 
                    iconURL: message.author.displayAvatarURL() 
                })
                .setDescription(`\`${message.content}\`` + `\n\nReaja com 👍 para concordar ou 👎 para discordar`)
                .setFooter({ text: `Developed by Oriente` })
                .setTimestamp();

            // Envia a embed no canal de sugestões
            const sugestaoMessage = await message.channel.send({ embeds: [sugestaoEmbed] });

            // Adiciona as reações
            await sugestaoMessage.react('👍');
            await sugestaoMessage.react('👎');

            // Cria o tópico para discussão
            const thread = await sugestaoMessage.startThread({
                name: `Discussão: Sugestão de ${message.author.username}`,
                autoArchiveDuration: 1440 // 24 horas
            });

            // Envia mensagem inicial no tópico
            await thread.send({
                content: `Discussão iniciada por ${message.author}!\nUse este tópico para debater sobre a sugestão acima.`
            });

            // Cria a embed para o canal de logs
            const logsEmbed = new EmbedBuilder()
                .setColor('#7b359c')
                .setAuthor({ 
                    name: `Sugestão de ${message.author.tag}`, 
                    iconURL: message.author.displayAvatarURL() 
                })
                .setDescription(`\`${message.content}\``)
                .setFooter({ text: `Developed by Oriente` })
                .setTimestamp();

            // Cria os botões de aprovar/recusar
            const aprovarButton = new ButtonBuilder()
                .setCustomId('aprovar_sugestao')
                .setLabel('Aprovar')
                .setStyle(ButtonStyle.Success);

            const recusarButton = new ButtonBuilder()
                .setCustomId('recusar_sugestao')
                .setLabel('Recusar')
                .setStyle(ButtonStyle.Danger);

            const row = new ActionRowBuilder()
                .addComponents(aprovarButton, recusarButton);

            // Envia a embed no canal de logs
            const logsChannel = message.guild.channels.cache.get(config.sugestaoLogsChannel);
            await logsChannel.send({
                embeds: [logsEmbed],
                components: [row]
            });
        }
    }
}; 