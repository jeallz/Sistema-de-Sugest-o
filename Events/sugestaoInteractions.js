const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (!interaction.isButton()) return;

        const configPath = path.join(__dirname, '..', 'config.json');
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

        // Verifica se é uma interação de sugestão
        if (interaction.customId === 'aprovar_sugestao' || interaction.customId === 'recusar_sugestao') {
            // Verifica se o usuário tem o cargo necessário
            if (!interaction.member.roles.cache.has(config.sugestaoAprovadorRole)) {
                return {
                    content: 'Você não tem permissão para aprovar/recusar sugestões!',
                    ephemeral: true
                };
            }

            const embed = interaction.message.embeds[0];
            const authorField = embed.author.name;
            const authorId = authorField.split('Sugestão de ')[1].split('#')[0];

            // Procura a mensagem original no canal de sugestões
            const sugestaoChannel = interaction.guild.channels.cache.get(config.sugestaoChannel);
            const messages = await sugestaoChannel.messages.fetch({ limit: 100 });
            const sugestaoMessage = messages.find(msg => 
                msg.embeds[0] && 
                msg.embeds[0].author && 
                msg.embeds[0].author.name === authorField
            );

            if (sugestaoMessage) {
                const novoEmbed = EmbedBuilder.from(sugestaoMessage.embeds[0])
                    .setColor(interaction.customId === 'aprovar_sugestao' ? '#00ff00' : '#ff0000')
                    .setTitle(interaction.customId === 'aprovar_sugestao' ? 'Sugestão Aprovada' : 'Sugestão Recusada')
                    .setDescription(sugestaoMessage.embeds[0].description + 
                        `\n\n${interaction.customId === 'aprovar_sugestao' ? '✅' : '❌'} Esta sugestão foi ${interaction.customId === 'aprovar_sugestao' ? 'aprovada' : 'recusada'} por ${interaction.user}`);

                await sugestaoMessage.edit({ embeds: [novoEmbed] });
            }

            // Atualiza a embed no canal de logs
            const novoEmbedLogs = EmbedBuilder.from(embed)
                .setColor(interaction.customId === 'aprovar_sugestao' ? '#00ff00' : '#ff0000')
                .setTitle(interaction.customId === 'aprovar_sugestao' ? 'Sugestão Aprovada' : 'Sugestão Recusada')
                .setDescription(embed.description + 
                    `\n\n${interaction.customId === 'aprovar_sugestao' ? '✅' : '❌'} Esta sugestão foi ${interaction.customId === 'aprovar_sugestao' ? 'aprovada' : 'recusada'} por ${interaction.user}`);

            await interaction.message.edit({
                embeds: [novoEmbedLogs],
                components: []
            });

            return {
                content: `✅ Sugestão ${interaction.customId === 'aprovar_sugestao' ? 'aprovada' : 'recusada'} com sucesso!`,
                ephemeral: true
            };
        }
    }
}; 