# 🚀 Guia de Deploy - ContabilFlow CRM

## 📂 Como publicar no cPanel (VPS/Hospedagem)

1. **Acesse o Gerenciador de Arquivos:** No seu cPanel, vá até a pasta `public_html` (ou a subpasta onde deseja instalar o CRM).
2. **Upload dos Arquivos:** Envie todos os arquivos deste projeto para a pasta.
3. **Verificação do .htaccess:** Certifique-se de que o arquivo `.htaccess` foi enviado. Se não o vir, verifique se "Mostrar arquivos ocultos" está ativo nas configurações do Gerenciador de Arquivos.
4. **SSL (HTTPS):** É altamente recomendado que o seu domínio tenha um certificado SSL ativo (Let's Encrypt gratuito no cPanel), pois as APIs do Google e o acesso à câmera exigem conexão segura.
5. **API Keys:** Lembre-se de configurar as chaves do Google Calendar no painel de Configurações dentro do próprio CRM após o primeiro acesso.

## ⚙️ Requisitos
- Servidor Apache ou Nginx (O `.htaccess` fornecido é para Apache).
- PHP ou Node.js NÃO são necessários para a execução, pois o app é 100% Client-Side.

---
© 2024 ContabilFlow SaaS • A Nova Era Contábil