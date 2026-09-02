# DESIGN SYSTEM — EasyDev (Broscotech)
> Fonte de verdade visual do projeto. Gerado com a skill `ui-ux-pro-max`
> (design system query: "SaaS tech agency portfolio dashboard dark mode modern",
> density 6/10) + auditoria manual do código em `src/`.
>
> **Regra:** qualquer mudança visual nova deve consumir estes tokens.
> Hex hardcoded em componentes é débito técnico.

## Identidade (mantida — não mudar)
- Marca: **EasyDev** — agência de desenvolvimento (sites, sistemas, automações, integrações).
- Estilo: **Glassmorphism** (camadas translúcidas + backdrop-blur) sobre fundo escuro profundo.
- Fonte display: **Instrument Serif** (itálico) para destaques.
- Fonte UI: **Geist Sans** (corpo) + **Geist Mono** (código/destaques técnicos).
- Tom: profissional, técnico, limpo. pt-BR.

## Tokens de cor
Os tokens canônicos já existem em `src/app/globals.css` (`:root` / `.dark`).
Não duplicar — usar as variáveis:

| Token | Light | Dark | Uso |
|---|---|---|---|
| `--background` | #ffffff | #040d1a | Fundo da página |
| `--bg-surface` | #ffffff | #060f20 | Superfícies/cartões |
| `--bg-elevated` | #f8fafc | #091524 | Elevações, modais |
| `--foreground` | #0a0f1e | #e8f0fe | Texto principal |
| `--fg-muted` | #475569 | #8da8c8 | Texto secundário |
| `--fg-subtle` | #94a3b8 | #4d6a8a | Texto terciário/captions |
| `--border` | rgba(10,15,30,0.08) | rgba(255,255,255,0.07) | Bordas suaves |
| `--border-strong` | rgba(10,15,30,0.14) | rgba(255,255,255,0.12) | Bordas fortes |
| `--color-accent` | #00b09b | #00d4aa | Accent da marca (teal) |
| `--color-accent-600` | #00897b | #00b09b | Accent hover/pressed |
| `--color-accent-dim` | rgba(0,176,155,0.10) | rgba(0,212,170,0.14) | Fundos de accent |
| `--ia-bubble-contrast` | #ffffff | #040d1a | Contraste da bolha da IA |

### Gradiente da marca (substitui todos os `#4f46e5→#06b6d4` hardcoded)
- Canônico: `linear-gradient(135deg, #004aad 0%, #00b09b 60%, #00d4aa 100%)`
- Exposto como `.gradient` e `.gradient-text` em globals.css.
- **Débit a limpar:** ~40 ocorrências de `linear-gradient(135deg,#4f46e5,#06b6d4)`
  (indigo→cyan) em dashboard, projeto, KanbanBoard, Sidebar, IconBanner etc.

### Paleta de apoio (dashboards)
- Estados: sucesso `emerald`, erro `red-500/600`, alerta `amber` — sempre com
  variante dark (`-400` em fundo escuro, `-600` em fundo claro).
- Neutros: `slate`/escala própria dos tokens — evitar `gray`, `zinc`, `neutral` misturados.

## Tipografia
- Base: 16px (min 14px para labels), line-height 1.5 para corpo.
- **Proibido:** texto < 12px. Auditoria achou ~40 trechos em `text-[9/10/11px]`
  (KanbanBoard, Sidebar, dev/kanban, configuracoes) → subir para `text-xs` (12px).
- Escala de headings: h1 36–60px (já ok), h2 24–36px, h3 18–20px, semântica preservada.
- `.font-display` (Instrument Serif italic) apenas para acentos, nunca para body.

## Spacing & layout
- Escala 4/8px. Containers: `max-w-7xl` (público) / `max-w-5xl` (conteúdo denso).
- Sidebar: `--sidebar-width: 5rem` (utility `pl-sidebar` já existe).
- Header: `--header-height: 60px`.
- Mobile-first: breakpoints 375 / 768 / 1024 / 1440. Sem scroll horizontal.

## Interação & animação
- Transições: 150–300ms, `ease-out` (entradas) / exit mais rápido que enter.
- Micro-interações: hover com translate/scale sutil, active scale 0.98.
- **`prefers-reduced-motion: reduce` → todas as animações viram estado final estático.**
  (Hoje NÃO existe no projeto — animações infinitas: typewriter do hero,
  IconBanner scroll, pulses, float. Ver `globals.css` + `page.tsx` + `IconBanner.tsx`.)
- Feedback de loading obrigatório em qualquer ação async (spinners/badges).

## Acessibilidade (requisitos duros)
1. **Foco visível** em TODO elemento interativo:
   - 14 arquivos têm `<button>` sem classe `focus:` — ver lista abaixo.
   - Regra: `focus-visible:ring-2 ring-[var(--color-accent)] ring-offset-2` (offset com cor do bg).
   - Nunca `outline-none` sem ring de substituição.
2. **Contraste 4.5:1** (texto normal) / 3:1 (texto grande e UI).
   - Verificar `text-slate-500`/`white/60` em fundos coloridos.
3. **Ícones**: SVG (react-icons ok). Proibido emoji como ícone —
   `Sobre.tsx` usa 💡🤝🌱🌍; Header/KanbanBoard usam glyphs ✕ ✓ ⚠ (trocar por react-icons).
   - Ícone decorativo: `aria-hidden="true"`. Botão só com ícone: `aria-label` obrigatório.
4. **Touch targets**: mínimo 44×44px (mobile).
5. **Formulários**: label visível (nunca só placeholder), erro próximo do campo,
   `aria-describedby` no erro, focus management no modal (focus trap + ESC fecha).
6. **Modais**: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, ESC fecha,
   backdrop click fecha, foco volta ao gatilho.
7. **Landmarks**: nav principal com `aria-label`, seções com `aria-labelledby`.

## Padrões de componentes
- **Botões**: variantes primary (gradiente da marca, texto branco — verificar contraste 4.5:1
  no texto sobre o gradiente; se falhar, escuracer a ponta do gradiente), secondary
  (border + bg surface), ghost, destructive (red). Estados: default/hover/active/disabled/loading.
- **Cartões**: `rounded-2xl`, `border-[var(--border)]`, `bg` com translúcido + `backdrop-blur`
  (padrão glass já usado na home) — padronizar nas páginas internas.
- **Tabs**: padrão do dashboard (pill) é referência — reutilizar em projeto/kanban.
- **Badges/chips**: `text-xs` no mínimo, `rounded-full`, padding 8px horizontal.

## Lista de débito técnico (auditoria de 29/08, revisada em 31/08)
**Atualização 31/08:** foco visível global (`* :focus-visible` em globals.css) e
`prefers-reduced-motion` já estavam implementados no CSS — os itens abaixo que
citavam essas duas pendências estão desatualizados. Emojis como ícone também
não foram encontrados em nova varredura (Sobre.tsx, Header, KanbanBoard já
usam SVG). O gradiente indigo→cyan duplicado no *botão de ação* (2 stops,
`from-indigo-500 to-cyan-500`) foi trocado pelos tokens de marca em:
dev/page.tsx, dev/ia-monitor/page.tsx, projeto/page.tsx, iaagent/page.tsx,
configuracoes/page.tsx, dashboard/page.tsx.

**Ainda pendente — maior que o previsto:** o ciano (`cyan-500`, `cyan-50`,
`rgba(6,182,212,...)`) é usado como cor de destaque secundária em badges,
bordas e sombras (não só no gradiente de 2 stops) em `dashboard/page.tsx`,
`iaagent/page.tsx`, `planejamento/page.tsx`, `projeto/page.tsx`. Migrar isso
para os tokens de marca é uma revisão visual maior — recomendo fazer com
screenshot/preview ao vivo antes de aplicar em massa, não às cegas.

Arquivos com mais hex hardcoded (prioridade de troca pelos tokens):
- `app/dashboard/projeto/page.tsx` (36 hex / 23 brand-grad)
- `projeto/page.tsx` (36/23) — possível duplicado de `app/dashboard/projeto`
- `app/dev/faturas/page.tsx` (33), `app/dev/comunicacao/page.tsx` (32)
- `app/globals.css` (30 — normal, é onde vivem os tokens), `app/dev/clientes/page.tsx` (28)
- `component/IconBanner.tsx` (27), `component/KanbanBoard.tsx` (21)
- `component/DevSidebar.tsx` (20), `component/Sidebar.tsx` (16)

Texto abaixo de 12px (`text-[9px]`/`text-[10px]`/`text-[11px]`) ainda presente em
15 arquivos (varredura 31/08): dev/page.tsx, dev/kanban/page.tsx,
dev/ia-monitor/page.tsx, dev/faturas/page.tsx, projeto/page.tsx, page.tsx,
iaagent/page.tsx, configuracoes/page.tsx, dashboard/projeto/page.tsx,
faturas/page.tsx, planejamento/page.tsx, src/projeto/page.tsx,
component/Sidebar.tsx, component/DevSidebar.tsx, component/DashboardNav.tsx.
Requer revisão caso a caso (alguns podem ser badges com espaço apertado de
propósito) — não é troca mecânica segura.

## Checklist pré-entrega (toda PR visual)
- [ ] Sem hex novo hardcoded — usar tokens
- [ ] `cursor-pointer` em tudo que é clicável
- [ ] Hover com transição 150–300ms
- [ ] Foco visível em keyboard (Tab por todo o fluxo)
- [ ] Contraste 4.5:1 light e dark
- [ ] `prefers-reduced-motion` respeitado
- [ ] Responsivo 375 / 768 / 1024 / 1440
- [ ] Sem emoji como ícone; ícones SVG com aria correta
