const { ActionRowBuilder, ButtonBuilder, PermissionFlagsBits } = require("discord.js")
const { srv, cfg } = require("../../../src/db/index.js")

module.exports = {
  name: "configloja",
  description: "Configure sua loja",
  default_member_permissions: PermissionFlagsBits.Administrator,
  run: async(client, interaction) => {
    
    if (!srv.has(interaction.guild.id)) {
      await interaction.reply({ content: `\`❌\` • Servidor não registrado no sistema.`, flags: 64 })
      return
    }
    
    if (interaction.guild.ownerId != interaction.user.id) {
      if (!srv.get(`${interaction.guild.id}.perms`)?.includes(interaction.user.id)) {
        await interaction.reply({ content: `\`❌\` • Você não possui permissão`, flags: 64 })
        return
      }
    }
    
    const pp = srv.get(interaction.guild.id)
    await interaction.reply({
      content: `# **Configurações do servidor**\n- Aqui você poderá configurar a mensagem, preços e outras opções relacionadas a venda de membros no servidor \`${interaction.guild.name}\`\n  - Saldo atual: \`R$ ${Number(pp.saldo).toFixed(2)}\`\n\n- **Configurações atuais:**\n  - Vendas: \`${pp.vendas == "ON" ? "🟢 Ativa" : "🔴 Não ativa"}\`\n  - Pedido mínimo: \`${pp.pedidoMin}\`\n  - Preço por membro \`R$ ${Number(pp.precoMembro).toFixed(2)} (R$ ${Number(pp.precoMembro) * 100} a cada 100)\`\n  - Comissão: \`50%\`\n  - Cargo de equipe: ${interaction.guild.roles.cache.get(pp.cargoEquipe) || "\`Não possui\`"}\n  - Cargo de cliente: ${interaction.guild.roles.cache.get(pp.cargoCliente) || "\`Não possui\`"}\n  - Email: \`${pp.email == "undefined" ? "Não definido" : pp.email}\`\n\n- **Usuários com permissão:**\n  - ${pp.perms.length ? pp.perms.map(x => `<@${x}>`).join("\n") : `\`Nenhum configurado ainda\``}\n\n${pp.webhook == "undefined" ? "-# • \`⚠️\` • O Webhook não foi configurado. sem ele você não receberá notificação de vendas!" : ""}\n${pp.msgEnviada == "nao" ? "-# • \`⚠️\` • A mensagem de vendas não foi enviada ainda." : ""}`,
      components: [
        new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
          .setCustomId('estatisticas')
          .setLabel("Estatísticas")
          .setEmoji('📊')
          .setStyle(1),
          new ButtonBuilder()
          .setCustomId('cfgPrecoECargo')
          .setLabel("Configurar preços/cargos")
          .setEmoji('⚙️')
          .setStyle(1),
          new ButtonBuilder()
          .setCustomId('cfgMsg')
          .setLabel("Configurar mensagem")
          .setEmoji('⚙️')
          .setStyle(1)
        ),
        new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
          .setCustomId('cfgAvancada')
          .setLabel("Configucões avançadas")
          .setEmoji('🔧')
          .setStyle(2),
          new ButtonBuilder()
          .setCustomId('excluirServe')
          .setLabel("Excluir servidor")
          .setEmoji('🗑️')
          .setStyle(4),
          new ButtonBuilder()
          .setCustomId('attPainel')
          .setLabel("Atualizar esse painel")
          .setEmoji('🔄')
          .setStyle(2)
        )
      ],
      flags: 64
    })
    
  }
}