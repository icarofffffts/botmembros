const { ActionRowBuilder, ButtonBuilder, EmbedBuilder, ModalBuilder, TextInputBuilder, AttachmentBuilder, ChannelSelectMenuBuilder, ChannelType, StringSelectMenuBuilder, ButtonStyle } = require("discord.js")
const { srv, cfg, pedidos } = require("../../../src/db/index.js")
const fs = require("fs")
const axios = require("axios")
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

module.exports = {
  name: "interactionCreate",
  run: async(interaction) => {
    const { client, customId } = interaction
    
    if (interaction.isButton()) {
      
      if (customId == 'estatisticas') {
        const e = await interaction.update({ content: `\`🔄\` • Carregando...`, components: []  })
        
        const target = srv.get(interaction.guild.id)
        
        const vendas = [
          { dia: "Segunda", valor: parseFloat(target.estatisticas.Segunda) },
          { dia: "Terça", valor: parseFloat(target.estatisticas.Terça) },
          { dia: "Quarta", valor: parseFloat(target.estatisticas.Quarta) },
          { dia: "Quinta", valor: parseFloat(target.estatisticas.Quinta) },
          { dia: "Sexta", valor: parseFloat(target.estatisticas.Sexta) },
        ]
        
        await e.edit({
          content: `# **Estatísticas do Servidor**\n- Aqui vocé poderá ver as estatisticas de vendas do servidor \`${interaction.guild.name}\`\n  - Saldo atual: \`R$ ${Number(target.saldo).toFixed(2)}\`\n\n\`📊\` Abaixo estão as vendas dos últimos 5 dias:\n\n` +
                   vendas.map(v => `- ${v.dia}: R$ ${v.valor.toFixed(2)}`).join('\n'),
          components: [
            new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
               .setCustomId('saque')
               .setLabel('Sistema de saque')
               .setEmoji('💰')
               .setStyle(2),
              new ButtonBuilder()
               .setCustomId('attPainel3')
               .setLabel('Atualizar painel')
               .setEmoji('🔄')
               .setStyle(2),
              new ButtonBuilder()
               .setCustomId('voltar')
               .setLabel('Voltar')
               .setEmoji('⬅️')
               .setStyle(2),
            )
          ]
        })
      }
      
      if (customId == 'cfgPrecoECargo') {
        const modal = new ModalBuilder()
        .setCustomId('cfgPrecoECargo')
        .setTitle('Configuração de preços e cargos')
        
        const preco = new TextInputBuilder()
        .setCustomId('preco')
        .setLabel("PREÇO POR MEMBRO")
        .setPlaceholder('Valor minimo: 0.02')
        .setStyle(1)
        
        const cargoequipe = new TextInputBuilder()
        .setCustomId('cargoequipe')
        .setLabel("CARGO DE EQUIPE")
        .setPlaceholder('Digite o id do cargo da equipe')
        .setRequired(false)
        .setStyle(1)
        
        const cargocliente = new TextInputBuilder()
        .setCustomId('cargocliente')
        .setLabel("CARGO DE CLIENTE")
        .setPlaceholder('Digite o id do cargo de cliente')
        .setRequired(false)
        .setStyle(1)
        
        modal.addComponents(new ActionRowBuilder().addComponents(preco), new ActionRowBuilder().addComponents(cargoequipe), new ActionRowBuilder().addComponents(cargocliente))
        
        await interaction.showModal(modal)
      }
      
      if (customId == 'cfgMsg') {
        await interaction.update({
          components: [
            new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
              .setCustomId('cfgMsg2')
              .setLabel('Configurar mensagem')
              .setEmoji('1377570209329840259')
              .setStyle(1),
              new ButtonBuilder()
              .setCustomId('previewMsg')
              .setLabel('Preview Mensagem')
              .setEmoji('1365488730445451366')
              .setStyle(1),
              new ButtonBuilder()
              .setCustomId('enviarMsg')
              .setLabel('Enviar mensagem')
              .setEmoji('1217113831927713982')
              .setStyle(1)
            ),
            new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
              .setCustomId('sicronizarMsg')
              .setLabel('Sicronizar mensagem')
              .setEmoji('1299588201685717153')
              .setStyle(2),
              new ButtonBuilder()
              .setCustomId('attPainel2')
              .setLabel('Atualizar esse painel')
              .setEmoji('1299588201685717153')
              .setStyle(2),
              new ButtonBuilder()
              .setCustomId('voltar')
              .setLabel('Voltar')
              .setEmoji('1377565541807558747')
              .setStyle(2)
            )
          ]
        })
      }
      
      if (customId == 'cfgAvancada') {
        if (interaction.guild.ownerId != interaction.user.id) {
          await interaction.reply({ content: `\`❌\` • Apenas o dono do servidor!`, flags: 64 })
          return
        }
        
        await interaction.update({
          components: [
            new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
              .setCustomId('addRevendedor')
              .setLabel('Adicionar revendedor')
              .setEmoji('➕')
              .setStyle(1),
              new ButtonBuilder()
              .setCustomId('delRevendedor')
              .setLabel('Remover revendedor')
              .setEmoji('➖')
              .setStyle(1),
              new ButtonBuilder()
              .setCustomId('cfgWebhook')
              .setLabel('Configurar Webhook')
              .setEmoji('1377570209329840259')
              .setStyle(1)
            ),
            new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
              .setCustomId('onOffVendas')
              .setLabel(`${srv.get(`${interaction.guild.id}.vendas`) == 'ON' ? 'Desativar vendas' : 'Ativar vendas'}`)
              .setEmoji('1377570209329840259')
              .setStyle(`${srv.get(`${interaction.guild.id}.vendas`) == 'ON' ? 4 : 3}`),
              new ButtonBuilder()
              .setCustomId('altEmail')
              .setLabel('Alterar email')
              .setEmoji('1377570209329840259')
              .setStyle(2),
              new ButtonBuilder()
              .setCustomId('attPainel4')
              .setLabel('Atualizar esse painel')
              .setEmoji('1299588201685717153')
              .setStyle(2),
              new ButtonBuilder()
              .setCustomId('voltar')
              .setLabel('Voltar')
              .setEmoji('1377565541807558747')
              .setStyle(2)
            )
          ]
        })
      }
      
      if (customId == 'excluirServe') {
        const modal = new ModalBuilder()
        .setCustomId('excluirServe')
        .setTitle('Excluir Servidor')
        
        const id = new TextInputBuilder()
        .setCustomId('confirm')
        .setLabel('DESEJA MESMO EXCLUIR?')
        .setPlaceholder('SIM')
        .setStyle(1)
        
        modal.addComponents(new ActionRowBuilder().addComponents(id))
        
        await interaction.showModal(modal)
      }
      
      if (customId == 'addRevendedor') {
        const modal = new ModalBuilder()
        .setCustomId('addRevendedor')
        .setTitle('Adicionar revendedor')
        
        const id = new TextInputBuilder()
        .setCustomId('userid')
        .setLabel('ID DO USUARIO')
        .setPlaceholder('Coloque o ID do usuario')
        .setStyle(1)
        
        modal.addComponents(new ActionRowBuilder().addComponents(id))
        
        await interaction.showModal(modal)
      }
      
      if (customId == 'delRevendedor') {
        const modal = new ModalBuilder()
        .setCustomId('delRevendedor')
        .setTitle('Remover revendedor')
        
        const id = new TextInputBuilder()
        .setCustomId('userid')
        .setLabel('ID DO USUARIO')
        .setPlaceholder('Coloque o ID do usuario')
        .setStyle(1)
        
        modal.addComponents(new ActionRowBuilder().addComponents(id))
        
        await interaction.showModal(modal)
      }
      
      if (customId == 'cfgWebhook') {
        const modal = new ModalBuilder()
        .setCustomId('cfgWebhook')
        .setTitle('Configurar Webhook')
        
        const id = new TextInputBuilder()
        .setCustomId('webhook')
        .setLabel('WEBHOOK')
        .setPlaceholder('Coloque a webhook')
        .setStyle(1)
        
        modal.addComponents(new ActionRowBuilder().addComponents(id))
        
        await interaction.showModal(modal)
      }
      
      if (customId == 'altEmail') {
        const modal = new ModalBuilder()
        .setCustomId('altEmail')
        .setTitle('Alterar email')
        
        const id = new TextInputBuilder()
        .setCustomId('email')
        .setLabel('EMAIL')
        .setPlaceholder('exemplo@gmail.com')
        .setStyle(1)
        
        modal.addComponents(new ActionRowBuilder().addComponents(id))
        
        await interaction.showModal(modal)
      }
      
      if (customId == 'onOffVendas') {
        if (srv.get(`${interaction.guild.id}.vendas`) == "ON") {
          srv.set(`${interaction.guild.id}.vendas`, "OFF")
        } else if (srv.get(`${interaction.guild.id}.vendas`) == "OFF") {
          srv.set(`${interaction.guild.id}.vendas`, "ON")
        }
        
        EmbedAvancadas()
      }
      
      if (customId == 'cfgMsg2') {
        const modal = new ModalBuilder()
        .setCustomId('cfgMsg2')
        .setTitle('Configuração da mensagem')
        
        const tit = new TextInputBuilder()
        .setCustomId("title")
        .setLabel("TITULO DA EMBED")
        .setValue(`${srv.get(`${interaction.guild.id}.mensagem.embed.title`)}`)
        .setStyle(1)
        
        const desc = new TextInputBuilder()
        .setCustomId("desc")
        .setLabel("DESCRIÇÃO DA EMBED")
        .setValue(`${srv.get(`${interaction.guild.id}.mensagem.embed.desc`)}`)
        .setStyle(2)
        
        const txtbtn = new TextInputBuilder()
        .setCustomId("txtbtn")
        .setLabel("TEXTO DO BOTÃO")
        .setValue(`${srv.get(`${interaction.guild.id}.mensagem.botao.label`)}`)
        .setStyle(1)
        
        const img = new TextInputBuilder()
        .setCustomId("img")
        .setLabel("BANNER DA EMBED (OPCIONAL)")
        .setValue(`${srv.get(`${interaction.guild.id}.mensagem.embed.banner`)}`)
        .setRequired(false)
        .setStyle(1)
        
        modal.addComponents(new ActionRowBuilder().addComponents(tit), new ActionRowBuilder().addComponents(desc), new ActionRowBuilder().addComponents(txtbtn), new ActionRowBuilder().addComponents(img))
        
        await interaction.showModal(modal)
      }
      
      if (customId == 'enviarMsg') {
        await interaction.update({
          content: `# **Enviar mensagem vendas**\n- Selecione o canal para enviar a mensagem de vendas`,
          components: [
            new ActionRowBuilder()
            .addComponents(
              new ChannelSelectMenuBuilder()
              .setCustomId('canalEnv')
              .setPlaceholder("Selecione o canal")
              .setMinValues(1)
              .setMaxValues(1)
              .setChannelTypes(ChannelType.GuildText)
            ),
            new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
              .setCustomId('voltar')
              .setLabel('Voltar')
              .setEmoji('1377565541807558747')
              .setStyle(2)
            )
          ]
        })
      }
      
      if (customId == 'previewMsg') {
        const inbiza = srv.get(`${interaction.guild.id}.mensagem.embed`)
        const inbizaa = srv.get(`${interaction.guild.id}.mensagem.botao`)
        
        const embed = new EmbedBuilder()
        .setTitle(`${inbiza.title}`)
        .setDescription(`${inbiza.desc}`)
        .setColor(`#469dff`)
        .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL({ dynamic: true, format: 'png' }) })
        .setTimestamp()
        
        if (inbiza.banner.startsWith('https://')) embed.setImage(inbiza.banner)
        
        const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
          .setCustomId('abcdfghi')
          .setLabel(`${inbizaa.label}`)
          .setEmoji(`${inbizaa.emoji}`)
          .setStyle(`${inbizaa.cor}`)
          .setDisabled(true)
        )
        
        await interaction.reply({
          embeds: [embed],
          components: [row],
          flags: 64
        })
      }
      
      if (customId == 'sicronizarMsg') {
        const inbiza = srv.get(`${interaction.guild.id}.mensagem.embed`)
        const inbizaa = srv.get(`${interaction.guild.id}.mensagem.botao`)
        
        const embed = new EmbedBuilder()
        .setTitle(`${inbiza.title}`)
        .setDescription(`${inbiza.desc}`)
        .setColor(`#469dff`)
        .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL({ dynamic: true, format: 'png' }) })
        .setTimestamp()
        
        if (inbiza.banner.startsWith('https://')) embed.setImage(inbiza.banner)
        
        const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
          .setCustomId('comprar_membros')
          .setLabel(`${inbizaa.label}`)
          .setEmoji(`${inbizaa.emoji}`)
          .setStyle(`${inbizaa.cor}`)
        )
        
        try {
          const canal = interaction.guild.channels.cache.get(srv.get(`${interaction.guild.id}.mensagem_env.canalid`))
          const msg = await canal.messages.fetch(srv.get(`${interaction.guild.id}.mensagem_env.msgid`))
          
          await msg.edit({
            embeds: [embed],
            components: [row]
          })
          
          await interaction.reply({ content: `\`✅\` • Mensagem sicronizada com sucesso!`, flags: 64 })
        } catch (e) {
          await interaction.reply({ content: `\`⚠️\` • Erro ao sicronizar a mensagem\n\`❌\` • Erro: \`${e.message} ${e.code}\``, flags: 64 })
        }
      }
      
      if (customId == 'saque') {
        await interaction.update({
          content: `# **Sistema de Saque**\n- Aqui você poderá visualizar as solicitações de saque e realizar ações sobre elas\n  - Saldo atual: \`R$ ${Number(srv.get(`${interaction.guild.id}.saldo`)).toFixed(2)}\`\n\n- **Requisitos para sacar:**\n  - Valor minimo: \`R$ 20.00\`\n  - Tempo de cooldown: \`4 dias\``,
          components: [
            new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
              .setCustomId('solicitarSaque')
              .setLabel('Solicitar saque')
              .setEmoji('💰')
              .setStyle(1),
              new ButtonBuilder()
              .setCustomId('attPainel5')
              .setLabel('Atualizar painel')
              .setEmoji('🔄')
              .setStyle(2),
              new ButtonBuilder()
              .setCustomId('estatisticas')
              .setLabel('Voltar')
              .setEmoji('⬅️')
              .setStyle(2),
            )
          ],
          files: []
        })
      }
      
      if (customId == 'solicitarSaque') {
        if (srv.get(`${interaction.guild.id}.saquePendente`) === 'sim') {
          await interaction.reply({ content: `\`❌\` • Esse servidor ainda está em cooldown!`, flags: 64 })
          return
        }
        
        const modal = new ModalBuilder()
        .setCustomId('solicitarSaque')
        .setTitle('Solicitar saque')
        
        const valor = new TextInputBuilder()
        .setCustomId('valor')
        .setLabel('VALOR')
        .setPlaceholder('10')
        .setStyle(1)
        
        const chavepix = new TextInputBuilder()
        .setCustomId('chavepix')
        .setLabel('CHAVE PIX')
        .setPlaceholder('Chave pix do recebedor')
        .setStyle(1)
        
        modal.addComponents(new ActionRowBuilder().addComponents(valor), new ActionRowBuilder().addComponents(chavepix))
        
        await interaction.showModal(modal)
      }
      
      if (customId.endsWith('_confirmenvio')) {
        const serverid = interaction.customId.split("_")[0]
        interaction.deferUpdate()
        try {
          const user = await client.users.fetch(srv.get(`${serverid}.userSaque`))
          
          srv.set(`${serverid}.saldo`, parseFloat(srv.get(`${serverid}.saldo`) - srv.get(`${serverid}.saqueValor`)))
          await user.send({
            content: `# **Sistema de saque**\n- Olá ${interaction.user}, o seu saque foi aprovado!\n\n-# Recomendamos que verifique.\n-# Caso tenha problemas, entre em contato com o suporte!`,
            components: [
            new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
              .setCustomId('ahdhdh')
              .setLabel('Pagamento confirmado')
              .setDisabled(true)
              .setStyle(3)
            )
           ]
          })
        } catch (e) {
          
        }
        
        srv.set(`${interaction.guild.id}.saquePendente`, "nao")
        srv.delete(`${interaction.guild.id}.userSaque`)
        await interaction.message.edit({
          components: [
            new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
              .setCustomId('ahdhdh')
              .setLabel('Pagamento confirmado')
              .setDisabled(true)
              .setStyle(3)
            )
          ]
        })
      }
      
      if (customId == 'attPainel5') {
        await interaction.update({
          content: `# **Sistema de Saque**\n- Aqui você poderá visualizar as solicitações de saque e realizar ações sobre elas\n  - Saldo atual: \`R$ ${Number(srv.get(`${interaction.guild.id}.saldo`)).toFixed(2)}\`\n\n- **Requisitos para sacar:**\n  - Valor minimo: \`R$ 20.00\`\n  - Tempo de cooldown: \`4 dias\``
        })
      }
      
      if (customId == 'attPainel') {
        AttEmbed()
      }
      
      if (customId == 'attPainel2') {
        EmbedMensagem()
      }
      
      if (customId == 'attPainel4') {
        EmbedAvancadas()
      }
      
      if (customId == 'attPainel3') {
        EmbedEstatisticas()
      }
      
      if (customId == 'voltar') {
        AttEmbed()
      }
      
      if (customId == 'voltarPedidos') {
        const filtro = pedidos.all().filter(x => x.data.guildid == interaction.guild.id && x.data.userid == interaction.user.id && x.data.status == "Aprovado")

        if (!filtro.length) {
          await interaction.update({
            content: `\`\` • Você não possui nenhum pedido!`, components: [], flags: 64
          })
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

        await interaction.update({
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
    
    
    if (interaction.isModalSubmit()) {
      if (customId == 'cfgPrecoECargo') {
        const preco = interaction.fields.getTextInputValue("preco")
        const cargoe = interaction.fields.getTextInputValue("cargoequipe") || null
        const cargoc = interaction.fields.getTextInputValue("cargocliente") || null
        
        if (cargoe != null && !interaction.guild.roles.cache.get(cargoe)) {
          await interaction.reply({ content: `\`❌\` • Cargo de equipe não encontrado!`, flags: 64 })
          return
        }
        
        if (cargoc != null && !interaction.guild.roles.cache.get(cargoc)) {
          await interaction.reply({ content: `\`❌\` • Cargo de cliente não encontrado!`, flags: 64 })
          return
        }
        
        if (Number(preco) < 0.02 || Number(preco) > 0.10 || isNaN(preco)) {
          if (isNaN(preco)) {
            await interaction.reply({ content: `\`❌\` • Você informou um número invalido.`, flags: 64 })
          } else {
            await interaction.reply({ content: `${Number(preco) < 0.02 ? `\`❌\` • O valor minimo é \`R$ 0.02\`` : `\`❌\` • O valor maximo é \`R$ 0.10\``}`, flags: 64 })
          }
          return
        }
        
        
        srv.set(`${interaction.guild.id}.precoMembro`, parseFloat(preco))
        if (cargoe != null) {
          srv.set(`${interaction.guild.id}.cargoEquipe`, cargoe)
        }
        if (cargoc != null) {
          srv.set(`${interaction.guild.id}.cargoCliente`, cargoc)
        }
        AttEmbed()
      }
      
      if (customId == 'cfgMsg2') {
        const title = interaction.fields.getTextInputValue("title")
        const desc = interaction.fields.getTextInputValue("desc")
        const txtbtn = interaction.fields.getTextInputValue("txtbtn")
        const img = interaction.fields.getTextInputValue("img") || null
        
        if (img != null && !img.startsWith('https://')) {
          await interaction.reply({ content: `\`❌\` • Você informou um banner invalido!`, flags: 64 })
          return
        }
        
        srv.set(`${interaction.guild.id}.mensagem.embed.title`, title)
        srv.set(`${interaction.guild.id}.mensagem.embed.desc`, desc)
        srv.set(`${interaction.guild.id}.mensagem.botao.label`, txtbtn)
        if (img != null) srv.set(`${interaction.guild.id}.mensagem.embed.banner`, img)
        await interaction.reply({ content: `\`✅\` • Configurações da embed atualizada com sucesso!`, flags: 64 })
      }
      
      if (customId == 'addRevendedor') {
        const userid = interaction.fields.getTextInputValue('userid')
        
        if (!interaction.guild.members.cache.get(userid)) {
          await interaction.reply({ content: `\`❌\` • Usuario não encontrado!`, flags: 64 })
          return
        }
        
        if (srv.get(`${interaction.guild.id}.perms`).includes(userid)) {
          await interaction.reply({ content: `\`❌\` • Esse usuario já está na lista de revendedores!`, flags: 64 })
          return
        }
        
        srv.push(`${interaction.guild.id}.perms`, userid)
        EmbedAvancadas()
      }
      
      if (customId == 'delRevendedor') {
        const userid = interaction.fields.getTextInputValue('userid')
        
        if (!srv.get(`${interaction.guild.id}.perms`).includes(userid)) {
          await interaction.reply({ content: `\`❌\` • Esse usuario não está na lista de revendedores!`, flags: 64 })
          return
        }
        
        srv.pull(`${interaction.guild.id}.perms`, (element) => element == userid)
        EmbedAvancadas()
      }
      
      if (customId == 'cfgWebhook') {
        const web = interaction.fields.getTextInputValue('webhook')
        
        if (!web.startsWith('https://')) {
          await interaction.reply({ content: `\`❌\` • Webhook invalida!`, flags: 64 })
          return
        }
        
        srv.set(`${interaction.guild.id}.webhook`, web)
        EmbedAvancadas()
      }
      
      if (customId == 'altEmail') {
        const email = interaction.fields.getTextInputValue('email')
        
        if (!email.includes('@gmail.com')) {
          await interaction.reply({ content: `\`❌\` • Email invalido!`, flags: 64 })
          return
        }
        
        srv.set(`${interaction.guild.id}.email`, email)
        EmbedAvancadas()
      }
      
      if (customId == 'excluirServe') {
        const confirm = interaction.fields.getTextInputValue('confirm')
        
        if (confirm != 'SIM') {
          await interaction.reply({ content: `\`✅\` • Acão cancelada!`, flags: 64 })
          return
        }
        
        srv.delete(interaction.guild.id)
        interaction.update({
          content: `\`⚠️\` • Esse servidor foi excluido do nosso sistema!`,
          embeds: [],
          components: []
        })
      }
      
      if (customId == 'solicitarSaque') {
        const valor = interaction.fields.getTextInputValue("valor")
        const chavepix = interaction.fields.getTextInputValue("chavepix")
        
        if (isNaN(valor)) {
          await interaction.reply({ content: `\`❌\` • Valor invalido!`, flags: 64 })
          return
        }
        
        if (Number(valor) < 10 || Number(valor) > 100) {
          await interaction.reply({ content: `\`❌\` • Valor minimo de saque \`R$ 10.00\` valor maximo \`R$ 100.00\`!`, flags: 64 })
          return
        }
        
        if (srv.get(`${interaction.guild.id}.saldo`) < Number(valor)) {
          await interaction.reply({ content: `\`❌\` • Saldo insuficiente!`, flags: 64 })
          return
        }
        
        const tempoPagar = Date.now() + 4 * 24 * 60 * 60 * 1000
        const tempoFormado = Math.floor(tempoPagar / 1000)
        srv.set(`${interaction.guild.id}.saquePendente`, "sim")
        srv.set(`${interaction.guild.id}.cooldownSaque`, tempoFormado)
        srv.set(`${interaction.guild.id}.userSaque`, interaction.user.id)
        srv.set(`${interaction.guild.id}.saqueValor`, Number(valor))
        await interaction.reply({ content: `\`✅\` • Sua solicitação de saque foi enviada com sucesso!\n-# Iremos avisar em sua dm sobre as demais informações!\n-# Não se esqueça de abrir sua DM.`, flags: 64 })
        
        try {
          const logs = await client.channels.fetch(cfg.get('canal_logs_saque'))
          
          await logs?.send({
            content: `@everyone\n# **Sistema de saque**\n- Recebemos uma solicitação de saque\n  - Valor: \`${Number(valor).toFixed(2)}\`\n  - Chave pix: \`${chavepix}\``,
            components: [
              new ActionRowBuilder()
              .addComponents(
                new ButtonBuilder()
                .setCustomId(`${interaction.guild.id}_confirmenvio`)
                .setLabel('Confirmar envio')
                .setStyle(3)
              )
            ]
          })
        } catch (e) {
          
        }
      }
    }
    
    
    if (interaction.isChannelSelectMenu()) {
      if (customId == 'canalEnv') {
        const canal = interaction.guild.channels.cache.get(interaction.values[0])
        
        const inbiza = srv.get(`${interaction.guild.id}.mensagem.embed`)
        const inbizaa = srv.get(`${interaction.guild.id}.mensagem.botao`)
        
        const embed = new EmbedBuilder()
        .setTitle(`${inbiza.title}`)
        .setDescription(`${inbiza.desc}`)
        .setColor(`#469dff`)
        .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL({ dynamic: true, format: 'png' }) })
        .setTimestamp()
        
        if (inbiza.banner.startsWith('https://')) embed.setImage(inbiza.banner)
        
        const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
          .setCustomId('comprar_membros')
          .setLabel(`${inbizaa.label}`)
          .setEmoji(`${inbizaa.emoji}`)
          .setStyle(`${inbizaa.cor}`)
        )
        
        const msg = await canal?.send({
          embeds: [embed],
          components: [row]
        })
        
        srv.set(`${interaction.guild.id}.msgEnviada`, 'sim')
        srv.set(`${interaction.guild.id}.mensagem_env.canalid`, canal.id)
        srv.set(`${interaction.guild.id}.mensagem_env.msgid`, msg.id)
        EmbedMensagem()
        
        //await interaction.followUp({ content: `\`\` • Mensagem enviada no canal ${canal}`, flags: 64 })
      }
    }
    
    
    if (interaction.isStringSelectMenu()) {
      // sistema de ver pedidos
      if (customId == 'verPedidos') {
        const id = interaction.values[0].split("_")[0]
        
        const e = await interaction.update({
          content: `Carregando...`,
          components: []
        })
        
        const r = await axios.post('https://hiperseguidores.com.br/api/v2', {
          key: cfg.get('key_hyper'),
          action: 'status',
          order: pedidos.get(`${id}.order`)
        })
        
        await e.edit({
          content: `# ID \`${id}\`\n- Servidor Comprado: \`${interaction.guild.id}\`\n- Valor do Pedido: \`R$ ${Number(pedidos.get(`${id}.valor`)).toFixed(2)}\`\n- Membros Adquiridos: \`${pedidos.get(`${id}.qntd`)}\`\n- Status da Entrega: \`${r.data?.status == 'In progress' ? '🟠 Em progresso' : '🟢 Finalizado com sucesso'}\``,
          components: [
            new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
              .setCustomId('voltarPedidos')
              .setLabel('Voltar')
              .setEmoji('⬅️')
              .setStyle(1)
            )
          ]
        })
      }
    }
    
    
    async function AttEmbed() {
      const pp = srv.get(interaction.guild.id)
      await interaction.update({
        content: `# **Configurações do servidor**\n- Aqui você poderá configurar a mensagem, preços e outras opções relacionadas a venda de membros no servidor \`${interaction.guild.name}\`\n  - Saldo atual: \`R$ ${Number(pp.saldo).toFixed(2)}\`\n\n- **Configurações atuais:**\n  - Vendas: \`${pp.vendas == "ON" ? "🟢 Ativa": "🔴 Não ativa"}\`\n  - Pedido mínimo: \`${pp.pedidoMin}\`\n  - Preço por membro \`R$ ${Number(pp.precoMembro).toFixed(2)} (R$ ${Number(pp.precoMembro) * 100} a cada 100)\`\n  - Comissão: \`50%\`\n  - Cargo de equipe: ${interaction.guild.roles.cache.get(pp.cargoEquipe) || "\`Não possui\`"}\n  - Cargo de cliente: ${interaction.guild.roles.cache.get(pp.cargoCliente) || "\`Não possui\`"}\n  - Email: \`${pp.email == "undefined" ? "Não definido": pp.email}\`\n\n- **Usuários com permissão:**\n  - ${pp.perms.length ? pp.perms.map(x => `<@${x}>`).join("\n"): `\`Nenhum configurado ainda\``}\n\n${pp.webhook == "undefined" ? "-# • \`⚠️\` • O Webhook não foi configurado. sem ele você não receberá notificação de vendas!": ""}\n${pp.msgEnviada == "nao" ? "-# • \`⚠️\` • A mensagem de vendas não foi enviada ainda.": ""}`,
        components: [
        new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
          .setCustomId('estatisticas')
          .setLabel("Estatísticas")
          .setEmoji('💰')
          .setStyle(1),
          new ButtonBuilder()
          .setCustomId('cfgPrecoECargo')
          .setLabel("Configurar preços/cargos")
          .setEmoji('🔄')
          .setStyle(1),
          new ButtonBuilder()
          .setCustomId('cfgMsg')
          .setLabel("Configurar mensagem")
          .setEmoji('🔄')
          .setStyle(1)
        ),
        new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
          .setCustomId('cfgAvancada')
          .setLabel("Configucões avançadas")
          .setEmoji('🔄')
          .setStyle(2),
          new ButtonBuilder()
          .setCustomId('excluirServe')
          .setLabel("Excluir servidor")
          .setEmoji('🔄')
          .setStyle(4),
          new ButtonBuilder()
          .setCustomId('attPainel')
          .setLabel("Atualizar esse painel")
          .setEmoji('🔄')
          .setStyle(2)
        )
        ],
        files: [],
        flags: 64
      })
    }
    
    async function EmbedEstatisticas() {
      try {
        const e = await interaction.update({
          content: `\`🔄\` • Carregando...`, components: []
        })

        const target = srv.get(interaction.guild.id)

        const vendas = [{
          dia: "Segunda",
          valor: parseFloat(target.estatisticas.Segunda)
        },
          {
            dia: "Terça",
            valor: parseFloat(target.estatisticas.Terça)
          },
          {
            dia: "Quarta",
            valor: parseFloat(target.estatisticas.Quarta)
          },
          {
            dia: "Quinta",
            valor: parseFloat(target.estatisticas.Quinta)
          },
          {
            dia: "Sexta",
            valor: parseFloat(target.estatisticas.Sexta)
          },
        ]

        const grafico = await gerarGrafico(vendas)

        await e.edit({
          content: `# **Estatísticas do Servidor**\n- Aqui vocé poderá ver as estatisticas de vendas do servidor \`${interaction.guild.name}\`\n  - Saldo atual: \`R$ ${Number(target.saldo).toFixed(2)}\`\n\n\`📊\` O gráfico abaixo representa as vendas dos últimos 5 dias`,
          files: [grafico],
          components: [
            new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
              .setCustomId('saque')
              .setLabel('Sistema de saque')
              .setEmoji('💰')
              .setStyle(2),
              new ButtonBuilder()
              .setCustomId('attPainel3')
              .setLabel('Atualizar painel')
              .setEmoji('🔄')
              .setStyle(2),
              new ButtonBuilder()
              .setCustomId('voltar')
              .setLabel('Voltar')
              .setEmoji('⬅️')
              .setStyle(2),
            )
          ]
        })

        // Deletar o arquivo após enviar
        setTimeout(() => {
          fs.unlink(`grafico-${interaction.guild.id}.png`, (err) => {
            if (err) console.error('Erro ao deletar arquivo:', err);
          });
        }, 5000);
      } catch (error) {
        console.error('Erro ao gerar estatísticas:', error);
        await interaction.followUp({ content: 'Ocorreu um erro ao gerar as estatísticas. Por favor, tente novamente.', flags: 64 });
      }
    }
    
    async function EmbedMensagem() {
      const pp = srv.get(interaction.guild.id)
      await interaction.update({
        content: `# **Configurações do servidor**\n- Aqui você poderá configurar a mensagem, preços e outras opções relacionadas a venda de membros no servidor \`${interaction.guild.name}\`\n  - Saldo atual: \`R$ ${Number(pp.saldo).toFixed(2)}\`\n\n- **Configurações atuais:**\n  - Vendas: \`${pp.vendas == "ON" ? "🟢 Ativa": "🔴 Não ativa"}\`\n  - Pedido mínimo: \`${pp.pedidoMin}\`\n  - Preço por membro \`R$ ${Number(pp.precoMembro).toFixed(2)} (R$ ${Number(pp.precoMembro) * 100} a cada 100)\`\n  - Comissão: \`50%\`\n  - Cargo de equipe: ${interaction.guild.roles.cache.get(pp.cargoEquipe) || "\`Não possui\`"}\n  - Cargo de cliente: ${interaction.guild.roles.cache.get(pp.cargoCliente) || "\`Não possui\`"}\n  - Email: \`${pp.email == "undefined" ? "Não definido": pp.email}\`\n\n- **Usuários com permissão:**\n  - ${pp.perms.length ? pp.perms.map(x => `<@${x}>`).join("\n"): `\`Nenhum configurado ainda\``}\n\n${pp.webhook == "undefined" ? "-# • \`⚠️\` • O Webhook não foi configurado. sem ele você não receberá notificação de vendas!": ""}\n${pp.msgEnviada == "nao" ? "-# • \`⚠️\` • A mensagem de vendas não foi enviada ainda.": ""}`,
        components: [
            new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
              .setCustomId('cfgMsg2')
              .setLabel('Configurar mensagem')
              .setEmoji('🔄')
              .setStyle(1),
              new ButtonBuilder()
              .setCustomId('previewMsg')
              .setLabel('Preview Mensagem')
              .setEmoji('🎨')
              .setStyle(1),
              new ButtonBuilder()
              .setCustomId('enviarMsg')
              .setLabel('Enviar mensagem')
              .setEmoji('🔄')
              .setStyle(1)
            ),
            new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
              .setCustomId('sicronizarMsg')
              .setLabel('Sicronizar mensagem')
              .setEmoji('🔄')
              .setStyle(2),
              new ButtonBuilder()
              .setCustomId('attPainel2')
              .setLabel('Atualizar esse painel')
              .setEmoji('🔄')
              .setStyle(2),
              new ButtonBuilder()
              .setCustomId('voltar')
              .setLabel('Voltar')
              .setEmoji('⬅️')
              .setStyle(2)
            )
        ],
        files: [],
        flags: 64
      })
    }
    
    async function EmbedAvancadas() {
      await interaction.update({
        components: [
          new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
            .setCustomId('addRevendedor')
            .setLabel('Adicionar revendedor')
            .setEmoji('➕')
            .setStyle(1),
            new ButtonBuilder()
            .setCustomId('delRevendedor')
            .setLabel('Remover revendedor')
            .setEmoji('➖')
            .setStyle(1),
            new ButtonBuilder()
            .setCustomId('cfgWebhook')
            .setLabel('Configurar Webhook')
            .setEmoji('🔄')
            .setStyle(1)
          ),
          new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
            .setCustomId('onOffVendas')
            .setLabel(`${srv.get(`${interaction.guild.id}.vendas`) == 'ON' ? 'Desativar vendas': 'Ativar vendas'}`)
            .setEmoji('🔄')
            .setStyle(`${srv.get(`${interaction.guild.id}.vendas`) == 'ON' ? 4: 3}`),
            new ButtonBuilder()
            .setCustomId('altEmail')
            .setLabel('Alterar email')
            .setEmoji('🔄')
            .setStyle(2),
            new ButtonBuilder()
            .setCustomId('attPainel4')
            .setLabel('Atualizar esse painel')
            .setEmoji('🔄')
            .setStyle(2),
            new ButtonBuilder()
            .setCustomId('voltar')
            .setLabel('Voltar')
            .setEmoji('🔄')
            .setStyle(2)
          )
        ]
      })
    }
    
    async function gerarGrafico(vendas) {
      const largura = 400
      const altura = 200
      const chartJSNodeCanvas = new ChartJSNodeCanvas({
        width: largura, 
        height: altura,
        backgroundColour: 'white'
      });

      const configuracao = {
        type: 'line',
        data: {
          labels: vendas.map(v => v.dia),
          datasets: [{
            label: 'Vendas nos últimos 5 dias',
            data: vendas.map(v => v.valor),
            borderColor: 'rgb(54, 162, 235)',
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            fill: true
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: (value) => `R$ ${value.toFixed(2)}`
              }
            }
          }
        }
      }

      const buffer = await chartJSNodeCanvas.renderToBuffer(configuracao)
      const fileName = `grafico-${interaction.guild.id}.png`
      
      fs.writeFileSync(fileName, buffer)
      
      return new AttachmentBuilder(fileName, { name: fileName })
    }
  }
}
/* inbiza */
// inbiza
// inbiza
/* inbiza */
// inbiza