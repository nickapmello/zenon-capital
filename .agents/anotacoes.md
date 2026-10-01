# 🚀 Skills & Diretrizes do Projeto (Construtor de Landing Pages Cinematográficas)

Este documento reúne todas as habilidades, regras de design system e diretrizes de desenvolvimento configuradas para a criação e manutenção de sites de alto padrão ("1:1 Pixel Perfect").

---

## 🎭 1. Filosofia de Design System (Taste Skill / Anti-Slop)
- **Visual de Alto Padrão (Award-Worthy UI):** Erradicação total de padrões genéricos de IA. Cada site deve parecer um instrumento digital refinado.
- **Tipografia Dramática & Contrastante:**
  - Fontes de Heading: `Outfit`, `Geist`, `Cabinet Grotesk`, `Satoshi`, `Plus Jakarta Sans`.
  - Fontes Dramáticas/Serifadas: `Cormorant Garamond Italic`, `Playfair Display Italic`, `Instrument Serif`.
  - Fontes de Dados/Código: `JetBrains Mono`, `IBM Plex Mono`, `Space Mono`.
  - Contraste no Hero H1: Combinação de Sans em negrito + Serifada Itálica massiva no texto principal.
- **Cores & Texturas:**
  - Fundo Off-Black (`#0d0d12`, `#0a0a14`) ou Tons Terrosos/Orgânicos refinados.
  - Sem gradientes "neon de IA" clichês e sem uso de preto puro (`#000000`).
  - Textura global com ruído (noise) CSS via filtro SVG `<feTurbulence>` (opacidade ~0.05).
  - Bordas arredondadas harmônicas (`rounded-[2rem]` a `rounded-[3rem]`).

---

## ⚡ 2. Presets Estéticos Prontos

### 🌿 Preset A — "Organic Tech" (Boutique Clínica / Biotecnologia)
- **Sensação:** Ponte entre laboratório biológico e revista de luxo.
- **Cores:** Musgo (`#2E4036`), Argila (`#CC5833`), Creme (`#F2F0E9`), Carvão (`#1A1A1A`).
- **Tipografia:** Plus Jakarta Sans / Outfit + Cormorant Garamond Italic + IBM Plex Mono.

### 🍷 Preset B — "Midnight Luxe" (Editorial Sombrio / Alto Padrão)
- **Sensação:** Clube de membros privados e ateliê de alta relojoaria.
- **Cores:** Obsidiana (`#0D0D12`), Champagne (`#C9A84C`), Marfim (`#FAF8F5`), Ardósia (`#2A2A35`).
- **Tipografia:** Inter / Outfit + Playfair Display Italic + JetBrains Mono.

### 🏭 Preset C — "Brutalist Signal" (Precisão Bruta / Industrial)
- **Sensação:** Sala de controle futurista com alta densidade de informação.
- **Cores:** Papel (`#E8E4DD`), Vermelho Sinal (`#E63B2E`), Off-white (`#F5F3EE`), Preto Grafite (`#111111`).
- **Tipografia:** Space Grotesk + DM Serif Display Italic + Space Mono.

### 🧬 Preset D — "Vapor Clinic" (Futurismo Imersivo / Biotech Neon)
- **Sensação:** Sequenciamento genômico em estética cyberpunk refinada.
- **Cores:** Vazio Profundo (`#0A0A14`), Plasma (`#7B61FF`), Fantasma (`#F0EFF4`), Grafite (`#18181B`).
- **Tipografia:** Sora + Instrument Serif Italic + Fira Code.

---

## 🎬 3. Micro-Interações & Animações GSAP
- **Botões Magnéticos:** Efeito `scale(1.03)` no hover com curva `cubic-bezier(0.25, 0.46, 0.45, 0.94)`.
- **Sliding Button Layer:** Botões com `overflow-hidden` e camada `<span>` interna deslizando na transição de cor.
- **GSAP ScrollTrigger:** Animações de entrada *fade-up* com `stagger: 0.08`, revela progressivo e paralaxe suave.
- **Floating Island Navbar:** Navbar fixa em formato de pílula com transição para `backdrop-blur-xl` e fundo translúcido após rolagem do Hero.

---

## 🛠️ 4. RegrasGlobais do Usuário & Workflows
- **Comunicação:** Sempre responder e estruturar conteúdos em **Português do Brasil**.
- **Link Clicável Imediato:** Sempre que um aplicativo ou site for gerado ou modificado, disponibilizar um link funcional de 1 clique para visualização.
- **Deploy Automático via Git:** Sempre que alterações de código forem realizadas neste repositório, executar staging (`git add .`), commit descritivo (`git commit -m "..."`) e push (`git push`) para a branch `main` para acionar o deploy automático na Vercel.
