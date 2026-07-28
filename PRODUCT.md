# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Jogadores de ECOAR (RPG de mesa) que precisam criar e usar fichas sem atrito; mestres experientes que esperam o mesmo fluxo fluido. Situação típica: sessão de criação de personagem ou consulta rápida à ficha durante o jogo.

## Product Purpose

ECOAR + é o companion digital do RPG de mesa ECOAR. Existe para tornar a criação, gestão e uso de fichas de personagem fáceis e divertidas — sem ser chato para jogador nem para mestre.

Sucesso: um usuário e um mestre experiente pensarem “esse sistema é realmente divertido e fácil de usar.”

## Positioning

Companion digital feito para as regras e o mundo de ECOAR (raças, atributos, habilidades, aptidões, PC, escolas marciais, trilhas, Ecoar/imortais, singularidades) — não um gerador genérico de ficha. O diferencial é fluidez no processo de criação e uso da ficha.

## Operating Context

- Fluxo principal desta reconstrução: landing → criação de personagem (wizard) → ficha.
- Auth e mesas existem no produto atual; nesta fase ficam fora do núcleo prioritário (podem entrar depois).
- Catálogo do livro vive em dados estáticos (`data/*`) com hydrate opcional via Neon; cálculos em `lib/`.
- Sessões de mesa físicas/digitais: a ficha digital acompanha o jogo.

## Capabilities and Constraints

**Núcleo a entregar nesta reconstrução**
- Landing que comunica o companion.
- Wizard de criação de personagem (raça → atributos → habilidades → aptidões → PC → gastos → equipamentos → finalização), alinhado à lógica existente.
- Ficha de personagem usável após a criação.

**Preservar (lógica / assets)**
- Dados e regras de jogo em `data/` e `lib/` (raças, skills, aptidões, escolas, trilhas, Ecoar, singularidades, cálculos).
- Imagens das 12 raças em `public/assets/images/`.
- APIs e persistência existentes onde o fluxo precisar (não reescrever a lógica do RPG).

**Não reutilizar**
- UI, componentes visuais, tokens e identidade visual atuais da app (rebuild from cards/components).

**Fora do núcleo imediato (aberto)**
- Mesas (criar/entrar/chat).
- Prioridade de auth na primeira entrega (login pode ser mínimo ou adiado).

## Brand Commitments

Nome: **ECOAR +**. Mundo do jogo: **ECOAR**.

Direção visual vinculante (sempre):
- Uma imagem monumental ancora a página.
- Imagery processada, nunca raw (halftone, dither, grain, ASCII, linework).
- Marginalia técnica (coordenadas, IDs, ruler ticks, timestamps).
- Tipografia nos extremos — display monumental ou labels mono minúsculos; pouco meio-termo.
- Solo quase monocromático; acento vivo na ação.

**Protótipo 4A (vinculante):** heroes 2K em `public/assets/branding/heroes/` (Glitch, Circuit, Blocks, Dither), composição split bipanel, grid teal, acento magenta, tipografia **Archivo Black** + **Fragment Mono**. Estes assets e esta gramática são a base visual da reconstrução (não a UI antiga da app).

Nunca: purple gradients; glossy 3D SaaS blobs; stock photography sem textura; rounded-everything friendliness; icon-grid feature rows; tipografia só Inter/system; paletas coloridas uniformemente distribuídas.

## Evidence on Hand

- Imagens de raças: `public/assets/images/` (Peccata, Anão, Elfo, Orc, Tyllow, Kaidler, Fjar/Fjyr, Mayne, Tsusagi, Niliapy, Triskelion, Fleurili).
- Heroes 4A 2K (obrigatórios): `public/assets/branding/heroes/` (`hero-01-glitch-2k.png` … `hero-04-dither-2k.png`, `hero-trade.png`).
- Catálogo e regras: `data/*`, `lib/calculations.ts`, `lib/characterBonuses.ts`, `lib/racialRules.ts`.
- Não inventar testemunhos, preços ou benchmarks.

## Product Principles

1. Criar personagem deve parecer leve e divertido, nunca um formulário burocrático.
2. A ficha serve à mesa: consulta rápida, estados claros, zero atrito.
3. A lógica do livro ECOAR é a verdade do produto; a interface traduz, não inventa regras.
4. Companheiro digital — presença atmosférica do mundo, sem poluir a tarefa.
5. Priorizar o núcleo criação → ficha antes de expandir para mesas e gestão.

## Accessibility & Inclusion

Web; controles e contraste devem permitir uso durante sessão (leitura sob luz variável). Sem requisito formal WCAG confirmado além de legibilidade operacional.
