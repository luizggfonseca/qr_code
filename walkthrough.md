# Walkthrough - Gerador de QR Code

## 1. Introdução

Este projeto é um gerador de QR Code avançado capaz de criar códigos para diversos tipos de dados: Eventos, Cartões de Visita, Endereços, Telefones, WiFi, PDF e Fotos.

## 2. Tecnologias Utilizadas

- **Frontend**: Next.js (App Router)
- **Estilização**: Vanilla CSS (CSS Modules)
- **Banco de Dados**: SQLite
- **Linguagem**: TypeScript
- **Bibliotecas**: `qrcode` (para geração do código)

## 3. Planejamento da Estrutura

O projeto será dividido em:

- `/src/app`: Páginas e rotas da API.
- `/src/components`: Componentes reutilizáveis (Formulários, Visualizador de QR Code).
- `/src/lib`: Lógica de banco de dados e utilitários.
- `/public/uploads`: Armazenamento local de arquivos e fotos.

## 4. Progresso Atual

- [x] Inicialização do projeto Next.js.
- [x] Instalação de dependências (`qrcode`, `better-sqlite3`, `lucide-react`).
- [x] Configuração do banco de dados SQLite.
- [x] Design System base com CSS Variables e Glassmorphism.
- [x] Interface de criação de QR Code (vCard, WiFi, Eventos, etc.).
- [x] Lógica de upload de arquivos (PDF/Fotos).
- [x] Visualização e download de QR Codes.
- [x] Modal de exclusão estilizado com confirmação.
- [x] Novos tipos: WhatsApp, PIX, Instagram, LinkedIn, YouTube, Email, SMS.
- [x] Customização PRO: Seleção de cores (Dark/Light) do QR Code.
- [x] Sistema de Busca e Filtros na Home.
- [x] Modo de Impressão A4 dedicado.
- [x] Landing Page (Viewer) para arquivos PDF e Fotos.

## 5. Arquitetura de Dados

A tabela `qr_codes` no SQLite (`database.sqlite`) armazena:

- `type`: O tipo de informação (ex: 'wifi', 'vcard').
- `content`: O conteúdo bruto ou formatado (ex: string WIFI, vCard string).
- `file_path`: Caminho para o arquivo em `public/uploads/` para PDF e Fotos.
- `title`: Nome amigável dado pelo usuário.

## 6. Diário de Desenvolvimento e Desafios

### 6.1. Erros Encontrados e Soluções

- **Erro de Sobrescrita de Arquivos**: Durante a geração inicial do código, houve uma tentativa de criar o arquivo `page.module.css` que já existia por padrão no Next.js.
  - _Solução_: O sistema foi instruído a utilizar o sinalizador `Overwrite: true` para garantir que o design customizado substituísse o padrão do framework.
- **Incompatibilidade de CSS (Vendor Prefixes)**: O linter detectou a falta da propriedade padrão `background-clip` ao usar a versão `-webkit-background-clip` para o efeito de texto em gradiente.
  - _Solução_: Adicionada a propriedade padrão para garantir compatibilidade entre navegadores modernos e silenciar avisos de lint.
- **Porta Ocupada ou Lentidão no Boot**: Durante os testes automatizados, o servidor Next.js levou mais tempo do que o esperado para responder na porta 3000.
  - _Solução_: Reinicialização do processo `npm run dev` e validação manual pelo usuário.
- **Falha na Deleção (Next.js 15 API)**: A API de deleção falhava porque esperava `params.id` de forma síncrona, mas o Next.js 15 exige que `params` seja uma Promise.
  - _Solução_: Refatoração da rota DELETE para ser assíncrona e aguardar a Promise de params.
- **Cores Customizadas**: O componente de QR Code agora suporta cores dinâmicas salvas no banco de dados.
  - _Solução_: Adição de colunas `color` e `bgcolor` no SQLite e atualização do `QRCodeComponent`.
- **Arquivos Dinâmicos**: QR Codes de arquivos agora levam a uma página de visualização (`/view/[id]`) em vez de abrir o arquivo bruto.
  - _Solução_: Criação de uma Landing Page Viewer com suporte a iframe para PDF e galeria para fotos.
- **Gestão de Muitos Códigos**: Com o aumento dos tipos, o painel podia ficar poluído.
  - _Solução_: Implementação de barra de busca em tempo real e filtros por categoria.

### 6.2. Decisões de Arquitetura

- **Next.js (App Router)**: Escolhido por permitir rotas de API integradas e renderização híbrida.
- **better-sqlite3**: Utilizado pela sua performance superior em Node.js comparado a drivers assíncronos puramente JavaScript, ideal para aplicações que rodam em sistemas de arquivos locais.
- **Atomic Design Simples**: Os formulários foram encapsulados no componente `CreateForm.tsx` para facilitar a manutenção de múltiplos tipos de QR Code em um único lugar lógico.

## 7. Persistência e Deploy (Análise Crítica)

- **Vercel**: O projeto funciona perfeitamente, mas o SQLite será resetado a cada novo deploy ou após períodos de inatividade (cold start), pois o sistema de arquivos do Vercel é efêmero.
  - _Recomendação_: Se o volume de dados crescer, trocar o arquivo local pelo **Turso** (SQLite na nuvem).
- **GitHub Pages**: Não é compatível nativamente sem uma refatoração para "Static Export", o que desativaria as funcionalidades de banco de dados e upload. Para rodar no GitHub Pages, os dados deveriam ser salvos no `localStorage` do navegador.

## 8. Como Executar Localmente

1. Instale as dependências: `npm install`
2. Inicie o servidor: `npm run dev`
3. Acesse `http://localhost:3000`

## 9. Atualização e Documentação Profissional

- [x] **Criação do README Profissional**: Implementado um README detalhado com banner personalizado, tabela de funcionalidades e guia de tecnologias.
- [x] **Design do Banner**: Gerado um banner premium com estética Glassmorphism para o repositório.
- [x] **Sincronização com GitHub**: Realizado o commit e push de todas as novas funcionalidades e melhorias para o repositório remoto.

### 9.1. Procedimento de Upload

1. `git add .` para rastrear todos os novos arquivos (incluindo o banco SQLite e uploads de teste).
2. `git commit -m "feat: implement professional documentation and sync project updates"`
3. `git push origin main`

