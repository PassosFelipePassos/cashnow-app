const express = require("express");
const sql = require("mssql");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json()); // Permite receber JSON corretamente
app.use(express.urlencoded({ extended: true })); // Permite receber dados de formul�rio

const config = {
    user: "admin_gs",
    password: "Userpass@30",
    server: "srv-gs.database.windows.net",
    database: "dw",
    options: { encrypt: true, enableArithAbort: true }
};

app.post("/cadastrar-cliente", async (req, res) => {
    try {
        console.log("?? Recebendo dados do formul�rio...");
        console.log("?? Dados Recebidos:", JSON.stringify(req.body, null, 2));

        await sql.connect(config);

        const {
            Nome, DD, Telefone, RG, CPF, DataNascimento, NomeMae, 
            CEP, Endereco, Numero, Complemento, Bairro, Cidade, Estado, 
            MarcaModelo, Placa, Ano, Cor
        } = req.body;

        if (!Nome || !CPF || !Telefone) {
            throw new Error("? Nome, CPF e Telefone s�o obrigat�rios.");
        }

        // Inserir Cliente
        const resultCliente = await sql.query`
            INSERT INTO Cliente (Nome, DD, Telefone, RG, CPF, DataNascimento, NomeMae) 
            OUTPUT INSERTED.IdCliente
            VALUES (${Nome}, ${DD}, ${Telefone}, ${RG}, ${CPF}, ${DataNascimento}, ${NomeMae})
        `;

        if (resultCliente.recordset.length === 0) {
            throw new Error("? Falha ao inserir Cliente.");
        }

        const IdCliente = resultCliente.recordset[0].IdCliente;
        console.log("? Cliente inserido com ID:", IdCliente);

        // Inserir Endere�o
        await sql.query`
            INSERT INTO EnderecoCliente (IdCliente, CEP, Endereco, Numero, Complemento, Bairro, Cidade, Estado) 
            VALUES (${IdCliente}, ${CEP}, ${Endereco}, ${Numero}, ${Complemento}, ${Bairro}, ${Cidade}, ${Estado})
        `;

        console.log("? Endere�o cadastrado!");

        // Inserir Ve�culo
        await sql.query`
            INSERT INTO VeiculoCliente (IdCliente, MarcaModelo, Placa, Ano, Cor) 
            VALUES (${IdCliente}, ${MarcaModelo}, ${Placa}, ${Ano}, ${Cor})
        `;

        console.log("? Ve�culo cadastrado!");

        res.json({ success: true, message: "Cliente cadastrado com sucesso!" });
    } catch (err) {
        console.error("? Erro ao cadastrar cliente:", err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});

// Iniciar o servidor
app.listen(3000, () => console.log("?? Servidor rodando na porta 3000"));
