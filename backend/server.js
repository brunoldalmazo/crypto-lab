const express = require("express");
const cors = require("cors");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const app = express();

app.use(cors());
app.use(express.json());

app.use(
    express.static(
        path.join(__dirname, "public")
    )
);

const db = new sqlite3.Database(
    "./database.db"
);

db.serialize(() => {

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
                        'Administrador',
                        1000,
                        'admin',
                        '1234'
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
                        'carol',
                        'Aluno',
                        100,
                        'user',
                        'carol'
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
                        'Aluno',
                        100,
                        'user',
                        'joao'
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
                        'Aluno',
                        100,
                        'user',
                        'maria'
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

app.post("/register", (req, res) => {

    const {
        nome,
        senha
    } = req.body;

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
        [nome, senha],

        function(err) {

            if (err) {
                return res.status(500).json({
                    erro: err.message
                });
            }

            res.json({
                sucesso: true,
                id: this.lastID
            });
        }
    );
});

app.post("/login", (req, res) => {

    const {
        nome,
        senha
    } = req.body;

    const query = `
        SELECT * FROM users
        WHERE nome = '${nome}'
        AND senha = '${senha}'
    `;

    console.log(query);

    db.get(
        query,

        (err, row) => {

            if (!row) {

                return res.status(401).json({
                    erro: "Login invalido"
                });
            }

            res.json(row);
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

    db.get(
        "SELECT * FROM users WHERE id=?",
        [fromId],

        (err, from) => {

            if (!from) {

                return res.status(404).json({
                    erro: "Usuario nao encontrado"
                });
            }

            if (from.tipo !== "admin") {

                return res.status(403).json({
                    erro: "Sem permissao"
                });
            }

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
});

app.post("/alterar-cargo", (req, res) => {

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
                admin.tipo !== "admin"
            ) {

                return res.status(403).json({
                    erro: "Sem permissao"
                });
            }

            db.run(
                `
                UPDATE users
                SET tipo = ?
                WHERE id = ?
                `,
                [novoTipo, userId],

                function() {

                    res.json({
                        sucesso: true
                    });
                }
            );
        }
    );
});

app.post("/admin-transfer", (req, res) => {

    const {
        adminId,
        fromId,
        toId,
        valor
    } = req.body;

    db.get(
        "SELECT * FROM users WHERE id=?",
        [adminId],

        (err, admin) => {

            if (
                !admin ||
                admin.tipo !== "admin"
            ) {

                return res.status(403).json({
                    erro: "Sem permissao"
                });
            }

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
});

app.post("/alterar-senha", (req, res) => {

    const {
        adminId,
        userId,
        novaSenha
    } = req.body;

    db.get(
        "SELECT * FROM users WHERE id=?",
        [adminId],

        (err, admin) => {

            if (
                !admin ||
                admin.tipo !== "admin"
            ) {

                return res.status(403).json({
                    erro: "Sem permissao"
                });
            }

            db.run(
                `
                UPDATE users
                SET senha = ?
                WHERE id = ?
                `,
                [novaSenha, userId],

                function() {

                    res.json({
                        sucesso: true
                    });
                }
            );
        }
    );
});

app.post("/admin-create-user", (req, res) => {

    const {
        adminId,
        nome,
        senha,
        descricao,
        saldo,
        tipo
    } = req.body;

    db.get(
        "SELECT * FROM users WHERE id=?",
        [adminId],

        (err, admin) => {

            if (
                !admin ||
                admin.tipo !== "admin"
            ) {

                return res.status(403).json({
                    erro: "Sem permissao"
                });
            }

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
                    senha
                ],

                function(err) {

                    if (err) {

                        return res.json({
                            erro: err.message
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
});

app.post("/delete-user", (req, res) => {

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
                admin.tipo !== "admin"
            ) {

                return res.status(403).json({
                    erro: "Sem permissao"
                });
            }

            db.run(
                `
                DELETE FROM users
                WHERE id = ?
                `,
                [userId],

                function() {

                    res.json({
                        sucesso: true,
                        removidos: this.changes
                    });
                }
            );
        }
    );
});

const PORT =
    process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Servidor online");
});
