# ECOAR Beyond - RPG Character Sheet

Sistema moderno de criação e gerenciamento de personagens para o RPG ECOAR, inspirado no D&D Beyond, construído com Next.js e Tailwind CSS.

## Features

- Wizard completo de criação de personagem com múltiplas etapas
- Ficha de personagem completa com todos os campos do sistema ECOAR
- Interface moderna com design limpo e intuitivo
- Layout responsivo para desktop e mobile
- Persistência de dados no localStorage
- Navegação fluida entre wizard e ficha de personagem
- Atualizações em tempo real com gerenciamento de estado React

## Getting Started

### Installation

First, install the dependencies:

```bash
npm install
```

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
- **Informações**: Nome, Genus, Moeda, Raça, Pontos de Evolução
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
- ✅ Implementada persistência de dados no localStorage
- ✅ Fluxo intuitivo entre wizard e ficha de personagem
