async function login() {
    const idColaborador = document.getElementById("idColaborador").value;
    const password = document.getElementById("password").value;

    if (idColaborador === "" || password === "") {
        document.getElementById("mensagem").innerText = "Preencha todos os campos!";
        document.getElementById("mensagem").style.color = "red";
        return;
    }

    try {
        console.log("📤 Enviando requisição para o backend..."); // Debug

        const response = await fetch("https://cashnow-app.onrender.com/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idColaborador, password })
        });

        console.log("📥 Resposta recebida:", response); // Debug

        const data = await response.json();

        if (data.success) {
            alert("Login bem-sucedido!");
            window.location.href = "dashboard.html"; // Redireciona ao sucesso
        } else {
            document.getElementById("mensagem").innerText = "ID ou senha incorretos!";
            document.getElementById("mensagem").style.color = "red";
        }
    } catch (error) {
        console.error("❌ Erro ao fazer login:", error);
        document.getElementById("mensagem").innerText = "Erro ao conectar ao servidor!";
        document.getElementById("mensagem").style.color = "red";
    }
}
