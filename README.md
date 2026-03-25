# ECOAR Beyond - RPG Character Sheet

Sistema moderno de criação e gerenciamento de personagens para o RPG ECOAR, inspirado no D&D Beyond, construído com Next.js e Tailwind CSS.

## Features

- Wizard completo de criação de personagem com múltiplas etapas
- Ficha de personagem completa com todos os campos do sistema ECOAR
- Interface moderna com design limpo e intuitivo
- Layout responsivo para desktop e mobile
- Persistência de dados via API e banco PostgreSQL (Neon)
- Navegação fluida entre wizard e ficha de personagem
- Atualizações em tempo real com gerenciamento de estado React

## Getting Started

### Installation

First, install the dependencies:

```bash
npm install
```

### Environment variables

The app always uses the API and database. Create a `.env` file in the project root (never commit it) with:

- **`DATABASE_URL`** (obrigatório) – Connection string PostgreSQL, ex.: Neon.
- **`JWT_SECRET`** (obrigatório) – Chave para assinar os JWTs (ex.: `openssl rand -hex 32`).
- **`NEXT_PUBLIC_API_URL`** – Em desenvolvimento pode omitir (usa a mesma origem). Em produção defina a URL pública do app (ex.: `https://seu-app.vercel.app`) para as chamadas à API.
- **`RESEND_API_KEY`** – Chave da API do [Resend](https://resend.com) para envio de emails de confirmação (cadastro por email/senha).
- **`EMAIL_FROM`** – Endereço remetente dos emails (ex.: `noreply@seudominio.com` ou use o domínio do Resend).
- **`GOOGLE_CLIENT_ID`** e **`GOOGLE_CLIENT_SECRET`** – Credenciais OAuth 2.0 do [Google Cloud Console](https://console.cloud.google.com/apis/credentials) para login com Google.

### Para outras pessoas usarem

1. Faça o deploy do projeto (ex.: [Vercel](https://vercel.com)) conectando o repositório.
2. No painel do host, configure as variáveis de ambiente: `DATABASE_URL`, `JWT_SECRET` e `NEXT_PUBLIC_API_URL` (URL do deploy).
3. O banco deve estar criado (tabelas `users` e `characters` no Neon). Se ainda não rodou o SQL de criação, use o SQL Editor do Neon ou o script/migration do projeto.
4. Qualquer pessoa que acessar a URL do deploy poderá se cadastrar, fazer login e usar o app.

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the character sheet.

### Build

Build the application for production:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## Character Sheet Sections

The character sheet includes:

- **Níveis**: de Alma, de Poder, de Trilha
- **Informações**: Nome, Moeda, Raça, Pontos de Evolução
- **Traços de Personalidade**: Positivo e Negativo
- **Deslocamentos**: Terrestre, Aquático, Aéreo
- **Limites**: Corpo, Mente, Fôlego, Mana
- **Atributos**: Carisma, Finesse, Força, Inteligência, Percepção, Vitalidade, Vontade
- **Sentidos**: Visão, Audição, Olfato
- **Resistências**: Geral, Membros, Cabeça
- **Ataques**: Dois slots com alcance e dano
- **Aptidões**: Arcana, Lethalis, Natura, Vox
- **Habilidades**: Combate, Primárias, Artísticas, Científicas, Gerais, Motoras, Sociais
- **Equipamentos e Anotações**

## Tech Stack

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React** - UI library

## Project Structure

```
Projeto-ecoar/
├── app/
│   ├── globals.css              # Global styles and Tailwind imports
│   ├── layout.tsx               # Root layout component
│   └── page.tsx                 # Main page with wizard/sheet routing
├── components/
│   ├── CharacterSheet.tsx       # Main character sheet component
│   ├── CharacterCreationWizard.tsx  # Complete character creation wizard
│   ├── Header.tsx               # Navigation header
│   └── Footer.tsx               # Footer component
├── data/                        # Game data (races, classes, skills, etc.)
├── lib/
│   └── calculations.ts          # Game calculation utilities
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

## Melhorias Implementadas

- ✅ Removido componente `CharacterCreation.tsx` não utilizado
- ✅ Removidas dependências não utilizadas (`@tabler/icons-react`, `clsx`, `tailwind-merge`)
- ✅ Removida pasta `contexts` vazia
- ✅ Limpeza de arquivos lock duplicados
- ✅ Adicionado botão de edição na ficha do personagem
- ✅ Melhorada navegação com Header funcional
- ✅ Persistência via API e banco PostgreSQL (Neon)
- ✅ Fluxo intuitivo entre wizard e ficha de personagem
- ✅ Sistema de autenticação (login/registro) e fichas na API
- ✅ Dashboard de gerenciamento de personagens
