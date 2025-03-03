async function login() {
    const id = document.getElementById("id").value.trim();
    const password = document.getElementById("password").value.trim();
    const mensagem = document.getElementById("mensagem");

    if (!id || !password) {
        mensagem.innerText = "Preencha todos os campos!";
        mensagem.style.color = "red";
        return;
    }

    try {
        console.log("?? Enviando requisição para o backend...");

        const response = await fetch("https://cashnow-app.onrender.com/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, password })
        });

        console.log("?? Resposta recebida:", response);

        const data = await response.json();

        if (data.success && data.token) {
            localStorage.setItem("token", data.token); // ? Salva o token no localStorage
            localStorage.setItem("tempoAtividade", Date.now()); // ? Salva o tempo da última atividade
            window.location.href = "dashboard.html"; // ? Redireciona para o painel principal
        } else {
            mensagem.innerText = "ID ou senha incorretos!";
            mensagem.style.color = "red";
        }
    } catch (error) {
        console.error("? Erro ao fazer login:", error);
        mensagem.innerText = "Erro ao conectar ao servidor!";
        mensagem.style.color = "red";
    }
}

// ? Protege todas as páginas verificando se o usuário está logado
function verificarAutenticacao() {
    const token = localStorage.getItem("token");
    
    if (!token) {
        alert("Sessão expirada! Faça login novamente.");
        window.location.href = "index.html"; // Redireciona para a tela de login
    }
}

// ?? Controla o tempo de inatividade do usuário (5 minutos)
let tempoInatividade;

function resetarTempo() {
    clearTimeout(tempoInatividade);
    localStorage.setItem("tempoAtividade", Date.now()); // Atualiza o tempo de atividade

    tempoInatividade = setTimeout(() => {
        alert("Sessão expirada por inatividade! Faça login novamente.");
        localStorage.removeItem("token");
        window.location.href = "index.html"; // Redireciona para o login
    }, 5 * 60 * 1000); // 5 minutos (300000 ms)
}

// ? Adiciona eventos para capturar atividade do usuário
document.addEventListener("mousemove", resetarTempo);
document.addEventListener("keydown", resetarTempo);
document.addEventListener("click", resetarTempo);

// ? Chama a verificação de autenticação ao carregar a página
document.addEventListener("DOMContentLoaded", () => {
    verificarAutenticacao();
    resetarTempo();
});
