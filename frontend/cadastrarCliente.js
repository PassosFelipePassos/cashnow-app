<script>
    function toggleMenu() {
        document.getElementById("sidebar").classList.toggle("active");
    }
    
    function nextSection(sectionNumber) {
        document.querySelectorAll(".form-section").forEach(section => {
            section.style.display = "none";
        });
        document.getElementById(`section${sectionNumber}`).style.display = "block";
    }

    function prevSection(sectionNumber) {
        document.querySelectorAll(".form-section").forEach(section => {
            section.style.display = "none";
        });
        document.getElementById(`section${sectionNumber}`).style.display = "block";
    }

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
                logradouro: document.getElementById("endereco").value.trim(),
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

        console.log("?? Enviando dados para o servidor:", JSON.stringify(clienteData, null, 2));

        try {
            const response = await fetch("https://cashnow-app.onrender.com/cadastrar-cliente", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(clienteData)
            });

            const data = await response.json();
            console.log("?? Resposta do servidor:", data);

            if (data.success) {
                alert("Cliente cadastrado com sucesso!");
                document.getElementById("clienteForm").reset();

                // Retorna automaticamente para a primeira seção
                document.querySelectorAll(".form-section").forEach(section => {
                    section.style.display = "none";
                });
                document.getElementById("section1").style.display = "block";

            } else {
                alert("Erro ao cadastrar cliente: " + data.message);
            }
        } catch (error) {
            console.error("? Erro ao cadastrar cliente:", error);
            alert("Erro ao conectar com o servidor!");
        }
    }
</script>
