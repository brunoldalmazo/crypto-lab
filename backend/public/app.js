const API = "";

function authHeaders() {
    const userId = localStorage.getItem("userId");
    return userId ? { "x-user-id": userId } : {};
}

function verificarAutenticacao() {
    const userId = localStorage.getItem("userId");
    if (!userId) {
        window.location.href = "/";
        return;
    }
    carregarUsuarios();
}

function verificarAdmin() {
    const userId = localStorage.getItem("userId");

    if (!userId) {
        window.location.href = "/";
        return;
    }
}

async function mostrarResposta(req) {
    try {
        const data = await req.json();
        alert(JSON.stringify(data));
    } catch {
        const txt = await req.text();
        alert(txt || "Operação concluída.");
    }
}

async function login() {
    try {
        const nome = document.getElementById("nome").value;
        const senha = document.getElementById("senha").value;

        const resposta = await fetch("/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nome, senha })
        });

        const dados = await resposta.json();

        if (dados.id) {
            localStorage.setItem("userId", dados.id);
            localStorage.setItem("userNome", dados.nome);
            window.location.href = "/dashboard.html";
        } else {
            alert(dados.erro);
        }
    } catch (erro) {
        console.error("Erro ao fazer login:", erro);
        alert("Falha ao conectar ao servidor.");
    }
}

async function carregarUsuarios() {
    const req = await fetch(`${API}/usersx`, {
        headers: authHeaders()
    });
    const users = await req.json();

    const tbody = document.getElementById("listaUsuarios");
    tbody.innerHTML = "";

    users.forEach(user => {
        const avatar =
            user.nome?.toLowerCase() === "admin"
                ? "/avatar/newbie.png"
                : `https://api.dicebear.com/9.x/personas/png?seed=${encodeURIComponent(user.nome)}&size=256`;

        tbody.innerHTML += `
            <tr>
                <td>
                    <img 
                        src="${avatar}" 
                        width="40"
                        height="40"
                        style="border-radius:50%; object-fit:cover;"
                        onerror="this.src='/avatar/default.png'"
                    />
                </td>
                <td>${user.id}</td>
                <td>${user.nome}</td>
                <td>${user.descricao}</td>
                <td>${user.saldo}</td>
                <td>
                    ${
                        user.tipo === "admin"
                        ? '<span class="badge-admin">ADMIN</span>'
                        : '<span class="badge-user">USER</span>'
                    }
                </td>
            </tr>
        `;
    });

    const userId = localStorage.getItem("userId");

    if (userId) {
        document.getElementById("painelAdmin").innerHTML = `
            <a href="admin.html">
                Painel Admin
            </a>
        `;
    }
}

async function transferir() {
    const userId = localStorage.getItem("userId");
    const toId = document.getElementById("toId").value;
    const valor = document.getElementById("valor").value;

    const req = await fetch("/transferir", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ fromId: userId, toId, valor })
    });

    await mostrarResposta(req);
}

async function alterarCargo() {
    const adminId = localStorage.getItem("userId");
    const userId = document.getElementById("userId").value;
    const novoTipo = document.getElementById("novoTipo").value;

    const req = await fetch("/alterar-cargo", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ adminId, userId, novoTipo })
    });

    await mostrarResposta(req);
}

async function registrar() {
    const nome = document.getElementById("novoNome").value;
    const senha = document.getElementById("novaSenha").value;

    const req = await fetch("/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, senha })
    });

    await mostrarResposta(req);
}

async function transferirAdmin() {
    const adminId = localStorage.getItem("userId");
    const fromId = document.getElementById("fromId").value;
    const toId = document.getElementById("toId").value;
    const valor = document.getElementById("valor").value;

    const req = await fetch("/admin-transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ adminId, fromId, toId, valor })
    });

    await mostrarResposta(req);
}

async function alterarSenha() {
    const adminId = localStorage.getItem("userId");
    const userId = document.getElementById("senhaUserId").value;
    const novaSenha = document.getElementById("novaSenhaAdmin").value;

    const req = await fetch("/alterar-senha", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ adminId, userId, novaSenha })
    });

    await mostrarResposta(req);
}

async function adminCriarUsuario() {
    const adminId = localStorage.getItem("userId");
    const nome = document.getElementById("adminNovoNome").value;
    const senha = document.getElementById("adminNovaSenha").value;
    const descricao = document.getElementById("adminDescricao").value;
    const saldo = document.getElementById("adminSaldo").value;
    const tipo = document.getElementById("adminTipo").value;

    const req = await fetch("/admin-create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ adminId, nome, senha, descricao, saldo, tipo })
    });

    await mostrarResposta(req);
}

function logout() {
    localStorage.removeItem("userId");
    localStorage.removeItem("userNome");
    window.location = "/";
}

async function sacarTodasMoedas() {
    try {
        const confirmar = confirm(
            "Tem certeza que deseja sacar todas as moedas?"
        );

        if (!confirmar) return;

        const adminId = localStorage.getItem("userId");

        const resposta = await fetch("/sacar-todas-moedas", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ adminId })
        });

        const dados = await resposta.json();

        if (!dados.sucesso) {
            if (dados.erro === "Tem alguma coisa estranha no console.log().") {
                console.log("⚠️ LOG INTERNO:");
                console.log(
                    "Hash admin master tem prefixo no padrão bcrypt: $2b$08$..."
                );
                console.log(
                    "Procure em www.dalmazo.com"
                );
            }
            alert(dados.erro);
            return;
        }

        alert("Parabéns, acesso total concedido.");

        setTimeout(() => {
            window.location.href = "/secretx.html";
        }, 2000);

    } catch (erro) {
        console.error("Erro ao sacar moedas:", erro);
        alert("Falha ao conectar ao servidor.");
    }
}

async function deletarUsuario() {
    const adminId = localStorage.getItem("userId");
    const userId = document.getElementById("deleteUserId").value;

    const req = await fetch("/delete-user", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ adminId, userId })
    });

    await mostrarResposta(req);
}
