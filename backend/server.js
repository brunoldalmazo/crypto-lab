const express = require("express");
const cors = require("cors");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");

const app = express();

app.use(cors());
app.use(express.json());

app.use(
    express.static(
        path.join(__dirname, "public")
    )
);

const db =
    new sqlite3.Database(
        "./database.db"
    );

db.serialize(() => {

    const adminHash =
        bcrypt.hashSync(
            "admin123",
            4
        );

    const dalmazoHash =
        bcrypt.hashSync(
            "bubblestar",
            8
        );

    const joaoHash =
        bcrypt.hashSync(
            "1234",
            4
        );

    const mariaHash =
        bcrypt.hashSync(
            "CryptoMari@!",
            10
        );

    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT,
            descricao TEXT,
            saldo INTEGER,
            tipo TEXT,
            senha TEXT
        )
    `);

    db.get(
        "SELECT * FROM users WHERE nome='admin'",
        (err, row) => {

            if (!row) {

                db.run(`
                    INSERT INTO users
                    (
                        nome,
                        descricao,
                        saldo,
                        tipo,
                        senha
                    )
                    VALUES
                    (
                        'admin',
                        'Admin newbie',
                        1000,
                        'admin',
                        '${adminHash}'
                    )
                `);

                db.run(`
                    INSERT INTO users
                    (
                        nome,
                        descricao,
                        saldo,
                        tipo,
                        senha
                    )
                    VALUES
                    (
                        'dalmazo',
                        'Admin master',
                        100,
                        'admin',
                        '${dalmazoHash}'
                    )
                `);

                db.run(`
                    INSERT INTO users
                    (
                        nome,
                        descricao,
                        saldo,
                        tipo,
                        senha
                    )
                    VALUES
                    (
                        'joao',
                        'Aluno com senha fraca',
                        100,
                        'user',
                        '${joaoHash}'
                    )
                `);

                db.run(`
                    INSERT INTO users
                    (
                        nome,
                        descricao,
                        saldo,
                        tipo,
                        senha
                    )
                    VALUES
                    (
                        'maria',
                        'Aluno com senha forte',
                        100,
                        'user',
                        '${mariaHash}'
                    )
                `);
            }
        }
    );
});

app.get("/", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "public",
            "index.html"
        )
    );
});

app.post(
    "/register",
    async (req, res) => {

        const {
            nome,
            senha
        } = req.body;

        const hash =
            await bcrypt.hash(
                senha,
                10
            );

        db.run(
            `
            INSERT INTO users
            (
                nome,
                descricao,
                saldo,
                tipo,
                senha
            )
            VALUES
            (
                ?,
                'Novo usuario',
                0,
                'user',
                ?
            )
            `,
            [nome, hash],

            function(err) {

                if (err) {
                    return res.status(500).json({
                        erro:
                            err.message
                    });
                }

                res.json({
                    sucesso: true,
                    id: this.lastID
                });
            }
        );
    }
);

app.post("/login", (req, res) => {

    const {
        nome,
        senha
    } = req.body;

    db.get(
        `
        SELECT *
        FROM users
        WHERE nome = ?
        LIMIT 1
        `,
        [nome],

        async (err, row) => {

            if (
                err ||
                !row
            ) {
                return res.status(401).json({
                    erro:
                        "Login invalido"
                });
            }

            const ok =
                await bcrypt.compare(
                    senha,
                    row.senha
                );

            if (!ok) {
                return res.status(401).json({
                    erro:
                        "Login invalido"
                });
            }

            res.json({
                id: row.id,
                nome: row.nome,
                descricao:
                    row.descricao,
                saldo:
                    row.saldo,
                tipo:
                    row.tipo
            });
        }
    );
});

function autenticar(req, res, next) {
    const userId = req.headers["x-user-id"];
    if (!userId || isNaN(Number(userId))) {
        return res.status(401).json({ erro: "Nao autenticado" });
    }
    db.get(
        "SELECT id, nome, descricao, saldo, tipo FROM users WHERE id = ?",
        [Number(userId)],
        (err, user) => {
            if (err || !user) {
                return res.status(401).json({ erro: "Nao autenticado" });
            }
            req.user = user;
            next();
        }
    );
}

app.get("/usersx", autenticar, (req, res) => {
    db.all(
        "SELECT id, nome, descricao, saldo, tipo FROM users",
        (err, rows) => {
            res.json(rows);
        }
    );
});

app.post("/transferir", autenticar, (req, res) => {

    const {
        fromId,
        toId,
        valor
    } = req.body;

    const valorNum = Number(valor);
    if (!fromId || !toId || !valor || isNaN(valorNum) || valorNum <= 0) {
        return res.status(400).json({ erro: "Dados invalidos" });
    }

    if (Number(fromId) !== req.user.id) {
        return res.status(403).json({ erro: "Sem permissao" });
    }

    db.run(
        `UPDATE users SET saldo = saldo - ? WHERE id = ?`,
        [valorNum, fromId],
        function(err) {
            if (err) {
                return res.status(500).json({ erro: "Erro interno" });
            }
        }
    );

    db.run(
        `UPDATE users SET saldo = saldo + ? WHERE id = ?`,
        [valorNum, toId],
        function(err) {
            if (err) {
                return res.status(500).json({ erro: "Erro interno" });
            }
        }
    );

    res.json({ sucesso: true });
});

function autenticarAdmin(req, res, next) {
    const adminId = req.body.adminId;
    if (!adminId || isNaN(Number(adminId))) {
        return res.status(401).json({ erro: "Nao autenticado" });
    }
    db.get(
        "SELECT id, nome, descricao, saldo, tipo FROM users WHERE id = ?",
        [Number(adminId)],
        (err, admin) => {
            if (err) {
                return res.status(500).json({ erro: "Erro interno" });
            }
            if (!admin || admin.tipo !== "admin") {
                return res.status(403).json({ erro: "Sem permissao" });
            }
            req.admin = admin;
            next();
        }
    );
}

app.post(
    "/alterar-cargo",
    autenticarAdmin,
    (req, res) => {

        const {
            userId,
            novoTipo
        } = req.body;

        if (!userId || !novoTipo) {
            return res.status(400).json({ erro: "Dados incompletos" });
        }

        if (!["user", "admin"].includes(novoTipo)) {
            return res.status(400).json({ erro: "Tipo invalido" });
        }

        db.get(
            "SELECT * FROM users WHERE id=?",
            [userId],
            (err, user) => {

                if (err) {
                    return res.status(500).json({ erro: "Erro interno" });
                }

                if (!user) {
                    return res.status(404).json({
                        erro: "Usuario nao encontrado"
                    });
                }

                if (
                    user.nome.toLowerCase() === "dalmazo" &&
                    novoTipo !== "admin"
                ) {
                    return res.json({
                        erro: "Nao e permitido alterar o cargo do dalmazo"
                    });
                }

                db.run(
                    `UPDATE users SET tipo = ? WHERE id = ?`,
                    [novoTipo, userId],
                    function(err) {
                        if (err) {
                            return res.status(500).json({ erro: "Erro ao alterar cargo" });
                        }
                        res.json({ sucesso: true });
                    }
                );
            }
        );
    }
);

app.post(
    "/admin-transfer",
    autenticarAdmin,
    (req, res) => {

        const {
            fromId,
            toId,
            valor
        } = req.body;

        const valorNum = Number(valor);
        if (!fromId || !toId || !valor || isNaN(valorNum) || valorNum <= 0) {
            return res.status(400).json({ erro: "Dados invalidos" });
        }

        db.run(
            `UPDATE users SET saldo = saldo - ? WHERE id = ?`,
            [valorNum, fromId],
            function(err) {
                if (err) {
                    return res.status(500).json({ erro: "Erro interno" });
                }
            }
        );

        db.run(
            `UPDATE users SET saldo = saldo + ? WHERE id = ?`,
            [valorNum, toId],
            function(err) {
                if (err) {
                    return res.status(500).json({ erro: "Erro interno" });
                }
            }
        );

        res.json({ sucesso: true });
    }
);

app.post(
    "/alterar-senha",
    autenticarAdmin,
    async (req, res) => {

        const {
            userId,
            novaSenha
        } = req.body;

        if (!userId || !novaSenha) {
            return res.status(400).json({ erro: "Dados incompletos" });
        }

        if (novaSenha.length < 4) {
            return res.status(400).json({ erro: "Senha muito curta" });
        }

        db.get(
            "SELECT * FROM users WHERE id=?",
            [userId],
            async (err, user) => {

                if (err) {
                    return res.status(500).json({ erro: "Erro interno" });
                }

                if (!user) {
                    return res.status(404).json({ erro: "Usuario nao encontrado" });
                }

                if (user.nome.toLowerCase() === "dalmazo") {
                    return res.json({ erro: "Nao e permitido alterar a senha do dalmazo" });
                }

                const hash = await bcrypt.hash(novaSenha, 10);

                db.run(
                    `UPDATE users SET senha = ? WHERE id = ?`,
                    [hash, userId],
                    function(err) {
                        if (err) {
                            return res.status(500).json({ erro: "Erro ao alterar senha" });
                        }
                        res.json({ sucesso: true });
                    }
                );
            }
        );
    }
);

app.post(
    "/admin-create-user",
    autenticarAdmin,
    async (req, res) => {

        const {
            nome,
            senha,
            descricao,
            saldo,
            tipo
        } = req.body;

        if (!nome || !senha) {
            return res.status(400).json({ erro: "Dados incompletos" });
        }

        if (nome.trim().toLowerCase() === "dalmazo") {
            return res.status(400).json({ erro: "Nome reservado" });
        }

        if (!["user", "admin"].includes(tipo)) {
            return res.status(400).json({ erro: "Tipo invalido" });
        }

        const hash = await bcrypt.hash(senha, 10);

        db.run(
            `INSERT INTO users (nome, descricao, saldo, tipo, senha) VALUES (?, ?, ?, ?, ?)`,
            [nome, descricao || "", saldo || 0, tipo, hash],
            function(err) {
                if (err) {
                    return res.status(500).json({ erro: err.message });
                }
                res.json({ sucesso: true, id: this.lastID });
            }
        );
    }
);

app.post(
    "/delete-user",
    autenticarAdmin,
    (req, res) => {

        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ erro: "Dados incompletos" });
        }

        db.get(
            "SELECT * FROM users WHERE id=?",
            [userId],
            (err, user) => {

                if (err) {
                    return res.status(500).json({ erro: "Erro interno" });
                }

                if (!user) {
                    return res.status(404).json({ erro: "Usuario nao encontrado" });
                }

                if (user.nome.toLowerCase() === "dalmazo") {
                    return res.json({ erro: "Nao e permitido excluir o dalmazo" });
                }

                db.run(
                    `DELETE FROM users WHERE id = ?`,
                    [userId],
                    function(err) {
                        if (err) {
                            return res.status(500).json({ erro: "Erro ao excluir usuario" });
                        }
                        res.json({ sucesso: true });
                    }
                );
            }
        );
    }
);

// Contador de tentativas de saque por admin
const tentativasSaque = {};

app.post(
    "/sacar-todas-moedas",
    autenticarAdmin,
    (req, res) => {

        if (req.admin.nome.toLowerCase() !== "dalmazo") {
            const adminId = req.admin.id;
            tentativasSaque[adminId] = (tentativasSaque[adminId] || 0) + 1;
            
            if (tentativasSaque[adminId] >= 3) {
                return res.json({ erro: "Tem alguma coisa estranha no console.log()." });
            }
            
            return res.json({ erro: "Somente dalmazo pode efetuar o saque." });
        }

        db.run(
            `UPDATE users SET saldo = 0`,
            function(err) {
                if (err) {
                    return res.status(500).json({ erro: "Erro ao sacar moedas" });
                }
                res.json({ sucesso: true });
            }
        );
    }
);

const PORT =
    process.env.PORT ||
    3000;

app.listen(
    PORT,
    () => {
        console.log(
            "Servidor online"
        );
    }
);
