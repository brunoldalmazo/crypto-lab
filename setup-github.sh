#!/bin/bash

# Script para configurar e subir o projeto Crypto Lab para o GitHub
# Uso: bash setup-github.sh SEU_USUARIO_GITHUB

if [ -z "$1" ]; then
    echo "Uso: bash setup-github.sh SEU_USUARIO_GITHUB"
    exit 1
fi

GITHUB_USER=$1
REPO_NAME="crypto-lab"

echo "=== Configurando Git ==="
git config --global user.name "$GITHUB_USER"
git config --global user.email "$GITHUB_USER@users.noreply.github.com"

echo "=== Inicializando repositório ==="
git init

echo "=== Adicionando arquivos ==="
git add .

echo "=== Fazendo commit ==="
git commit -m "Crypto Lab CTF - Versão validada e corrigida

- Contador de tentativas no endpoint /sacar-todas-moedas
- Remoção de hashes de senha do endpoint /usersx
- Melhoria na autenticação (validação de userId)
- Remoção de dados sensíveis do localStorage
- Código duplicado movido para app.js
- Tratamento de erros adicionado
- Verificação de tipo de usuário no backend"

echo "=== Criando repositório no GitHub ==="
echo "Crie um repositório vazio em: https://github.com/new"
echo "Nome sugerido: $REPO_NAME"
echo ""
echo "Depois de criar, execute:"
echo "  git remote add origin https://github.com/$GITHUB_USER/$REPO_NAME.git"
echo "  git branch -M main"
echo "  git push -u origin main"
