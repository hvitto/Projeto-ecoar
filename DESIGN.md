# Design System — ECOAR +

<!-- impeccable:design-schema 1 -->

---
name: ECOAR +
description: Companion ECOAR — split 4A, heroes processados, grid teal, acento magenta
colors:
  ground: "#1a1d21"
  ground-deep: "#0a0a0a"
  ground-raised: "#212529"
  ink: "#f5f5f5"
  ink-dim: "#adb5bd"
  grid: "#7bb7bb"
  grid-dim: "rgba(123, 183, 187, 0.22)"
  accent: "#b663a9"
  accent-ink: "#1a0f18"
typography:
  display:
    fontFamily: "Archivo Black, Impact, sans-serif"
    fontSize: "clamp(2.8rem, 7vw, 5.8rem)"
    fontWeight: 400
    lineHeight: 0.86
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Archivo Black, Impact, sans-serif"
    fontSize: "clamp(1rem, 2.2vw, 1.45rem)"
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  label:
    fontFamily: "Fragment Mono, ui-monospace, monospace"
    fontSize: "0.625rem"
    fontWeight: 400
    lineHeight: 1.35
    letterSpacing: "0.14em"
  body:
    fontFamily: "Fragment Mono, ui-monospace, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "0.02em"
rounded:
  none: "0px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-ink}"
    rounded: "{rounded.none}"
    padding: "16px 20px"
    typography: "{typography.label}"
  range-panel:
    backgroundColor: "{colors.ground-deep}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "{spacing.md}"
---

## Overview

Mundo visual **4A / Range Card**: split bipanel, heroes 2K processados (Glitch, Circuit, Blocks, Dither), grid teal estrutural, magenta só na ação. Tipografia Archivo Black (monumental) + Fragment Mono (labels/coords). Âncora do primeiro viewport: **hero-01 Glitch Waves**.

## Colors

- Ground `#1a1d21` / deep `#0a0a0a`
- Ink `#f5f5f5` / dim `#adb5bd`
- Grid/teal `#7bb7bb` — linhas, ticks, estrutura
- Accent/magenta `#b663a9` — CTA, seleção, foco

## Typography

Archivo Black para marca e títulos; Fragment Mono para tudo operacional. Sem meio-termo Inter/system.

## Layout

Split ~60/40; hero 16:11 com borda ink; footer de três células com marginalia; wizard/ficha herdam moldura de ticks e IDs.

## Elevation & Depth

Flat + textura da imagem. Hero como bg pompado (opacity baixa + grid) atrás do conteúdo. Sem glass SaaS.

## Shapes

Raio 0. Bordas 1px teal ou ink. Controles retangulares.

## Components

HeroFrame (variantes 01–04 + trade), RulerTicks, StampButton (magenta), CoordLabel, SelectPlate, StepRail.

## Do's and Don'ts

**Do:** heroes de `public/assets/branding/heroes/*-2k.png`; imagem processada; teal na estrutura; magenta na ação.

**Don't:** purple gradients; blobs 3D; stock raw; rounded pills; icon-grid features; Inter-only.
