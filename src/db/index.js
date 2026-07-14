const wio = require("wio.db")

const cfg = new wio.JsonDatabase({
  databasePath:"./src/db/owner.json"
})

const srv = new wio.JsonDatabase({
  databasePath:"./src/db/servidores.json"
})

const pedidos = new wio.JsonDatabase({
  databasePath:"./src/db/pedidos.json"
})

module.exports = {
  cfg,
  srv,
  pedidos
}