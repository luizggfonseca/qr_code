# 🚀 Gerador PRO - QR Code Inteligente

## 📋 Sobre o Projeto

O **Gerador PRO** é uma aplicação web de alta performance desenvolvida com **Next.js 15**, focada na criação, gestão e customização profissional de QR Codes. A plataforma oferece suporte avançado para pagamentos via **PIX (Padrão Banco Central)**, vCards, WiFi e compartilhamento de arquivos com Landing Pages exclusivas.

Este projeto utiliza uma estética moderna **Offwhite & Navy Blue**, com interações suaves e um sistema de gerenciamento robusto.

---

## ✨ Funcionalidades Principais

| Recurso | Detalhes |
| :--- | :--- |
| **💳 PIX Profissional** | Suporte a **PIX Estático** (valor fixo) e **Dinâmico** (URLs de cobrança/Location). |
| **🔍 Gestão Inteligente** | Filtre e ordene seus códigos por **Nome**, **Tipo** ou **Data**. |
| **🎨 Design Premium** | Tema claro (Offwhite) com tipografia Navy Blue e efeitos Glassmorphism. |
| **📄 PDF & Foto Sync** | Hospedagem de arquivos com visualização em Landing Page dedicada. |
| **📶 WiFi & vCard** | Compartilhamento rápido de redes e contatos profissionais. |
| **📱 Social Connect** | WhatsApp, Instagram, LinkedIn e YouTube com payloads otimizados. |
| **🖨️ Print Ready** | Layout otimizado para impressão imediata em alta resolução. |

---

## 🛠️ Tecnologias Utilizadas

- **Core**: [Next.js 15](https://nextjs.org/) (App Router & Turbopack)
- **Linguagem**: [TypeScript](https://www.typescriptlang.org/)
- **Banco de Dados**: [SQLite](https://sqlite.org/) (Persistência local leve)
- **Estilização**: CSS Modules (Vanilla CSS moderno)
- **Ícones**: [Lucide React](https://lucide.dev/)
- **Geração**: `qrcode` (Engine robusta)

---

## 🚀 Como Executar o Projeto

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/luizggfonseca/qr_code.git
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

4. **Acesse no navegador:**
   Abra [http://localhost:3000](http://localhost:3000)

---

## 📁 Estrutura do Projeto

- `src/app`: Rotas, APIs e páginas da aplicação.
- `src/components`: UI Components (Pills, Modais, Preview).
- `src/lib`: Lógica de PIX (EMV QRCPS) e DB Helpers.
- `public/uploads`: Armazenamento de mídia local.

---

## 🌍 Deploy (Vercel)

Para realizar o deploy na Vercel:
1. Conecte seu repositório GitHub ao painel da Vercel.
2. Certifique-se de que a variável de ambiente `NEXT_PUBLIC_URL` está configurada com o link de produção.
3. *Nota*: Como o projeto utiliza SQLite local para persistência simples, os dados salvos serão resetados a cada novo deploy. Para persistência permanente, recomenda-se a migração para [Turso](https://turso.tech).

---

## 📝 Licença

Este projeto é de uso livre para fins de estudo e desenvolvimento pessoal.

---

Desenvolvido por **Luiz G G Fonseca** 🚀
