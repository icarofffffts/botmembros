const { ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require("discord.js")
const { srv, cfg, pedidos } = require("../../../src/db/index.js")

module.exports = {
  name: "pedidos",
  description: "Veja seus pedidos",
  run: async(client, interaction) => {
    
    const filtro = pedidos.all().filter(x => x.data.guildid == interaction.guild.id && x.data.userid == interaction.user.id && x.data.status == "Aprovado")
    
    if (!filtro.length) {
      await interaction.reply({ content: `\`\` • Você não possui nenhum pedido!`, flags: 64 })
      return
    }
    
    const peddidos = []
    
    for (const pdd of filtro) {
      peddidos.push({
        label: `ID: ${pdd.ID} - Servidor: ${interaction.guild.name}`,
        description: `Valor pago: R$ ${Number(pdd.data.valor).toFixed(2)} - Quantidade: ${pdd.data.qntd}`,
        emoji: `🟢`,
        value: `${pdd.ID}_verPedido`
      })
    }
    
    await interaction.reply({
      content: `# Seus Pedidos\n\n- Aqui você pode acompanhar seus pedidos, andamento dos pedidos e obter o historico de compras nesse servidor.`,
      components: [
        new ActionRowBuilder()
        .addComponents(
          new StringSelectMenuBuilder()
          .setCustomId("verPedidos")
          .setPlaceholder('Selecione o pedido')
          .setOptions(peddidos)
        )
      ],
      flags: 64
    })
    
  }
}