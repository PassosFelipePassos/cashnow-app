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
    password: "npg_DaWpjMJ08HbR@ep",
    port: 5432,
    ssl: {
        rejectUnauthorized: false
    }
});

// ✅ Importando rotas de cadastro
const cadastrarCliente = require("./cadastrarCliente"); // Certifique-se de que o arquivo está na mesma pasta
app.use("/", cadastrarCliente); // Agora as rotas de cadastro funcionarão

// ✅ Rota de login
app.post("/login", async (req, res) => {
    const { id, password } = req.body;

    if (!id || !password) {
        return res.status(400).json({ success: false, message: "ID e senha são obrigatórios!" });
    }

    try {
        console.log(`🔍 Buscando usuário com ID: ${id}`);
        
        const result = await pool.query("SELECT senha_hash FROM usuarios WHERE id = $1", [id]);

        console.log("🔎 Resultado da consulta:", result.rows);

        if (result.rows.length === 0) {
            console.log("❌ Usuário não encontrado.");
            return res.json({ success: false, message: "Usuário não encontrado ou sem senha cadastrada!" });
        }

        const storedPassword = result.rows[0].senha_hash?.trim();

        if (!storedPassword) {
            console.log("❌ Senha não definida para este usuário.");
            return res.json({ success: false, message: "Usuário não encontrado ou sem senha cadastrada!" });
        }

        if (storedPassword === password.trim()) {
            return res.json({ success: true, message: "OK" });
        } else {
            return res.json({ success: false, message: "ID ou senha incorretos!" });
        }
    } catch (err) {
        console.error("❌ Erro ao buscar usuário:", err);
        return res.status(500).json({ success: false, message: "Erro interno no servidor" });
    }
});

// ✅ Iniciar o servidor
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
