const { PermissionFlagsBits } = require("discord.js")
const { srv, cfg } = require("../../../src/db/index.js")

module.exports = {
  name: "criarloja",
  description: "Criar o sistema de vendas no servidor",
  default_member_permissions: PermissionFlagsBits.Administrator,
  run: async(client, interaction) => {
    
    if (cfg.get('criarloja') != "ON") {
      await interaction.reply({ content: `\`❌\` • O sistema de revenda está desativado no momento.`, flags: 64 })
      return
    }
    
    if (srv.has(interaction.guild.id)) {
      await interaction.reply({ content: `\`❌\` • O seu servidor já está registrado no sistema.`, flags: 64 })
      return
    }
    
    if (!cfg.get(`servidores`).includes(interaction.guild.id)) {
      await interaction.reply({ content: `\`❌\` • O seu servidor não está em nosso sistema.`, flags: 64 })
      return
    }
    
   /*   const guild = client.guilds.cache.get(interaction.guild.id)
    if (guild.memberCount < cfg.get(`minimo_membros`)) {
      await interaction.reply({ content: `\`❌\` • O seu servidor não possui o requisito de \`${cfg.get(`minimo_membros`)}\` membros.`, flags: 64 })
      return
    }*/
    
    srv.set(interaction.guild.id, {
      vendas: "ON",
      saldo: 0,
      pedidoMin: 100,
      precoMembro: 0.0320,
      comissao: 50,
      cargoEquipe: "undefined",
      cargoCliente: "undefined",
      email: "undefined",
      perms: [],
      estatisticas: {
        Segunda: 0,
        "Terça": 0,
        Quarta: 0,
        Quinta: 0,
        Sexta: 0
      },
      webhook: "undefined",
      msgEnviada: "nao",
      mensagem: {
        embed: {
          title: "🚀 • Compra de m3mbros real",
          desc: `
- **Qualidade premium**
> Transforme seu servidor e atraia mais atenção de possíveis clientes ou membros na sua comunidade com membros misto!

- **Impulsione suas vendas**
> Com nossos membros, você terá oportunidade de chamar mais atenção para sua loja, trazendo uma conversão de vendas maior

- **O Melhor Preço do Mercado**
> Temos orgulho de trazer o menor preço do mercado para vocês, aqui você paga menos e leva mais

- **Sistema de refil**
> Nosso BOT possui o sistema de refil, garantindo que você aproveite 100% do produto que você comprou!

- **Entrega Rápida e Garantida**
> Entrega rápida e garantida: receba seus membros ou seu dinheiro de volta!

-# Pode conter membros reais misturado!
⠀
-# \`✅\`・Sistema de refil incluso
-# \`✅\`・Menor preço do mercado`,
          banner: "https://media.discordapp.net/attachments/1256793568127746118/1264011733182320660/banner-1.png?ex=67d179e9&is=67d02869&hm=73e1714434007075c75489033ff62cbae4ec242dd929f5643daf268bf28bd665&",
          
        },
        botao: {
          label: "Adquirir",
          emoji: '<:emoji_43:1337385917660532746>',
          cor: 2
        }
      }
    })
    await interaction.reply({ content: `\`✅\` • O seu servidor foi registrado com sucesso!`, flags: 64 })
    
  }
}