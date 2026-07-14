const { ActionRowBuilder, ButtonBuilder, EmbedBuilder, ModalBuilder, TextInputBuilder, AttachmentBuilder, ChannelType, ComponentType } = require("discord.js")
const { srv, cfg, pedidos } = require("../../../src/db/index.js")
const { MercadoPagoConfig, Payment } = require('mercadopago')
const axios = require('axios')

module.exports = {
  name: "interactionCreate",
  run: async(interaction, client) => {
    
    if (interaction.isButton()) {
      if (interaction.customId == 'comprar_membros') {
        
        if (srv.get(`${interaction.guild.id}.vendas`) != "ON") {
          await interaction.reply({
            content: `\`❌\` • O sistema de vendas está desativado!`,
            flags: 64
          })
          return
        }
        
        const thread = interaction.channel.threads.cache.find(x => x.name == `membros・${interaction.user.id}`)
        
        if (thread != undefined) {
          await interaction.reply({ content: `\`❌\`・Você já possui canal criado, acesse ele aqui: ${thread}`, flags: 64 })
          return
        }
        
        const threadd = await interaction.channel.threads.create({
          name: `membros・${interaction.user.id}`,
          type: ChannelType.PrivateThread,
          reason: 'Needed a separate thread for moderation',
          members: [interaction.user.id]
        })
        
        const tempoPagar = Date.now() + 30 * 60 * 1000
        const tempoFormado = Math.floor(tempoPagar / 1000)
        
        pedidos.set(threadd.id, {
          id: threadd.id,
          valor: parseFloat(srv.get(`${interaction.guild.id}.precoMembro`) * srv.get(`${interaction.guild.id}.pedidoMin`)),
          qntd: srv.get(`${interaction.guild.id}.pedidoMin`),
          status: 'Editando',
          userid: interaction.user.id,
          tempopagar: tempoFormado,
          guildid: interaction.guild.id
        })
        
        await threadd.send({
          content: `# **Carrinho • M3mbros Reais**\n- Olá ${interaction.user}! Aqui estão as informações de seu carrinho\n\n\`💵\`・Preço total: \`R$ ${Number(pedidos.get(`${threadd.id}.valor`)).toFixed(2)}\`\n\`👥\`・Quantidade de Membros: \`x${pedidos.get(`${threadd.id}.qntd`)}\`\n\n\`⏳\`・Tempo restante para deletar o carrinho: <t:${tempoFormado}:R>\n\n> -# Entrega 100% automatica, garantida e segura! com melhor preço do mercado.`,
          components: [
            new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
              .setCustomId(`${threadd.id}_menos`)
              .setEmoji(`1337385790543630376`)
              .setStyle(4),
              new ButtonBuilder()
              .setCustomId(`${threadd.id}_lapis`)
              .setEmoji(`1333947469284901005`)
              .setStyle(2),
              new ButtonBuilder()
              .setCustomId(`${threadd.id}_mais`)
              .setEmoji(`1287892723466244259`)
              .setStyle(1),
              new ButtonBuilder()
              .setCustomId(`${threadd.id}_cancelar`)
              .setLabel("Cancelar")
              .setEmoji(`1332714571139649547`)
              .setStyle(4),
              new ButtonBuilder()
              .setCustomId(`${threadd.id}_continuar`)
              .setLabel('Finalizar compra')
              .setEmoji(`1337385917660532746`)
              .setStyle(3)
            )
          ]
        })
        if (interaction.guild.roles.cache.get(srv.get(`${interaction.guild.id}.cargoEquipe`))) {
          await threadd.send({
            content: `<@&${srv.get(`${interaction.guild.id}.cargoEquipe`)}>`
          })
          .then(async msg => {
            setTimeout(async() => {
              await msg.delete()
            }, 2000)
          })
          .catch(e => {})
        }
        await interaction.reply({ content: `\`✅\`・Carrinho criado com sucesso! Acesse aqui: ${threadd}`, flags: 64 })
        
        setTimeout(async() => {
          if (pedidos.has(threadd.id) && pedidos.get(`${threadd.id}.status`) == 'Editando') {
            pedidos.delete(threadd.id)
            await threadd.delete()
          }
        }, 30 * 60 * 1000)
      }
      
      if (interaction.customId.endsWith('_menos')) {
        const carid = interaction.customId.split("_")[0]
        if (pedidos.get(`${carid}.qntd`) == srv.get(`${interaction.guild.id}.pedidoMin`)) {
          await interaction.reply({ content: `\`❌\`・Você atingiu o limite de membros que pode comprar!`, flags: 64 })
          return
        }
        
        interaction.deferUpdate()
        
        pedidos.set(`${carid}.qntd`, parseFloat(pedidos.get(`${carid}.qntd`) - 1))
        pedidos.set(`${carid}.valor`, parseFloat(pedidos.get(`${carid}.qntd`) * srv.get(`${interaction.guild.id}.precoMembro`)))
        EmbedPedido(interaction, interaction.channel)
      }
      
      if (interaction.customId.endsWith("_lapis")) {
        const carid = interaction.customId.split("_")[0]
        const modal = new ModalBuilder()
        .setCustomId(`${carid}_lapis`)
        .setTitle(`Editar quantidade de membros`)
        
        const qnt = new TextInputBuilder()
        .setCustomId(`qnt`)
        .setLabel('Quantidade de membros')
        .setPlaceholder('150')
        .setStyle(1)
        
        modal.addComponents(new ActionRowBuilder().addComponents(qnt))
        
        await interaction.showModal(modal)
      }
      
      if (interaction.customId.endsWith('_mais')) {
        const carid = interaction.customId.split("_")[0]
        if (pedidos.get(`${carid}.qntd`) > 5000) {
          await interaction.reply({ content: `\`❌\`・Você atingiu o limite de membros que pode comprar!`, flags: 64 })
          return
        }
        
        interaction.deferUpdate()
        
        pedidos.set(`${carid}.qntd`, parseFloat(pedidos.get(`${carid}.qntd`) + 1))
        pedidos.set(`${carid}.valor`, parseFloat(pedidos.get(`${carid}.qntd`) * srv.get(`${interaction.guild.id}.precoMembro`)))
        EmbedPedido(interaction, interaction.channel)
      }
      
      if (interaction.customId.endsWith("_cancelar")) {
        const carid = interaction.customId.split("_")[0]
        interaction.deferUpdate()
        pedidos.delete(carid)
        await interaction.message.edit({
          content: `\`✅\` • O carrinho será excluido em 3 segundos!`,
          components: []
        })
        setTimeout(async() => {
          await interaction.channel.delete()
        }, 3000)
      }
      
      if (interaction.customId.endsWith('_continuar')) {
        const carid = interaction.customId.split("_")[0]
        interaction.deferUpdate()
        
        try {
          const login = new MercadoPagoConfig({ accessToken: cfg.get(`access_token`) })
          const payment = new Payment(login)
          
          const payment_data = {
            transaction_amount: parseFloat(pedidos.get(`${carid}.valor`)),
            description: `Compra de membros ${interaction.guild.name} - ${interaction.guild.id}`,
            payment_method_id: `pix`,
            payer: {
              email: `${srv.get(`${interaction.guild.id}.email`) == "undefined" ? "inbizaqfez@gmail.com" : `${srv.get(`${interaction.guild.id}.email`)}`}`
            }
          }
          
          const data = await payment.create({ body: payment_data })
          
          const bufferQrCode = Buffer.from(data.point_of_interaction.transaction_data.qr_code_base64, "base64")
          const qrCodeAttachment = new AttachmentBuilder(bufferQrCode, { name: "payment.png"})
          
          const int = await interaction.message.edit({
            content: `# **Pagamento**\n- Ei, ${interaction.user}, Vamos finalizar o seu pagamento, você pode pagar escaneando o QR-Code ou através do PIX Copia e Cola.\n\n\`📦\`・Produto: *x${pedidos.get(`${carid}.qntd`)} Membro(s)*\n\`💵\`・Valor total: *R$ ${Number(pedidos.get(`${carid}.valor`)).toFixed(2)}*\n\n-# Seu pagamento deve demorar entre 3-15 segundos para ser aprovado. após aprovado, você poderá enviar os membros para seu servidor.\n-# Tempo restante para pagamento: <t:${pedidos.get(`${carid}.tempopagar`)}:R>`,
            components: [
              new ActionRowBuilder()
              .addComponents(
                new ButtonBuilder()
                .setCustomId('copiaecola')
                .setLabel('Pix copia e cola')
                .setEmoji(`1334101401059463230`)
                .setStyle(1),
                new ButtonBuilder()
                .setCustomId('qrcode')
                .setLabel('Pix QR-Code')
                .setEmoji(`1141320238361747526`)
                .setStyle(1)
              ),
              new ActionRowBuilder()
              .addComponents(
                new ButtonBuilder()
               .setCustomId(`${carid}_aprovar`)
               .setLabel("Aprovar compra")
               .setEmoji(`1159217615894495303`)
               .setStyle(3),
                new ButtonBuilder()
               .setCustomId(`${carid}_cancelar`)
               .setLabel("Cancelar")
               .setEmoji(`1332714571139649547`)
               .setStyle(4)
              )
            ]
          })
          
          const interação = int.createMessageComponentCollector({ componentType: ComponentType.Button, });
          interação.on("collect", async (interaction) => {
            if (interaction.user.id != interaction.user.id) {
              return;
            }
            
            if (interaction.customId == 'copiaecola') {
              await interaction.reply({ content: `${data.point_of_interaction.transaction_data.qr_code}`, flags: 64 })
            }
            
            if (interaction.customId == 'qrcode') {
              await interaction.reply({ files: [qrCodeAttachment], flags: 64 })
            }
          })
          
          const checar = setInterval(async() => {
            const payinfo = await payment.get({ id: data.id })
            
            if (payinfo.status == 'approved') {
              clearInterval(checar)
              AprovarPagamento(int, carid)
              pedidos.set(`${carid}.status`, "Aprovado")
            }
          }, 3500)
        } catch (e) {
          await interaction.message.edit({
            content: `\`⚠️\` • Ocorreu um erro ao gerar o pagamento!\n\`❌\` • Erro: \`${e.message} ${e.code}\``,
            components: []
          })
          pedidos.delete(carid)
          setTimeout(async() => {
            await interaction.channel.delete()
          }, 10000)
        }
      }
      
      if (interaction.customId.endsWith('_aprovar')) {
        if (interaction.user.id != cfg.get('owner')) {
          await interaction.reply({ content: `\`❌\` • Apenas o dono pode utilizar esse comando!`, flags: 64 })
          return
        }
        const carid = interaction.customId.split("_")[0]
        
        AprovarPagamento(interaction.message, carid)
        pedidos.set(`${carid}.status`, "Aprovado")
      }
      
      if (interaction.customId.endsWith('_enviarMembros')) {
        const carid = interaction.customId.split("_")[0]
        const modal = new ModalBuilder()
        .setCustomId(`${carid}_enviarMembros`)
        .setTitle(`Enviar membros`)
        
        const link = new TextInputBuilder()
        .setCustomId('link')
        .setLabel('LINK DE CONVITE DO SERVIDOR')
        .setPlaceholder('Coloque o link de convite do servidor')
        .setStyle(1)
        
        modal.addComponents(new ActionRowBuilder().addComponents(link))
        
        await interaction.showModal(modal)
      }
    }
    
    
    if (interaction.isModalSubmit()) {
      if (interaction.customId.endsWith('_lapis')) {
        const qnt = interaction.fields.getTextInputValue('qnt')
        const carid = interaction.customId.split("_")[0]
        
        if (isNaN(qnt)) {
          await interaction.reply({ content: `\`❌\` • Quantidade invalida!`, flags: 64 })
          return
        }
        
        if (Number(qnt) > 5000 || Number(qnt) < srv.get(`${interaction.guild.id}.pedidoMin`)) {
          await interaction.reply({ content: `\`❌\` • Você só pode comprar entre ${srv.get(`${interaction.guild.id}.pedidoMin`)} à 5000 membros!`, flags: 64 })
          return
        }
        
        pedidos.set(`${carid}.qntd`, parseFloat(qnt))
        pedidos.set(`${carid}.valor`, parseFloat(pedidos.get(`${carid}.qntd`) * srv.get(`${interaction.guild.id}.precoMembro`)))
        EmbedPedido(interaction, interaction.channel)
        await interaction.reply({ content: `\`✅\` • Quantidade alterada com sucesso!`, flags: 64 })
      }
      
      if (interaction.customId.endsWith('_enviarMembros')) {
        const carid = interaction.customId.split("_")[0]
        const serve = interaction.fields.getTextInputValue("link")
        
        if (!serve.startsWith('https://discord.gg')) {
          await interaction.reply({ content: `\`❌\` • Servidor não encontrado!`, flags: 64 })
          return
        }
        
        const inbiza = await axios.post('https://hiperseguidores.com.br/api/v2', {
          key: cfg.get('key_hyper'),
          action: 'add',
          service: 472,
          link: serve,
          quantity: Number(pedidos.get(`${carid}.qntd`))
        })
        
        await interaction.message.edit({
          content: `\`✅\` • Seus membros foram enviados com sucesso!\n-# \`⚠️\` • Utilize o comando /pedidos para ver o andamento`,
          components: []
        })
        pedidos.set(`${carid}.order`, inbiza.data.order ? inbiza.data.order : "undefined")
        
        await interaction.reply({ content: `\`✅\` • Seu pedido foi enviado com sucesso!`, flags: 64 })
        
        setTimeout(async() => {
          await interaction.channel.delete()
        }, 15000)
        
        const diasDaSemana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta']
        const hoje = new Date()
        const diaDaSemana = diasDaSemana[hoje.getDay()]
        
        srv.add(`${interaction.guild.id}.estatisticas.${diaDaSemana}`, parseFloat(pedidos.get(`${carid}.valor`) * 0.5))
        srv.add(`${interaction.guild.id}.saldo`, parseFloat(pedidos.get(`${carid}.valor`) * 0.5))
        
        try {
          await axios.post(`${srv.get(`${interaction.guild.id}.webhook`)}`, {
            username: `Revenda de M3mbros`,
            embeds: [{
              title: `\`✅\` • Nova compra aprovada!`,
              description: `\`💵\` • Valor: \`R$ ${Number(pedidos.get(`${carid}.valor`)).toFixed(2)}\`\n\`📦\` • Quantidade: ${pedidos.get(`${carid}.qntd`)}\n\n-# Valor pago: R$ ${Number(pedidos.get(`${carid}.valor`)).toFixed(2)}\n-# Comissão recebida: R$ ${Number(pedidos.get(`${carid}.valor`)) * 0.5}`,
              footer: {
                text: `Servidor ${interaction.guild.name} - ${interaction.guild.id}`
              }
            }]
          })
        } catch (e) {
          
        }
        
        const role = interaction.guild.roles.cache.get(srv.get(`${interaction.guild.id}.cargoCliente`))
        const member = interaction.guild.members.cache.get(interaction.user.id)
        
        try {
          await member.roles.add(role)
        } catch (e) {
          
        }
        
        try {
          await interaction.user.send({
            embeds: [
              new EmbedBuilder()
              .setAuthor({ name: "Pedido Realizado" })
              .setDescription(`- Olá *${interaction.user.username}*, seu pedido foi realizado com sucesso!`)
              .addFields([
                {
                  name: `Número do Pedido`,
                  value: `\`${carid}\``
                },
                {
                  name: `Total de Membros`,
                  value: `\`${pedidos.get(`${carid}.qntd`)} membros\``
                },
                {
                  name: `Tempo do Pedido`,
                  value: `<t:${Math.floor(Date.now() / 1000)}:R>`
                },
                {
                  name: `Servidor de Entrega`,
                  value: `${serve}`
                }
              ])
              .setColor("Green")
            ]
          })
        } catch (e) {
          
        }
      }
    }
    
    
    async function EmbedPedido(interaction, threadd) {
      await interaction.message.edit({
        content: `# **Carrinho • M3mbros Mistos**\n- Olá ${interaction.user}! Aqui estão as informações de seu carrinho\n\n\`💵\`・Preço total: \`R$ ${Number(pedidos.get(`${threadd.id}.valor`)).toFixed(2)}\`\n\`👥\`・Quantidade de Membros: \`x${pedidos.get(`${threadd.id}.qntd`)}\`\n\n\`⏳\`・Tempo restante para deletar o carrinho: <t:${pedidos.get(`${threadd.id}.tempopagar`)}:R>\n\n> -# Entrega 100% automatica, garantida e segura! com melhor preço do mercado.`,
        components: [
          new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
            .setCustomId(`${threadd.id}_menos`)
            .setEmoji(`1337385790543630376`)
            .setStyle(4),
            new ButtonBuilder()
            .setCustomId(`${threadd.id}_lapis`)
            .setEmoji(`1333947469284901005`)
            .setStyle(2),
            new ButtonBuilder()
            .setCustomId(`${threadd.id}_mais`)
            .setEmoji(`1287892723466244259`)
            .setStyle(1),
            new ButtonBuilder()
            .setCustomId(`${threadd.id}_cancelar`)
            .setLabel("Cancelar")
            .setEmoji(`1332714571139649547`)
            .setStyle(4),
            new ButtonBuilder()
            .setCustomId(`${threadd.id}_continuar`)
            .setLabel('Finalizar compra')
            .setEmoji(`1337385917660532746`)
            .setStyle(3)
          )
        ]
      })
    }
    
    async function AprovarPagamento(int, carid) {
      await int.edit({
        content: `# 🎉 **Pagamento Aprovado**\n- **Eii ${interaction.user} Seu pagamento foi aprovado com sucesso!**\n\n> - Para receber seus membros clique no botão \'Adicionar BOT\' e adicione ele no seu servidor\n> - Após adicionado, clique em \'Enviar membros\' e informe o link de convite do servidor\n> - **NÃO** remova o bot do seu servidor antes de concluir a entrega ou você poderá perder seus membros.\n\n-# \`⚠️\` Após enviado, você poderá usar o comando /pedidos para ver o andamento`,
        components: [
          new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
            .setCustomId(`${carid}_enviarMembros`)
            .setLabel('Enviar membros')
            .setStyle(1),
            new ButtonBuilder()
            .setURL('https://discord.com/oauth2/authorize?client_id=535936517051252757&permissions=1&scope=bot')
            .setLabel('Adicionar BOT')
            .setStyle(5)
         )
        ]
      })
    }
  }
}
/* inbiza */
// inbiza
/* inbiza */
// inbiza