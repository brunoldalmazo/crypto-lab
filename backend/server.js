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

app.get("/users", (req, res) => {

    db.all(
        "SELECT * FROM users",
        (err, rows) => {

            res.json(rows);
        }
    );
});

app.post("/transferir", (req, res) => {

    const {
        fromId,
        toId,
        valor
    } = req.body;

    db.run(
        `
        UPDATE users
        SET saldo = saldo - ?
        WHERE id = ?
        `,
        [valor, fromId]
    );

    db.run(
        `
        UPDATE users
        SET saldo = saldo + ?
        WHERE id = ?
        `,
        [valor, toId]
    );

    res.json({
        sucesso: true
    });
});

app.post(
    "/alterar-cargo",
    (req, res) => {

        const {
            adminId,
            userId,
            novoTipo
        } = req.body;

        db.get(
            "SELECT * FROM users WHERE id=?",
            [adminId],
            (err, admin) => {

                if (
                    !admin ||
                    admin.tipo !==
                        "admin"
                ) {
                    return res.json({
                        erro:
                            "Sem permissao"
                    });
                }

                db.get(
                    "SELECT * FROM users WHERE id=?",
                    [userId],
                    (
                        err,
                        user
                    ) => {

                        if (!user) {
                            return res.json({
                                erro:
                                    "Usuario nao encontrado"
                            });
                        }

                        if (
                            user.nome.toLowerCase() ===
                                "dalmazo" &&
                            novoTipo !==
                                "admin"
                        ) {
                            return res.json({
                                erro:
                                    "Nao e permitido alterar o cargo do dalmazo"
                            });
                        }

                        db.run(
                            `
                            UPDATE users
                            SET tipo = ?
                            WHERE id = ?
                            `,
                            [
                                novoTipo,
                                userId
                            ],
                            function(
                                err
                            ) {

                                if (
                                    err
                                ) {
                                    return res.json(
                                        {
                                            erro:
                                                "Erro ao alterar cargo"
                                        }
                                    );
                                }

                                res.json(
                                    {
                                        sucesso: true
                                    }
                                );
                            }
                        );
                    }
                );
            }
        );
    }
);

app.post(
    "/admin-transfer",
    (req, res) => {

        const {
            fromId,
            toId,
            valor
        } = req.body;

        db.run(
            `
            UPDATE users
            SET saldo = saldo - ?
            WHERE id = ?
            `,
            [valor, fromId]
        );

        db.run(
            `
            UPDATE users
            SET saldo = saldo + ?
            WHERE id = ?
            `,
            [valor, toId]
        );

        res.json({
            sucesso: true
        });
    }
);

app.post(
    "/alterar-senha",
    async (req, res) => {

        const {
            adminId,
            userId,
            novaSenha
        } = req.body;

        db.get(
            "SELECT * FROM users WHERE id=?",
            [adminId],
            async (
                err,
                admin
            ) => {

                if (
                    !admin ||
                    admin.tipo !==
                        "admin"
                ) {
                    return res.json({
                        erro:
                            "Sem permissao"
                    });
                }

                db.get(
                    "SELECT * FROM users WHERE id=?",
                    [userId],
                    async (
                        err,
                        user
                    ) => {

                        if (!user) {
                            return res.json({
                                erro:
                                    "Usuario nao encontrado"
                            });
                        }

                        if (
                            user.nome.toLowerCase() ===
                            "dalmazo"
                        ) {
                            return res.json({
                                erro:
                                    "Nao e permitido alterar a senha do dalmazo"
                            });
                        }

                        const hash =
                            await bcrypt.hash(
                                novaSenha,
                                10
                            );

                        db.run(
                            `
                            UPDATE users
                            SET senha = ?
                            WHERE id = ?
                            `,
                            [
                                hash,
                                userId
                            ],
                            function(
                                err
                            ) {

                                if (
                                    err
                                ) {
                                    return res.json(
                                        {
                                            erro:
                                                "Erro ao alterar senha"
                                        }
                                    );
                                }

                                res.json(
                                    {
                                        sucesso: true
                                    }
                                );
                            }
                        );
                    }
                );
            }
        );
    }
);

app.post(
    "/admin-create-user",
    async (
        req,
        res
    ) => {

        const {
            nome,
            senha,
            descricao,
            saldo,
            tipo
        } = req.body;

        if (
            nome
                .trim()
                .toLowerCase() ===
            "dalmazo"
        ) {
            return res.json({
                erro:
                    "Nome reservado"
            });
        }

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
                ?,
                ?,
                ?,
                ?
            )
            `,
            [
                nome,
                descricao,
                saldo,
                tipo,
                hash
            ],

            function(err) {

                if (err) {
                    return res.json({
                        erro:
                            err.message
                    });
                }

                res.json({
                    sucesso: true,
                    id:
                        this.lastID
                });
            }
        );
    }
);

app.post(
    "/delete-user",
    (req, res) => {

        const {
            adminId,
            userId
        } = req.body;

        db.get(
            "SELECT * FROM users WHERE id=?",
            [adminId],
            (err, admin) => {

                if (
                    !admin ||
                    admin.tipo !==
                        "admin"
                ) {
                    return res.json({
                        erro:
                            "Sem permissao"
                    });
                }

                db.get(
                    "SELECT * FROM users WHERE id=?",
                    [userId],
                    (
                        err,
                        user
                    ) => {

                        if (!user) {
                            return res.json({
                                erro:
                                    "Usuario nao encontrado"
                            });
                        }

                        if (
                            user.nome.toLowerCase() ===
                            "dalmazo"
                        ) {
                            return res.json({
                                erro:
                                    "Nao e permitido excluir o dalmazo"
                            });
                        }

                        db.run(
                            `
                            DELETE FROM users
                            WHERE id = ?
                            `,
                            [
                                userId
                            ],
                            function(
                                err
                            ) {

                                if (
                                    err
                                ) {
                                    return res.json(
                                        {
                                            erro:
                                                "Erro ao excluir usuario"
                                        }
                                    );
                                }

                                res.json(
                                    {
                                        sucesso: true
                                    }
                                );
                            }
                        );
                    }
                );
            }
        );
    }
);

app.post(
    "/sacar-todas-moedas",
    (req, res) => {

        const { adminId } = req.body;

        db.get(
            "SELECT * FROM users WHERE id=?",
            [adminId],
            (err, user) => {

                if (!user) {
                    return res.json({
                        erro: "Usuario nao encontrado"
                    });
                }

                db.run(
                    `
                    UPDATE users
                    SET saldo = 0
                    `,
                    function(err) {

                        if (err) {
                            return res.json({
                                erro: "Erro ao sacar moedas"
                            });
                        }

                        res.json({
                            sucesso: true
                        });
                    }
                );
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
