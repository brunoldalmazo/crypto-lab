/*
    Backup exportado manualmente
    Admin: admin
    Data: 20/03/2026
    TODO:
    - revisar usuários
    - apagar este arquivo depois do deploy
*/
const users = [
    {
        id: 1,
        nome: "admin",
        descricao: "Admin newbie",
        saldo: 1000,
        tipo: "admin",
        senha:
            "???" /* "Dalmazo disse que o newbie costumava guardar a senha em uma figura! */
    },

    {
        id: 2,
        nome: "maria",
        descricao: "Aluno com senha forte",
        saldo: 100,
        tipo: "user",
        senha:
            "$2b$10$qCMitotrxsCsDkfNIB/Sv.VOHrLlrxqd.I2d0jPWspXIQLyTnNcLa"
    },

    {
        id: 3,
        nome: "joao",
        descricao: "Aluno com senha fraca",
        saldo: 100,
        tipo: "user",
        senha:
            "1234"
    },

    {
        id: 4,
        nome: "dalmazo",
        descricao: "Admin master",
        saldo: 100,
        tipo: "admin",
        senha:
            "???" /* Hash de senha com 8 caracteres se quebra em menos de 1h por força bruta... será? */
    }
];
