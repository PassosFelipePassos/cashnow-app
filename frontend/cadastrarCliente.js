async function cadastrarCliente() {
    const clienteData = {
        nome: document.getElementById("nome").value.trim(),
        dd: document.getElementById("dd").value.trim(),
        telefone: document.getElementById("telefone").value.trim(),
        rg: document.getElementById("rg").value.trim(),
        cpf: document.getElementById("cpf").value.trim(),
        dataNascimento: document.getElementById("dataNascimento").value,
        nomeMae: document.getElementById("nomeMae").value.trim(),

        endereco: {
            cep: document.getElementById("cep").value.trim(),
            endereco: document.getElementById("endereco").value.trim(),
            numero: document.getElementById("numero").value.trim(),
            complemento: document.getElementById("complemento").value.trim(),
            bairro: document.getElementById("bairro").value.trim(),
            cidade: document.getElementById("cidade").value.trim(),
            estado: document.getElementById("estado").value.trim()
        },

        veiculo: {
            marcaModelo: document.getElementById("marcaModelo").value.trim(),
            placa: document.getElementById("placa").value.trim(),
            ano: document.getElementById("ano").value.trim(),
            cor: document.getElementById("cor").value.trim()
        }
    };

    console.log("?? Enviando dados para o servidor...", clienteData);

    try {
        const response = await fetch("https://cashnow-app.onrender.com/cadastrar-cliente", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(clienteData)
        });

        const data = await response.json();
        console.log("?? Resposta do servidor:", data);

        if (data.success) {
            alert("Cliente cadastrado com sucesso!");
            document.getElementById("clienteForm").reset();
        } else {
            alert("Erro ao cadastrar cliente: " + data.message);
        }
    } catch (error) {
        console.error("? Erro ao cadastrar cliente:", error);
        alert("Erro ao conectar com o servidor!");
    }
}
