const { ActionRowBuilder, ButtonBuilder, PermissionFlagsBits, EmbedBuilder, Colors } = require("discord.js");
const { srv, cfg } = require("../../../src/db/index.js");

module.exports = {
  name: "config",
  description: "Configure as configurações (DONO)",
  default_member_permissions: PermissionFlagsBits.Administrator,

  run: async (client, interaction) => {
    if (interaction.user.id !== cfg.get('owner')) {
      return interaction.reply({
        content: '`❌` • Apenas o dono do bot pode utilizar este comando!',
        flags: 64
      });
    }

    const revendaStatus = cfg.get('criarloja') || 'OFF';
    const hiperKey = cfg.get('key_hyper') || 'undefined';
    const accessToken = cfg.get('access_token') || 'undefined';
    const canalSaque = cfg.get('canal_logs_saque');
    const servidores = cfg.get('servidores') || [];

    let servidoresList = 'Nenhum servidor no sistema de revenda.';
    if (servidores.length > 0) {
      servidoresList = servidores.map(x => {
        const guild = client.guilds.cache.get(x);
        return `🔹 **${guild?.name || "Não encontrado"}**\nID: \`${x}\``;
      }).join('\n\n');
    }

    const embed = new EmbedBuilder()
      .setTitle('⚙️ Configurações do BOT')
      .setDescription('Configure o que deseja utilizando os botões abaixo.')
      .setColor(Colors.Blurple)
      .addFields(
        { name: '🛒 Revenda', value: `\`${revendaStatus}\``, inline: true },
        { name: '🔑 Key Hiper', value: hiperKey === 'undefined' ? 'Não definido' : `||${hiperKey}||`, inline: true },
        { name: '🔐 AccessToken', value: accessToken === 'undefined' ? 'Não definido' : `||${accessToken}||`, inline: true },
        { name: '💸 Canal de Saques', value: canalSaque ? `${client.channels.cache.get(canalSaque)?.toString() || "Não encontrado"}` : 'Não definido' },
        { name: '🌐 Servidores de Revenda', value: servidoresList }
      )
      .setFooter({ text: `Solicitado por ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
      .setTimestamp();

    const row1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('revendaOnOff')
        .setLabel(revendaStatus === 'ON' ? 'Desativar Revenda' : 'Ativar Revenda')
        .setEmoji('1380293064932851875')
        .setStyle(revendaStatus === 'ON' ? 4 : 3),
      new ButtonBuilder()
        .setCustomId('cfgKeyHiper')
        .setLabel('Configurar Key Hiper')
        .setEmoji('1380293064932851875')
        .setStyle(2),
      new ButtonBuilder()
        .setCustomId('cfgAccessToken')
        .setLabel('Configurar AccessToken')
        .setEmoji('1380293064932851875')
        .setStyle(2),
      new ButtonBuilder()
        .setCustomId('cfgCanalSaque')
        .setLabel('Configurar Canal Saques')
        .setEmoji('1380293064932851875')
        .setStyle(2)
    );

    const row2 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('add_server')
        .setLabel('Adicionar Servidor')
        .setEmoji('➕')
        .setStyle(3),
      new ButtonBuilder()
        .setCustomId('del_server')
        .setLabel('Remover Servidor')
        .setEmoji('➖')
        .setStyle(4)
    );

    await interaction.reply({
      embeds: [embed],
      components: [row1, row2],
      flags: 64
    });
  }
};
