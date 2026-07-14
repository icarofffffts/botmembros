const { ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder } = require("discord.js")
const { srv, cfg } = require("../../../src/db/index.js")

module.exports = {
  name: "interactionCreate",
  run: async(interaction) => {
    
    const { client } = interaction
    
    if (interaction.isButton()) {
      if (interaction.customId == 'revendaOnOff') {
        if (cfg.get(`criarloja`) == 'ON') {
          cfg.set(`criarloja`, 'OFF')
        } else if (cfg.get(`criarloja`) == 'OFF') {
          cfg.set(`criarloja`, 'ON')
        }
        
        AttEmbed()
      }
      
      if (interaction.customId == 'cfgKeyHiper') {
        const modal = new ModalBuilder()
        .setCustomId('cfgKeyHiper')
        .setTitle('Configurar Key Hiper')
        
        const key = new TextInputBuilder()
        .setCustomId('key')
        .setLabel("KEY")
        .setPlaceholder('Coloque a key aqui')
        .setStyle(1)
        
        modal.addComponents(new ActionRowBuilder().addComponents(key))
        
        await interaction.showModal(modal)
      }
      
      if (interaction.customId == 'cfgAccessToken') {
        const modal = new ModalBuilder()
        .setCustomId('cfgAccessToken')
        .setTitle('Configurar AccessToken')
        
        const key = new TextInputBuilder()
        .setCustomId('key')
        .setLabel("AccessToken")
        .setPlaceholder('Coloque o AccessToken aqui')
        .setStyle(1)
        
        modal.addComponents(new ActionRowBuilder().addComponents(key))
        
        await interaction.showModal(modal)
      }
      
      if (interaction.customId == 'cfgCanalSaque') {
        const modal = new ModalBuilder()
        .setCustomId('cfgCanalSaque')
        .setTitle('Configurar Canal Saques')
        
        const key = new TextInputBuilder()
        .setCustomId('key')
        .setLabel("Canal")
        .setPlaceholder('Coloque o ID do canal aqui')
        .setStyle(1)
        
        modal.addComponents(new ActionRowBuilder().addComponents(key))
        
        await interaction.showModal(modal)
      }
      
      if (interaction.customId == 'add_server') {
        const modal = new ModalBuilder()
        .setCustomId('add_server')
        .setTitle('Adicionar Servidor')
        
        const key = new TextInputBuilder()
        .setCustomId('key')
        .setLabel("Servidor")
        .setPlaceholder('Coloque o ID do servidor aqui')
        .setStyle(1)
        
        modal.addComponents(new ActionRowBuilder().addComponents(key))
        
        await interaction.showModal(modal)
      }
      
      if (interaction.customId == 'del_server') {
        const modal = new ModalBuilder()
        .setCustomId('del_server')
        .setTitle('Remover Servidor')
        
        const key = new TextInputBuilder()
        .setCustomId('key')
        .setLabel("Servidor")
        .setPlaceholder('Coloque o ID do servidor aqui')
        .setStyle(1)
        
        modal.addComponents(new ActionRowBuilder().addComponents(key))
        
        await interaction.showModal(modal)
      }
    }
    
    
    if (interaction.isModalSubmit()) {
      if (interaction.customId == 'cfgKeyHiper') {
        const key = interaction.fields.getTextInputValue('key')
        
        cfg.set(`key_hyper`, key)
        AttEmbed()
      }
      
      if (interaction.customId == 'cfgAccessToken') {
        const key = interaction.fields.getTextInputValue('key')
        
        cfg.set(`access_token`, key)
        AttEmbed()
      }
      
      if (interaction.customId == 'cfgCanalSaque') {
        const key = interaction.fields.getTextInputValue('key')
        
        if (!client.channels.cache.get(key)) {
          await interaction.reply({ content: `\`❌\` • Não encontrei esse canal!`, flags: 64 })
          return
        }
        
        cfg.set(`canal_logs_saque`, key)
        AttEmbed()
      }
      
      if (interaction.customId == 'add_server') {
        const key = interaction.fields.getTextInputValue('key')
        
        if (cfg.get(`servidores`).includes(key)) {
          await interaction.reply({ content: `\`❌\` • Esse servidor já está na revenda!`, flags: 64 })
          return
        }
        
        cfg.push(`servidores`, key)
        AttEmbed()
      }
      
      if (interaction.customId == 'del_server') {
        const key = interaction.fields.getTextInputValue('key')
        
        if (!cfg.get(`servidores`).includes(key)) {
          await interaction.reply({ content: `\`❌\` • Esse servidor não está na revenda!`, flags: 64 })
          return
        }
        
        cfg.pull(`servidores`, (el) => el == key)
        AttEmbed()
      }
    }
    
    
    async function AttEmbed() {
      await interaction.update({
        content: `# Configurações do BOT\n- Configure oque deseja utilizando os botões abaixo\n\n- Configurações\n  - Revenda: \`${cfg.get(`criarloja`)}\`\n  - Key Hiper: ${cfg.get(`key_hyper`) == "undefined" ? 'Não definido': `||${cfg.get(`key_hyper`)}||`}\n  - AccessToken: ${cfg.get(`access_token`) == "undefined" ? 'Não definido': `||${cfg.get(`access_token`)}||`}\n  - Canal logs saques: ${client.channels.cache.get(cfg.get(`canal_logs_saque`)) || "Não encontrado/Não definido"}\n\n- Servidores revenda\n${cfg.get(`servidores`).length ? `${cfg.get(`servidores`).map(x => `Nome: ${client.guilds.cache.get(x)?.name || "Não encontrado"}\nID: ${x}`).join('\n')}`: `\`Nenhum servidor no sistema de revenda\``}`,
        components: [
          new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
            .setCustomId(`revendaOnOff`)
            .setLabel(cfg.get(`criarloja`) == 'ON' ? 'Desativar Revenda': 'Ativar Revenda')
            .setEmoji(`⚙️`)
            .setStyle(cfg.get(`criarloja`) == 'ON' ? 4: 3),
            new ButtonBuilder()
            .setCustomId(`cfgKeyHiper`)
            .setLabel('Configurar Key Hiper')
            .setEmoji(`⚙️`)
            .setStyle(2),
            new ButtonBuilder()
            .setCustomId(`cfgAccessToken`)
            .setLabel('Configurar AccessToken')
            .setEmoji(`⚙️`)
            .setStyle(2),
            new ButtonBuilder()
            .setCustomId(`cfgCanalSaque`)
            .setLabel('Configurar Canal Saques')
            .setEmoji(`⚙️`)
            .setStyle(2),
          ),
          new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
            .setCustomId(`add_server`)
            .setLabel('Adicionar Servidor')
            .setEmoji(`➕`)
            .setStyle(3),
            new ButtonBuilder()
            .setCustomId(`del_server`)
            .setLabel('Remover Servidor')
            .setEmoji(`➖`)
            .setStyle(4),
          )
        ],
        flags: 64
      })
    }
    
  }
}

