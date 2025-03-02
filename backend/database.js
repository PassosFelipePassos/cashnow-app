const { Connection, Request } = require("tedious");

// Configuração do banco de dados no Azure
const config = {
    server: "srv-gs.database.windows.net",
    authentication: {
        type: "default",
        options: {
            userName: "admin_gs", // Altere para seu usuário do SQL Server
            password: "Userpass@30" // Altere para sua senha
        }
    },
    options: {
        encrypt: true, // Necessário para conexão segura
        database: "DW"
    }
};

// Criar a conexão
const connection = new Connection(config);

connection.on("connect", err => {
    if (err) {
        console.error("Erro ao conectar ao SQL Server:", err);
    } else {
        console.log("Conectado ao SQL Server no Azure!");
    }
});

module.exports = connection;
