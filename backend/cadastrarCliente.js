const express = require("express");
const pool = require("./database"); // Importando a conex�o com PostgreSQL

const router = express.Router();

// ?? **Rota para cadastrar cliente**
router.post("/cadastrar-cliente", async (req, res) => {
    try {
        const { nome, cpf, telefone } = req.body;

        // Valida��o dos campos obrigat�rios
        if (!nome || !cpf || !telefone) {
            return res.status(400).json({ success: false, message: "Nome, CPF e Telefone s�o obrigat�rios!" });
        }

        // Verifica se o CPF j� existe no banco
        const checkCPF = await pool.query("SELECT COUNT(*) FROM cliente WHERE cpf = $1", [cpf]);
        
        if (parseInt(checkCPF.rows[0].count) > 0) {
            return res.status(400).json({ success: false, message: "CPF j� cadastrado no sistema!" });
        }

        // Insere o novo cliente de forma segura
        await pool.query(
            "INSERT INTO cliente (nome, cpf, telefone) VALUES ($1, $2, $3)",
            [nome, cpf, telefone]
        );

        res.json({ success: true, message: "Cliente cadastrado com sucesso!" });
    } catch (error) {
        console.error("? Erro ao cadastrar cliente:", error);
        res.status(500).json({ success: false, message: "Erro ao cadastrar cliente!" });
    }
});

// Exportando as rotas
module.exports = router;