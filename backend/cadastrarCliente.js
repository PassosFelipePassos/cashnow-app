const express = require("express");
const pool = require("./database"); // Importando a conexão com PostgreSQL

const router = express.Router();

// ? Rota para cadastrar cliente com endereço e veículo
router.post("/cadastrar-cliente", async (req, res) => {
    const client = await pool.connect(); // Inicia conexão para transação
    try {
        const {
            nome, dd, telefone, rg, cpf, dataNascimento, nomeMae,
            endereco, veiculo
        } = req.body;

        // Validação de campos obrigatórios
        if (!nome || !cpf || !telefone || !endereco || !veiculo) {
            return res.status(400).json({ success: false, message: "Todos os campos são obrigatórios!" });
        }

        await client.query("BEGIN"); // Inicia transação

        // Verifica se o CPF já existe no banco
        const checkCPF = await client.query("SELECT COUNT(*) FROM public.cliente WHERE cpf = $1", [cpf]);
        
        if (parseInt(checkCPF.rows[0].count) > 0) {
            await client.query("ROLLBACK"); // Cancela a transação
            return res.status(400).json({ success: false, message: "CPF já cadastrado no sistema!" });
        }

        // Insere o novo cliente e retorna o ID gerado
        const resultCliente = await client.query(
            `INSERT INTO public.cliente (nome, dd, telefone, rg, cpf, data_nascimento, nome_mae)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
            [nome, dd, telefone, rg, cpf, dataNascimento, nomeMae]
        );

        const clienteId = resultCliente.rows[0].id; // Captura o ID gerado

        // Insere o endereço do cliente
        await client.query(
            `INSERT INTO public.enderecocliente (cliente_id, cep, endereco, numero, complemento, bairro, cidade, estado)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [clienteId, endereco.cep, endereco.endereco, endereco.numero, endereco.complemento, endereco.bairro, endereco.cidade, endereco.estado]
        );

        // Insere os dados do veículo do cliente
        await client.query(
            `INSERT INTO public.veiculocliente (cliente_id, marca_modelo, placa, ano, cor)
             VALUES ($1, $2, $3, $4, $5)`,
            [clienteId, veiculo.marcaModelo, veiculo.placa, veiculo.ano, veiculo.cor]
        );

        await client.query("COMMIT"); // Confirma a transação

        res.json({ success: true, message: "Cliente cadastrado com sucesso!" });

    } catch (error) {
        await client.query("ROLLBACK"); // Reverte a transação em caso de erro
        console.error("? Erro ao cadastrar cliente:", error);
        res.status(500).json({ success: false, message: "Erro ao cadastrar cliente!" });
    } finally {
        client.release(); // Libera a conexão com o banco
    }
});

// Exportando as rotas
module.exports = router;
