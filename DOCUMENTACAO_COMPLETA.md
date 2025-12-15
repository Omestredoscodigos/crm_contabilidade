# 📘 Guia de Instalação ContabilFlow CRM v2.5

O ContabilFlow é uma solução completa para contadores, rodando em Node.js com MySQL.

---

## 🏗️ 1. Instalação no cPanel (Hospedagem Comum)

### Passo 1: Preparar o Banco de Dados
1. No cPanel, vá em **Bancos de Dados MySQL®**.
2. Crie um banco (ex: `usuario_crm`) e um usuário.
3. No **phpMyAdmin**, selecione seu banco e clique em **Importar**.
4. Selecione o arquivo `database.sql` deste projeto e clique em **Executar**.

### Passo 2: Configurar o App Node.js
1. No cPanel, procure por **Setup Node.js App**.
2. Clique em **Create Application**.
   - **Node.js version**: Selecione 18 ou superior.
   - **Application mode**: Production.
   - **Application root**: O nome da pasta onde subiu os arquivos (ex: `public_html/crm`).
   - **Application URL**: O domínio ou subdomínio.
   - **Application startup file**: `server.js`.
3. Clique em **Create**.

### Passo 3: Variáveis de Ambiente (.env)
1. No Gerenciador de Arquivos, abra o arquivo `.env` e preencha:
   ```env
   DB_HOST=localhost
   DB_USER=usuario_banco
   DB_PASSWORD=senha_banco
   DB_NAME=nome_banco
   API_KEY=sua_chave_gemini_aqui
   PORT=3000
   ```
2. No painel do Node.js App, clique em **Run JS Install** para baixar as dependências e depois em **Restart**.

---

## 🏗️ 2. Instalação em VPS (Ubuntu 22.04+)

### Passo 1: Dependências
```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs mysql-server nginx
```

### Passo 2: Configuração
1. Suba os arquivos para `/var/www/contabilflow`.
2. Rode `npm install`.
3. Configure o banco via terminal: `mysql -u root -p < database.sql`.
4. Configure o PM2:
   ```bash
   sudo npm install -g pm2
   pm2 start server.js --name "crm"
   pm2 save
   pm2 startup
   ```

### Passo 3: Nginx Proxy
Aponte seu domínio para `localhost:3000` na configuração do Nginx para habilitar acesso via porta 80/443.

---
© 2024 ContabilFlow - Sistema de Gestão Contábil de Alta Performance.