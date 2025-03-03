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
        console.log("?? Enviando requisi��o para o backend...");

        const response = await fetch("https://cashnow-app.onrender.com/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, password })
        });

        console.log("?? Resposta recebida:", response);

        const data = await response.json();

        if (data.success && data.token) {
            localStorage.setItem("token", data.token); // ? Salva o token no localStorage
            localStorage.setItem("tempoAtividade", Date.now()); // ? Salva o tempo da �ltima atividade
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

// ? Protege todas as p�ginas verificando se o usu�rio est� logado
function verificarAutenticacao() {
    const token = localStorage.getItem("token");
    
    if (!token) {
        alert("Sess�o expirada! Fa�a login novamente.");
        window.location.href = "index.html"; // Redireciona para a tela de login
    }
}

// ?? Controla o tempo de inatividade do usu�rio (5 minutos)
let tempoInatividade;

function resetarTempo() {
    clearTimeout(tempoInatividade);
    localStorage.setItem("tempoAtividade", Date.now()); // Atualiza o tempo de atividade

    tempoInatividade = setTimeout(() => {
        alert("Sess�o expirada por inatividade! Fa�a login novamente.");
        localStorage.removeItem("token");
        window.location.href = "index.html"; // Redireciona para o login
    }, 5 * 60 * 1000); // 5 minutos (300000 ms)
}

// ? Adiciona eventos para capturar atividade do usu�rio
document.addEventListener("mousemove", resetarTempo);
document.addEventListener("keydown", resetarTempo);
document.addEventListener("click", resetarTempo);

// ? Chama a verifica��o de autentica��o ao carregar a p�gina
document.addEventListener("DOMContentLoaded", () => {
    verificarAutenticacao();
    resetarTempo();
});
