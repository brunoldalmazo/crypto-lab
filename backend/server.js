const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

app.use(
    express.static(
        path.join(__dirname, "public")
    )
);

const users = [
    {
        id: 1,
        nome: "admin",
        descricao: "Administrador",
        saldo: 1000,
        tipo: "admin",
        senha: "1234"
    },
    {
        id: 2,
        nome: "joao",
        descricao: "Aluno",
        saldo: 100,
        tipo: "user",
        senha: "1234"
    }
];

app.get("/", (req, res) => {
    res.send("Backend online");
});

app.post("/login", (req, res) => {
    const { nome, senha } = req.body;

    const user = users.find(
        u => u.nome === nome && u.senha === senha
    );

    if (!user) {
        return res.status(401).json({
            erro: "Login invalido"
        });
    }

    res.json(user);
});

app.get("/users", (req, res) => {
    res.json(users);
});

app.post("/transferir", (req, res) => {
    const { fromId, toId, valor } = req.body;

    const from = users.find(u => u.id == fromId);
    const to = users.find(u => u.id == toId);

    if (!from || !to) {
        return res.status(404).json({
            erro: "Usuario nao encontrado"
        });
    }

    if (from.tipo !== "admin") {
        return res.status(403).json({
            erro: "Sem permissao"
        });
    }

    from.saldo -= Number(valor);
    to.saldo += Number(valor);

    res.json({
        sucesso: true
    });
});

app.post("/alterar-cargo", (req, res) => {
    const { adminId, userId, novoTipo } = req.body;

    const admin = users.find(u => u.id == adminId);

    if (!admin || admin.tipo !== "admin") {
        return res.status(403).json({
            erro: "Sem permissao"
        });
    }

    const user = users.find(u => u.id == userId);

    if (!user) {
        return res.status(404).json({
            erro: "Usuario nao encontrado"
        });
    }

    user.tipo = novoTipo;

    res.json({
        sucesso: true
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Servidor online");
});
