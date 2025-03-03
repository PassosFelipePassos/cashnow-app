// 🔒 Função para verificar autenticação e proteger páginas
function verificarAutenticacao() {
    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "index.html"; // Redireciona para login se não estiver autenticado
        return;
    }

    fetch("https://cashnow-app.onrender.com/listar-clientes", {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
    })
    .then(response => {
        if (!response.ok) {
            localStorage.removeItem("token");
            window.location.href = "index.html"; // Redireciona para login se o token for inválido
        }
    })
    .catch(() => {
        localStorage.removeItem("token");
        window.location.href = "index.html";
    });
}

// ⏳ Função para expirar a sessão após 5 minutos sem interação
let tempoInatividade;

function resetarTempo() {
    clearTimeout(tempoInatividade);
    tempoInatividade = setTimeout(() => {
        alert("Sessão expirada! Faça login novamente.");
        localStorage.removeItem("token");
        window.location.href = "index.html"; // Redireciona para login
    }, 5 * 60 * 1000); // 5 minutos (300000 ms)
}

// Reseta o tempo sempre que houver interação
document.addEventListener("mousemove", resetarTempo);
document.addEventListener("keydown", resetarTempo);
document.addEventListener("click", resetarTempo);

resetarTempo(); // Inicia o temporizador quando a página carrega

// 🔄 Chama a função de autenticação ao carregar a página
document.addEventListener("DOMContentLoaded", verificarAutenticacao);

// 📥 Função para carregar clientes na lista suspensa
async function carregarClientes() {
    try {
        const response = await fetch("https://cashnow-app.onrender.com/listar-clientes", {
            headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        });
        const clientes = await response.json();

        const select = document.getElementById("idcliente");
        select.innerHTML = '<option value="">Selecione um cliente</option>';

        clientes.forEach(cliente => {
            const option = document.createElement("option");
            option.value = cliente.idcliente;
            option.textContent = cliente.nome;
            select.appendChild(option);
        });
    } catch (error) {
        console.error("Erro ao carregar clientes:", error);
    }
}

// 📊 Função para carregar pagamentos do cliente selecionado
async function carregarPagamentos() {
    const idcliente = document.getElementById("idcliente").value;

    if (!idcliente) {
        document.getElementById("tabelaPagamentos").innerHTML = "<p>Selecione um cliente.</p>";
        return;
    }

    try {
        const response = await fetch(`https://cashnow-app.onrender.com/listar-pagamentos/${idcliente}`, {
            headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        });
        const pagamentos = await response.json();

        const tabela = document.getElementById("tabelaPagamentos");
        tabela.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Data</th>
                        <th>Valor</th>
                        <th>Status</th>
                        <th>Ação</th>
                    </tr>
                </thead>
                <tbody>
                    ${pagamentos.map(pagamento => {
                        let cor = pagamento.status === "Pago" ? "green" : 
                                  (new Date(pagamento.data_pagamento) < new Date() && pagamento.status === "Aberto") ? "red" : 
                                  "gray";

                        return `
                            <tr>
                                <td>${new Date(pagamento.data_pagamento).toLocaleDateString()}</td>
                                <td>R$ ${parseFloat(pagamento.valor).toFixed(2)}</td>
                                <td style="color: ${cor}; font-weight: bold;">${pagamento.status}</td>
                                <td>
                                    ${pagamento.status === "Aberto" ? `<button onclick="confirmarPagamento(${pagamento.idpagamento})">Confirmar</button>` : ""}
                                </td>
                            </tr>
                        `;
                    }).join("")}
                </tbody>
            </table>
        `;
    } catch (error) {
        console.error("Erro ao carregar pagamentos:", error);
    }
}

// ✅ Função para confirmar pagamento
async function confirmarPagamento(idpagamento) {
    if (!confirm("Deseja confirmar este pagamento?")) return;

    try {
        const response = await fetch(`https://cashnow-app.onrender.com/confirmar-pagamento/${idpagamento}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("token")}` }
        });

        const data = await response.json();
        if (data.success) {
            alert("Pagamento confirmado com sucesso!");
            carregarPagamentos(); // Atualiza a tabela após confirmação
        } else {
            alert("Erro ao confirmar pagamento: " + data.message);
        }
    } catch (error) {
        console.error("Erro ao confirmar pagamento:", error);
    }
}

// 📌 Adiciona evento ao selecionar um cliente
document.getElementById("idcliente")?.addEventListener("change", carregarPagamentos);

// 🔄 Carregar clientes ao iniciar a página
document.addEventListener("DOMContentLoaded", carregarClientes);
