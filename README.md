# 🧩 bcrypt CTF Challenge — www.dalmazo.com

Oi! Agora estamos oficialmente brincando com hashes e ilusões de segurança.

Este repositório contém um desafio de CTF baseado em **bcrypt**, onde a missão é simples na teoria:

> "Encontre a senha e saque as dalmacoins."

---

## 🚀 Como rodar

### Pré-requisitos

- [Node.js](https://nodejs.org/) (v16 ou superior)
- npm (vem junto com o Node.js)

### Passo a passo

```bash
# 1. Entre na pasta do backend
cd backend

# 2. Instale as dependências
npm install

# 3. Inicie o servidor
node server.js
```

O servidor vai rodar em `http://localhost:3000`

### Usuários iniciais

| Usuário | Senha | Tipo | Saldo |
|---------|-------|------|-------|
| admin | admin123 | admin | 1000 |
| dalmazo | bubblestar | admin | 100 |
| joao | 1234 | user | 100 |
| maria | CryptoMari@! | user | 100 |

---

## 🔐 O desafio

Os hashes estão no formato bcrypt.

Tradução rápida:

- `$2b$` → bcrypt moderno
- `08` → custo médio
- resto → salt + hash

---

## 🧠 Ferramentas do jogo

### 💥 Quebra de hash

Hashcat (password recovery tool)

Ferramenta usada para ataques de dicionário com wordlists como rockyou.txt.

Exemplo:

```bash
hashcat -m 3200 -w 3 hashes.txt rockyou.txt
```
---

### 🕵️ Análise de metadados

ExifTool (metadata analysis tool)

Bom, não é só hash importa… 

Essa ferramenta pode ser usada quando:
- arquivos anexados existem
- imagens suspeitas aparecem
- metadata pode esconder pistas

Exemplo:

```bash
exiftool -a -u -g1 arquivo.png
```
