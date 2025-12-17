const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Ver o ping da Honey.'),

	async execute(interaction) {
        const oi = new EmbedBuilder()
            .setColor('#7b359c')
            .setDescription(`
                Meu ping é: \`${interaction.client.ws.ping} Ms\`
            `)

		interaction.reply({ embeds: [oi], flags: 64 })
	},
};