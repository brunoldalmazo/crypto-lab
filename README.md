# 🧩 bcrypt CTF Challenge — www.dalmazo.com

Oi! Agora estamos oficialmente brincando com hashes e ilusões de segurança.

Este repositório contém um desafio de CTF baseado em **bcrypt**, onde a missão é simples na teoria:

> “Encontre a senha e saque as dalmacoins.”

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
