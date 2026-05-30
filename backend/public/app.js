const API = "";

const DALMAZO_NOME = "dalmazo";

function isDalmazoNome(nome) {
    return String(nome || "")
        .trim()
        .toLowerCase() === DALMAZO_NOME;
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
    const nome =
        document.getElementById("nome").value;

    const senha =
        document.getElementById("senha").value;

    const resposta = await fetch(
        "/login",
        {
            method: "POST",
            headers: {
                "Content-Type":
                    "application/json"
            },
            body: JSON.stringify({
                nome,
                senha
            })
        }
    );

    const dados =
        await resposta.json();

    if (dados.id) {
        localStorage.setItem("userId", dados.id);
        localStorage.setItem("userNome", dados.nome);
        localStorage.setItem("tipo", dados.tipo);
        localStorage.setItem("user", JSON.stringify(dados));

        window.location.href =
            "/dashboard.html";
    } else {
        alert(dados.erro);
    }
}

async function carregarUsuarios() {
    const req =
        await fetch(`${API}/usersx`);

    const users =
        await req.json();

    const tbody =
        document.getElementById("listaUsuarios");

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

    const currentUser =
        JSON.parse(
            localStorage.getItem("user")
        );

    if (
        currentUser &&
        currentUser.tipo === "admin"
    ) {
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
    const user =
        JSON.parse(
            localStorage.getItem("user")
        );

    const toId =
        document.getElementById("toId").value;

    const valor =
        document.getElementById("valor").value;

    const req =
        await fetch(
            "/transferir",
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json"
                },
                body: JSON.stringify({
                    fromId: user.id,
                    toId,
                    valor
                })
            }
        );

    await mostrarResposta(req);
}

async function alterarCargo() {
    const admin =
        JSON.parse(
            localStorage.getItem("user")
        );

    const userId =
        document.getElementById("userId").value;

    const users =
        await fetch("/users").then(r => r.json());

    const alvo =
        users.find(
            u => Number(u.id) === Number(userId)
        );

    if (
        alvo &&
        isDalmazoNome(alvo.nome)
    ) {
        alert(
            "Cargo do dalmazo é protegido."
        );
        return;
    }

    const novoTipo =
        document.getElementById("novoTipo").value;

    const req =
        await fetch(
            "/alterar-cargo",
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json"
                },
                body: JSON.stringify({
                    adminId: admin.id,
                    userId,
                    novoTipo
                })
            }
        );

    await mostrarResposta(req);
}

async function registrar() {
    const nome =
        document.getElementById("novoNome").value;

    const senha =
        document.getElementById("novaSenha").value;

    if (isDalmazoNome(nome)) {
        alert("Nome dalmazo é reservado.");
        return;
    }

    const req =
        await fetch(
            "/register",
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json"
                },
                body: JSON.stringify({
                    nome,
                    senha
                })
            }
        );

    await mostrarResposta(req);
}

async function transferirAdmin() {
    const admin =
        JSON.parse(
            localStorage.getItem("user")
        );

    const fromId =
        document.getElementById("fromId").value;

    const toId =
        document.getElementById("toId").value;

    const valor =
        document.getElementById("valor").value;

    const req =
        await fetch(
            "/admin-transfer",
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json"
                },
                body: JSON.stringify({
                    adminId: admin.id,
                    fromId,
                    toId,
                    valor
                })
            }
        );

    await mostrarResposta(req);
}

async function alterarSenha() {
    const admin =
        JSON.parse(
            localStorage.getItem("user")
        );

    const userId =
        document.getElementById("senhaUserId").value;

    const users =
        await fetch("/users").then(r => r.json());

    const alvo =
        users.find(
            u => Number(u.id) === Number(userId)
        );

    if (
        alvo &&
        isDalmazoNome(alvo.nome)
    ) {
        alert(
            "Senha do dalmazo é protegida."
        );
        return;
    }

    const novaSenha =
        document.getElementById("novaSenhaAdmin").value;

    const req =
        await fetch(
            "/alterar-senha",
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json"
                },
                body: JSON.stringify({
                    adminId: admin.id,
                    userId,
                    novaSenha
                })
            }
        );

    await mostrarResposta(req);
}

async function adminCriarUsuario() {
    const admin =
        JSON.parse(
            localStorage.getItem("user")
        );

    const nome =
        document.getElementById("adminNovoNome").value;

    const senha =
        document.getElementById("adminNovaSenha").value;

    const descricao =
        document.getElementById("adminDescricao").value;

    const saldo =
        document.getElementById("adminSaldo").value;

    const tipo =
        document.getElementById("adminTipo").value;

    if (isDalmazoNome(nome)) {
        alert("Nome dalmazo é reservado.");
        return;
    }

    const req =
        await fetch(
            "/admin-create-user",
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json"
                },
                body: JSON.stringify({
                    adminId: admin.id,
                    nome,
                    senha,
                    descricao,
                    saldo,
                    tipo
                })
            }
        );

    await mostrarResposta(req);
}

function logout() {
    localStorage.removeItem("user");
    window.location = "/";
}

async function deletarUsuario() {
    const admin =
        JSON.parse(
            localStorage.getItem("user")
        );

    const userId =
        document.getElementById("deleteUserId").value;

    const users =
        await fetch("/users").then(r => r.json());

    const alvo =
        users.find(
            u => Number(u.id) === Number(userId)
        );

    if (
        alvo &&
        isDalmazoNome(alvo.nome)
    ) {
        alert(
            "Usuário dalmazo é protegido pelo sistema."
        );
        return;
    }

    const req =
        await fetch(
            "/delete-user",
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json"
                },
                body: JSON.stringify({
                    adminId: admin.id,
                    userId
                })
            }
        );

    await mostrarResposta(req);
}
