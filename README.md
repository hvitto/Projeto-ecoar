# Eco Beyond - RPG Character Sheet

A modern, D&D Beyond-inspired character sheet built with Next.js and Tailwind CSS.

## Features

- Complete character sheet with all fields from your Portuguese RPG system
- D&D Beyond-style UI with clean, modern design
- Responsive layout that works on desktop and mobile
- Real-time form updates with React state management

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
eco-beyond/
├── app/
│   ├── globals.css      # Global styles and Tailwind imports
│   ├── layout.tsx       # Root layout component
│   └── page.tsx         # Main page with character sheet
├── components/
│   └── CharacterSheet.tsx  # Main character sheet component
├── package.json
├── tailwind.config.js
└── tsconfig.json
```
