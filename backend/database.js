const { Pool } = require("pg");

// Configuração do banco de dados PostgreSQL
const pool = new Pool({
    user: "neondb_owner",
    host: "ep-little-mouse-a8z1m83y-pooler.eastus2.azure.neon.tech",
    database: "neondb",
    password: "npg_DaWpjMJ08HbR",
    port: 5432,
    ssl: {
        rejectUnauthorized: false
    }
});

pool.connect()
    .then(() => console.log("Conectado ao PostgreSQL no Azure!"))
    .catch(err => console.error("Erro ao conectar ao PostgreSQL:", err));

module.exports = pool;