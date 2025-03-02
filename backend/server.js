const express = require("express");
const cors = require("cors");
const sql = require("mssql");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

// Configuração da conexão com o SQL Server Azure
const config = {
    user: "admin_gs", // Substitua pelo seu usuário do SQL Server
    password: "Userpass@30", // Substitua pela sua senha do banco
    server: "srv-gs.database.windows.net", // Substitua pelo seu servidor no Azure
    database: "dw",
    options: {
        encrypt: true, // Necessário para conexões seguras no Azure
        enableArithAbort: true
    }
};

// Função para conectar ao banco e buscar a senha do usuário
async function getUserPassword(idColaborador) {
    try {
        await sql.connect(config);
        console.log(`🔍 Buscando usuário com IdColaboradorNexti: ${idColaborador}`);

        const result = await sql.query`
            SELECT Senha FROM [SolicitacaoExtra].[Colaborador] WHERE IdColaboradorNexti = ${idColaborador}
        `;

        if (result.recordset.length === 0) {
            console.log("❌ Usuário não encontrado no banco.");
            return null;
        }

        const storedPassword = result.recordset[0].Senha;
        console.log(`🔑 Senha armazenada no banco: "${storedPassword}"`);
        return storedPassword.trim(); // Remove espaços extras
    } catch (err) {
        console.error("❌ Erro ao buscar usuário:", err);
        return null;
    }
}

// Rota de login
app.post("/login", async (req, res) => {
    const { idColaborador, password } = req.body;

    if (!idColaborador || !password) {
        return res.status(400).json({ success: false, message: "ID e senha são obrigatórios!" });
    }

    const storedPassword = await getUserPassword(idColaborador);

    if (!storedPassword) {
        return res.json({ success: false, message: "Usuário não encontrado ou sem senha cadastrada!" });
    }

    if (storedPassword.trim() === password.trim()) {
        return res.json({ success: true, message: "OK" });
    } else {
        return res.json({ success: false, message: "ID ou senha incorretos!" });
    }
});


// Iniciar o servidor
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
