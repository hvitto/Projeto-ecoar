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

### Modo demonstração

`OFFLINE_DEMO_MODE` em [`lib/config.ts`](lib/config.ts): `true` = perfis demo + localStorage; `false` = auth API + Neon.

### Environment variables

Copie [`.env.example`](.env.example) para **`.env.local`** na raiz do projeto (nunca commite esses arquivos).

- **`JWT_SECRET`** (obrigatório) – Chave para assinar os JWTs (ex.: `openssl rand -hex 32`).
- **`DATABASE_URL`** (obrigatório em produção) – Connection string PostgreSQL, ex.: Neon.
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

- **Next.js 16** - App Router, API routes
- **React 18** - UI (componentes client/server)
- **TypeScript** - `strict` mode
- **Tailwind CSS** - Estilos
- **Vitest** - Testes de hooks/lib

## Rotas principais

| Rota | Uso |
|------|-----|
| `/` | Login e registro |
| `/personagens` | Dashboard de fichas |
| `/personagens/novo` | Wizard de criação (`?step=`) |
| `/personagens/[id]` | Ficha do personagem |
| `/personagens/[id]/editar` | Wizard de edição |
| `/personagens/[id]/evolucao` | Tela de evolução |
| `/mesas/[id]` | Mesa (lista; ficha/wizard via rotas de personagem) |

Bookmarks legados `/?view=...` redirecionam para `/personagens/*`.

## Convenções de código

- **UI:** preferir arquivos com até ~400 linhas; lógica pesada em `lib/` ou `features/*/hooks`.
- **Domínio personagem:** `features/character/` (páginas, reducer do wizard, hooks da ficha).
- **Wizard:** shell em `components/wizard/CharacterCreationWizard.tsx`; steps em `components/wizard/steps/`.
- **Ficha:** shell em `components/CharacterSheet.tsx`; seções em `components/sheet/sections/` (extração incremental).

## Project Structure

```
Projeto-ecoar/
├── app/
│   ├── page.tsx                 # Auth (login/registro)
│   ├── personagens/             # Fluxo de personagem
│   └── mesas/                   # Mesas de jogo
├── components/
│   ├── wizard/                  # Wizard fatiado (steps + shell)
│   ├── sheet/sections/          # Seções da ficha
│   └── CharacterSheet.tsx       # Shell da ficha
├── features/character/          # Tipos, páginas, reducer, hooks
├── data/                        # Dados estáticos do jogo
├── lib/                         # Cálculos, API, auth
└── package.json
```

## Testes

```bash
npm test
```

Cobertura atual: reducer de navegação do wizard (`features/character/wizard/wizardReducer.test.ts`).

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
