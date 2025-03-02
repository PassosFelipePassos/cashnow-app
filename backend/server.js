const express = require("express");
const cors = require("cors");
const sql = require("mssql");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

// Configuração do banco de dados
const config = {
    user: "admin_gs",
    password: "Userpass@30",
    server: "srv-gs.database.windows.net",
    database: "dw",
    options: {
        encrypt: true,
        enableArithAbort: true
    }
};

// Função para buscar senha do usuário no banco
async function getUserPassword(idColaborador) {
    try {
        await sql.connect(config);
        console.log(`🔍 Buscando usuário com ID: ${idColaborador}`);

        const result = await sql.query`
            SELECT Senha FROM [SolicitacaoExtra].[Colaborador] WHERE IdColaboradorNexti = ${idColaborador}
        `;

        if (result.recordset.length === 0) {
            console.log("❌ Usuário não encontrado.");
            return null;
        }

        return result.recordset[0].Senha.trim();
    } catch (err) {
        console.error("❌ Erro ao buscar usuário:", err);
        return null;
    }
}

// ✅ **Definir a rota de login corretamente**
app.post("/login", async (req, res) => {
    const { idColaborador, password } = req.body;

    if (!idColaborador || !password) {
        return res.status(400).json({ success: false, message: "ID e senha são obrigatórios!" });
    }

    const storedPassword = await getUserPassword(idColaborador);

    if (!storedPassword) {
        return res.json({ success: false, message: "Usuário não encontrado ou sem senha cadastrada!" });
    }

    if (storedPassword === password.trim()) {
        return res.json({ success: true, message: "OK" });
    } else {
        return res.json({ success: false, message: "ID ou senha incorretos!" });
    }
});

// ✅ **Certifique-se de que o servidor está escutando corretamente**
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
