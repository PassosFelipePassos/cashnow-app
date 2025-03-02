async function cadastrarCliente() {
    const formData = new FormData();
    
    formData.append("Nome", document.getElementById("nome").value.trim());
    formData.append("DD", document.getElementById("dd").value.trim());
    formData.append("Telefone", document.getElementById("telefone").value.trim());
    formData.append("RG", document.getElementById("rg").value.trim());
    formData.append("CPF", document.getElementById("cpf").value.trim());
    formData.append("DataNascimento", document.getElementById("dataNascimento").value);
    formData.append("NomeMae", document.getElementById("nomeMae").value.trim());

    formData.append("CEP", document.getElementById("cep").value.trim());
    formData.append("Endereco", document.getElementById("endereco").value.trim());
    formData.append("Numero", document.getElementById("numero").value.trim());
    formData.append("Complemento", document.getElementById("complemento").value.trim());
    formData.append("Bairro", document.getElementById("bairro").value.trim());
    formData.append("Cidade", document.getElementById("cidade").value.trim());
    formData.append("Estado", document.getElementById("estado").value.trim());

    formData.append("MarcaModelo", document.getElementById("marcaModelo").value.trim());
    formData.append("Placa", document.getElementById("placa").value.trim());
    formData.append("Ano", document.getElementById("ano").value.trim());
    formData.append("Cor", document.getElementById("cor").value.trim());

    console.log("📤 Enviando dados para o servidor...");
    for (let pair of formData.entries()) {
        console.log(pair[0] + ": " + pair[1]);
    }

    try {
        const response = await fetch("https://cashnow-app.onrender.com/cadastrar-cliente", {
            method: "POST",
            body: formData
        });

        const data = await response.json();
        console.log("📥 Resposta do servidor:", data);

        if (data.success) {
            alert("Cliente cadastrado com sucesso!");
            document.getElementById("clienteForm").reset();
        } else {
            alert("Erro ao cadastrar cliente: " + data.message);
        }
    } catch (error) {
        console.error("❌ Erro ao cadastrar cliente:", error);
        alert("Erro ao conectar com o servidor!");
    }
}
