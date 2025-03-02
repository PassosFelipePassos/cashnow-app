const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

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

// Função para buscar senha do usuário no banco
async function getUserPassword(idColaborador) {
    try {
        console.log(`🔍 Buscando usuário com ID: ${idColaborador}`);
        const result = await pool.query(
            "SELECT senha FROM solicitacaoextra.colaborador WHERE idcolaboradornexti = $1", 
            [idColaborador]
        );

        if (result.rows.length === 0) {
            console.log("❌ Usuário não encontrado.");
            return null;
        }

        return result.rows[0].senha.trim();
    } catch (err) {
        console.error("❌ Erro ao buscar usuário:", err);
        return null;
    }
}

// ✅ Rota de login
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

// ✅ Iniciar o servidor
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));