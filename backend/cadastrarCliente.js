const express = require("express");
const sql = require("mssql");

const router = express.Router();

// Configuração da conexão com o SQL Server Azure
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

// Função para conectar ao banco de dados
async function connectToDatabase() {
    try {
        return await sql.connect(config);
    } catch (error) {
        console.error("? Erro ao conectar ao banco:", error);
        throw new Error("Erro ao conectar ao banco de dados.");
    }
}

// ?? **Rota para cadastrar cliente**
router.post("/cadastrar-cliente", async (req, res) => {
    let connection;
    try {
        connection = await connectToDatabase();

        const { nome, cpf, telefone } = req.body;

        // Validação dos campos obrigatórios
        if (!nome || !cpf || !telefone) {
            return res.status(400).json({ success: false, message: "Nome, CPF e Telefone são obrigatórios!" });
        }

        // Verifica se o CPF já existe no banco
        const checkCPF = await connection.request()
            .input("cpf", sql.VarChar, cpf)
            .query("SELECT COUNT(*) AS count FROM Clientes WHERE CPF = @cpf");

        if (checkCPF.recordset[0].count > 0) {
            return res.status(400).json({ success: false, message: "CPF já cadastrado no sistema!" });
        }

        // Insere o novo cliente de forma segura
        await connection.request()
            .input("nome", sql.VarChar, nome)
            .input("cpf", sql.VarChar, cpf)
            .input("telefone", sql.VarChar, telefone)
            .query(`
                INSERT INTO Clientes (Nome, CPF, Telefone)
                VALUES (@nome, @cpf, @telefone)
            `);

        res.json({ success: true, message: "Cliente cadastrado com sucesso!" });

    } catch (error) {
        console.error("? Erro ao cadastrar cliente:", error);
        res.status(500).json({ success: false, message: "Erro ao cadastrar cliente!" });
    } finally {
        if (connection) connection.close(); // Fecha a conexão ao final
    }
});

// Exportando as rotas
module.exports = router;
