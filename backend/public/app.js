const API = "";

const DALMAZO_ID = 4;
const DALMAZO_NOME = "dalmazo";

function isDalmazoId(id) {
    return Number(id) === DALMAZO_ID;
}

function isDalmazoNome(nome) {
    return nome
        .trim()
        .toLowerCase() === DALMAZO_NOME;
}


async function login() {

    const nome =
        document.getElementById("nome").value;

    const senha =
        document.getElementById("senha").value;

    const resposta =
        await fetch(
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

        window.location.href = "/dashboard.html";

    } else {
        alert(dados.erro);
    }
}


async function carregarUsuarios() {

    const req =
        await fetch(`${API}/users`);

    const users =
        await req.json();

    const tbody =
        document.getElementById("listaUsuarios");

    tbody.innerHTML = "";

    users.forEach(user => {

        const isAdmin = user.tipo === "admin";

        const avatar = isAdmin
            ? "/avatar/admin.png"
            : `https://api.dicebear.com/9.x/personas/png?seed=${encodeURIComponent(user.nome)}&size=128`;

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

    const currentUser = JSON.parse(
        localStorage.getItem("user")
    );

    if (currentUser && currentUser.tipo === "admin") {

        document.getElementById("painelAdmin").innerHTML = `
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

    const req = await fetch(
        `${API}/transferir`,
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

    if (isDalmazoId(userId)) {
        alert("Cargo do Dalmazo é protegido.");
        return;
    }

    const req = await fetch(
        `${API}/alterar-cargo`,
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

    const data = await req.json();

    alert(JSON.stringify(data));
}


async function registrar() {

    const nome =
        document.getElementById("novoNome").value;

    const senha =
        document.getElementById("novaSenha").value;

    if (isDalmazoNome(nome)) {
        alert("Nome reservado.");
        return;
    }

    const req = await fetch(
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

    const data = await req.json();

    alert(JSON.stringify(data));
}


async function transferirAdmin() {

    const admin = JSON.parse(
        localStorage.getItem("user")
    );

    const fromId =
        document.getElementById("fromId").value;

    const toId =
        document.getElementById("toId").value;

    const valor =
        document.getElementById("valor").value;

    const req = await fetch(
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

    const data = await req.json();

    alert(JSON.stringify(data));
}


async function alterarSenha() {

    const admin = JSON.parse(
        localStorage.getItem("user")
    );

    const userId =
        document.getElementById("senhaUserId").value;

    const novaSenha =
        document.getElementById("novaSenhaAdmin").value;

    if (isDalmazoId(userId)) {
        alert("Senha do Dalmazo é protegida.");
        return;
    }

    const req = await fetch(
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

    const data = await req.json();

    alert(JSON.stringify(data));
}


async function adminCriarUsuario() {

    const admin = JSON.parse(
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
        alert("Nome reservado.");
        return;
    }

    const req = await fetch(
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

    const data = await req.json();

    alert(JSON.stringify(data));
}


function logout() {

    localStorage.removeItem("user");

    window.location = "/";
}


async function deletarUsuario() {

    const admin = JSON.parse(
        localStorage.getItem("user")
    );

    const userId =
        document.getElementById("deleteUserId").value;

    if (isDalmazoId(userId)) {
        alert("Usuário protegido pelo sistema.");
        return;
    }

    const req = await fetch(
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

    const data = await req.json();

    alert(JSON.stringify(data));
}
