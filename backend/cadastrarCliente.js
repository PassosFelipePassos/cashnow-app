const express = require("express");
const pool = require("./database"); // Conex�o com PostgreSQL

const router = express.Router();

// ? Rota para cadastrar cliente com endere�o e ve�culo
router.post("/cadastrar-cliente", async (req, res) => {
    console.log("?? Dados recebidos no backend:", JSON.stringify(req.body, null, 2));

    const {
        nome, dd, telefone, rg, cpf, dataNascimento, nomeMae,
        endereco = {}, veiculo = {}
    } = req.body;

    if (!nome || !cpf || !telefone || !endereco || !veiculo) {
        console.log("? Campos ausentes:", { nome, cpf, telefone, endereco, veiculo });
        return res.status(400).json({ success: false, message: "Todos os campos s�o obrigat�rios!" });
    }

    // Verifica se os dados do ve�culo foram enviados corretamente
    if (!veiculo.marcaModelo || !veiculo.placa || !veiculo.ano || !veiculo.cor) {
        console.log("? Campos do ve�culo ausentes:", veiculo);
        return res.status(400).json({ success: false, message: "Todos os dados do ve�culo s�o obrigat�rios!" });
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN"); // Inicia transa��o

        // Verifica se o CPF j� existe no banco
        const checkCPF = await client.query("SELECT COUNT(*) FROM public.cliente WHERE cpf = $1", [cpf]);
        if (parseInt(checkCPF.rows[0].count) > 0) {
            await client.query("ROLLBACK");
            return res.status(400).json({ success: false, message: "CPF j� cadastrado no sistema!" });
        }

        // Insere o novo cliente
        const resultCliente = await client.query(
            `INSERT INTO public.cliente (nome, dd, telefone, rg, cpf, datanascimento, nome_mae)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
            [nome, dd, telefone, rg, cpf, dataNascimento, nomeMae]
        );

        const clienteId = resultCliente.rows[0].id;

        // Insere o endere�o
        await client.query(
            `INSERT INTO public.enderecocliente (cliente_id, cep, logradouro, numero, complemento, bairro, cidade, estado)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [clienteId, endereco.cep, endereco.logradouro, endereco.numero, endereco.complemento, endereco.bairro, endereco.cidade, endereco.estado]
        );

        // Insere o ve�culo
        await client.query(
            `INSERT INTO public.veiculocliente (cliente_id, marca_modelo, placa, ano, cor)
             VALUES ($1, $2, $3, $4, $5)`,
            [clienteId, veiculo.marcaModelo, veiculo.placa, veiculo.ano, veiculo.cor]
        );

        await client.query("COMMIT");

        res.json({ success: true, message: "Cliente cadastrado com sucesso!" });

    } catch (error) {
        await client.query("ROLLBACK");
        console.error("? Erro ao cadastrar cliente:", error);
        res.status(500).json({ success: false, message: "Erro ao cadastrar cliente!" });
    } finally {
        client.release();
    }
});

module.exports = router;
