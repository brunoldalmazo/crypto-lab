const API = "https://crypto-lab-9m7u.onrender.com";

async function login() {

    const nome =
        document.getElementById("nome").value;

    const senha =
        document.getElementById("senha").value;

    const req = await fetch(`${API}/login`, {
        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            nome,
            senha
        })
    });

    const data = await req.json();

    if (data.erro) {
        alert(data.erro);
        return;
    }

    localStorage.setItem(
        "user",
        JSON.stringify(data)
    );

    window.location = "dashboard.html";
}

async function carregarUsuarios() {

    const req = await fetch(`${API}/users`);

    const users = await req.json();

    const tbody =
        document.getElementById("listaUsuarios");

    tbody.innerHTML = "";

    users.forEach(user => {

        tbody.innerHTML += `
            <tr>
                <td>${user.id}</td>
                <td>${user.nome}</td>
                <td>${user.descricao}</td>
                <td>${user.saldo}</td>
                <td>${user.tipo}</td>
            </tr>
        `;
    });

    const currentUser = JSON.parse(
        localStorage.getItem("user")
    );

    if (currentUser.tipo === "admin") {

        document.getElementById(
            "painelAdmin"
        ).innerHTML = `
            <a href="admin.html">
                Painel Admin
            </a>
        `;
    }
}

async function transferir() {

    const user = JSON.parse(
        localStorage.getItem("user")
    );

    const toId =
        document.getElementById("toId").value;

    const valor =
        document.getElementById("valor").value;

    const req = await fetch(`${API}/transferir`, {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            fromId: user.id,
            toId,
            valor
        })
    });

    const data = await req.json();

    alert(JSON.stringify(data));
}

async function alterarCargo() {

    const admin = JSON.parse(
        localStorage.getItem("user")
    );

    const userId =
        document.getElementById("userId").value;

    const novoTipo =
        document.getElementById("novoTipo").value;

    const req = await fetch(
        `${API}/alterar-cargo`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                adminId: admin.id,
                userId,
                novoTipo
            })
        }
    );

    const data = await req.json();

    alert(JSON.stringify(data));
}
