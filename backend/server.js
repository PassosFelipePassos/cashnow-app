const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const PORT = 3000;

app.use(express.json());

// ✅ Habilita CORS para o frontend
app.use(cors({
    origin: "https://cashnow-app.vercel.app", // Permite requisições do frontend
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization"
}));

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

app.get("/listar-clientes", async (req, res) => {
    try {
        const result = await pool.query("SELECT idcliente, nome FROM cliente ORDER BY nome");
        res.json(result.rows);
    } catch (error) {
        console.error("Erro ao buscar clientes:", error);
        res.status(500).json({ success: false, message: "Erro ao buscar clientes!" });
    }
});

// ✅ Rota para cadastrar um novo empréstimo
app.post("/cadastrar-emprestimo", async (req, res) => {
    const { idcliente, valor, quantidade_parcela, data_inicio_pagamento } = req.body;

    if (!idcliente || !valor || !quantidade_parcela || !data_inicio_pagamento) {
        return res.status(400).json({ success: false, message: "Todos os campos são obrigatórios!" });
    }

    try {
        // 💰 1️⃣ Inserir o empréstimo na tabela `emprestimo`
        const result = await pool.query(
            `INSERT INTO emprestimo (idcliente, valor, quantidade_parcela, data_inicio_pagamento)
             VALUES ($1, $2, $3, $4) RETURNING idemprestimo`,
            [idcliente, valor, quantidade_parcela, data_inicio_pagamento]
        );

        const idemprestimo = result.rows[0].idemprestimo;
        console.log("✅ Empréstimo cadastrado! ID:", idemprestimo);

        // 💰 2️⃣ Criar as parcelas na tabela `pagamento`
        const valorParcela = (valor / quantidade_parcela).toFixed(2);
        let dataParcela = new Date(data_inicio_pagamento);

        for (let i = 0; i < quantidade_parcela; i++) {
            await pool.query(
                `INSERT INTO pagamento (idemprestimo, idcliente, data_pagamento, valor, status)
                 VALUES ($1, $2, $3, $4, 'Aberto')`,
                [idemprestimo, idcliente, dataParcela.toISOString().split("T")[0], valorParcela]
            );

            console.log(`💲 Parcela ${i + 1} cadastrada para ${dataParcela.toISOString().split("T")[0]}`);
            
            // Avança um dia para a próxima parcela
            dataParcela.setDate(dataParcela.getDate() + 1);
        }

        return res.json({ success: true, message: "Empréstimo cadastrado com sucesso!" });

    } catch (error) {
        console.error("❌ Erro ao cadastrar empréstimo:", error);
        return res.status(500).json({ success: false, message: "Erro ao cadastrar empréstimo!" });
    }
});

app.get("/listar-pagamentos/:idcliente", async (req, res) => {
    const { idcliente } = req.params;

    try {
        const query = `
            SELECT p.idpagamento, p.data_pagamento, p.valor, p.status
            FROM pagamento p
            WHERE p.idcliente = $1
            ORDER BY p.data_pagamento;
        `;

        const result = await pool.query(query, [idcliente]);

        console.log("🔍 Pagamentos encontrados:", result.rows); // Adiciona LOG

        res.json(result.rows);
    } catch (error) {
        console.error("❌ Erro ao listar pagamentos:", error);
        res.status(500).json({ success: false, message: "Erro ao buscar pagamentos." });
    }
});



// ✅ Iniciar o servidor
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
