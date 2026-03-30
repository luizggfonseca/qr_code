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

## Atualização Visal: Tema Light Offwhite (30/03/2026)
- **Migração de Tema**: O sistema foi migrado de um tema escuro para um tema light "Offwhite" (`#fdfdfd`) para um visual mais limpo e comercial.
- **Tipografia**: O título principal "Gerador PRO" foi alterado para azul marinho escuro (`#0f172a`) a pedido do usuário.
- **Glassmorphism 2.0**: Os efeitos de vidro foram recalibrados para funcionar sobre fundos claros, utilizando bordas sutis e sombras suaves.
- **Segmented Control**: Implementado um novo seletor de modalidade PIX (Estático/Dinâmico) com visual de botões de segmento.
- **Reorganização de Layout**: A pedidos do usuário, a seção de criação de novos QR Codes foi movida para o topo da página, ficando acima da lista de códigos já gerados.



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
- [x] **Configuração para Vercel**: Adição de notas de deploy e preparação de variáveis de ambiente.
- [x] **Sistema de Ordenação Profissional**: Implementada ordenação dinâmica por Nome, Tipo e Data.
- [x] **PIX 2.0**: Suporte total a chaves Estáticas (Payload EMV) e Dinâmicas (Location URLs).
- [x] **Sincronização com GitHub**: Realizado o commit e push de todas as novas funcionalidades e melhorias.

### 9.1. Procedimento de Upload

1. `git pull origin main` (Sincronização preventiva).
2. `git add .` para rastrear todos os novos arquivos e modificações de design.
3. `git commit -m "feat: professional PIX modes, advanced sorting and total light theme refactor"`
4. `git push origin main`

## 10. Conclusão da Fase Atual

O projeto "Gerador PRO" agora conta com uma base sólida para uso comercial, com layout clean, sistema de sorting eficiente e suporte ao padrão bancário brasileiro para PIX. A documentação foi totalmente atualizada para refletir o estado de excelência alcançado.

## 11. Edição de QR Codes Gerados (Novo) - Concluído ✅

*   **Persistência de Estado (form_data)**: Adicionada nova coluna JSON `form_data` ao banco de dados SQLite para permitir que os QR codes já gerados possam ser editados com seus dados originais preservados.
*   **API PUT (Update)**: Evolução do endpoint individual para suportar `FormData`, permitindo atualizar títulos, metadados e arquivos (PDF/Fotos) de forma reativa.
*   **Interface de Edição**: Criação da rota dinâmica `/edit/[id]` que carrega o formulário original pré-preenchido.
*   **Novo Botão de Ação**: Ícone de edição (`Edit2`) integrado em cada card na listagem principal.

---
Documento atualizado em: 30/03/2026

