async function login() {
    const idColaborador = document.getElementById("idColaborador").value;
    const password = document.getElementById("password").value;

    const response = await fetch("https://cashnow-app.onrender.com/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idColaborador, password })
    });

    const data = await response.json();
    
    if (data.success) {
        // Redireciona para o dashboard ao sucesso
        window.location.href = "dashboard.html";
    } else {
        // Exibe a mensagem de erro
        document.getElementById("mensagem").textContent = data.message;
        document.getElementById("mensagem").style.color = "red";
    }
}
