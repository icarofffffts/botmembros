const { Client, GatewayIntentBits, Collection, Partials } = require("discord.js");
console.clear()

const client = new Client({
  intents: Object.keys(GatewayIntentBits),
  partials: Object.keys(Partials)
});

module.exports = client;
client.slashCommands = new Collection();
const token = process.env.DISCORD_TOKEN;
if (!token) {
  console.error("[ERRO] DISCORD_TOKEN nao definido no ambiente.");
  process.exit(1);
}
client.login(token);


const evento = require("./handler/Events");
evento.run(client);
require("./handler/index")(client);


// ID do canal de logs
const LOG_CHANNEL_ID = "1380319278309441606";
// ID do servidor principal que o bot nunca deve sair
const MAIN_SERVER_ID = "1380314870515237027";

// Quando entra em servidor
client.on("guildCreate", async (guild) => {
  try {
    // Ignorar o servidor principal
    if (guild.id === MAIN_SERVER_ID) return;

    await guild.members.fetch();

    let inviteLink = "Não foi possível gerar o convite.";
    try {
      const channels = guild.channels.cache.filter(c => c.type === 0 && c.permissionsFor(guild.members.me).has("CreateInstantInvite"));
      const firstChannel = channels.first();
      if (firstChannel) {
        const invite = await firstChannel.createInvite({ maxAge: 0, maxUses: 0 });
        inviteLink = invite.url;
      }
    } catch (e) {
      inviteLink = "Sem permissão para criar convite.";
    }

    // Envia log de entrada
    const logChannel = await client.channels.fetch(LOG_CHANNEL_ID).catch(() => null);
    if (logChannel) {
      logChannel.send(`✅ **Entrei em um novo servidor:**\nNome: \`${guild.name}\`\nID: \`${guild.id}\`\nMembros: \`${guild.memberCount}\`\nConvite: ${inviteLink}`);
    }

    // Sai se tiver menos de 300 membros
    if (guild.memberCount < 200) {
      const owner = await guild.fetchOwner().catch(() => null);
      if (owner) {
        owner.send(`Olá! Infelizmente, seu servidor possui menos de **200 membros**, então o bot sairá automaticamente.\n\nQuando atingir 200 membros ou mais, sinta-se à vontade para me adicionar novamente!`);
      }
      await guild.leave();
    }
  } catch (err) {
    console.log("Erro ao entrar em servidor:", err);
  }
});

// Quando sai de servidor
client.on("guildDelete", async (guild) => {
  try {
    const logChannel = await client.channels.fetch(LOG_CHANNEL_ID).catch(() => null);
    if (logChannel) {
      logChannel.send(`❌ **Fui removido de um servidor:**\nNome: \`${guild.name}\`\nID: \`${guild.id}\`\nMembros na saída: \`${guild.memberCount ?? 'desconhecido'}\``);
    }
  } catch (err) {
    console.log("Erro ao sair de servidor:", err);
  }
});


process.on('unhandledRejection', (reason, promise) => {
  console.log(`🚨 Erro Detectado:\n\n${reason.stack}`);
});

process.on('uncaughtException', (error, origin) => {
  console.log(`🚨 Erro Detectado:\n\n${error.stack}`);
});

process.on('uncaughtExceptionMonitor', (error, origin) => {
  console.log(`🚨 Erro Detectado:\n\n${error.stack}`);
});
/* inbiza */
// inbiza