# Diretiva: Reconstrução do Site Zenon Capital (Versão 4 - Pixel Perfect)

## 1. Objetivo
Reconstruir do zero o website institucional da Zenon Capital com fidelidade estética 1:1 baseada no pacote de mockups v4 (`Zenon_site_v4_imagens.zip`), seguindo o pipeline de 5 etapas do workflow `img-to-html` com aprovação em gates e a arquitetura de 3 camadas (`agente`).

## 2. Padrões de Design e Identidade (Direção C - Atmosférica)
- **Paleta de Cores:**
  - Predominante: `#172D44` (Azul Profundo) e `#0F1F30` (Variação Sombria)
  - Base Clara: `#EEE9DF` (Creme Editorial) e `#C6BEAF` (Areia)
  - Apoio Quente: `#6F3C2C` (Terracota Nobre) e `#C79662` (Bronze Acento)
  - Escuro Neutro: `#333330` (Grafite Quente)
  - Texto Secundário: `#586879`
- **Tipografia:**
  - Títulos Primários / Hero H1 / Expressões Chave: Serifada clássica de alto contraste (`Playfair Display`, `Cormorant Garamond` ou `Times New Roman` estilizada)
  - Estrutura, Navegação e Corpo: `Montserrat` e `Plus Jakarta Sans`
  - Metadados e Rótulos: Tracking ampliado (`letter-spacing: 0.15em`), uppercase
- **Textura e Atmosfera:**
  - Imagens de alto mar, rastro de água e iluminação dourada
  - Fundo com ruído analógico sutil e gradientes profundos

## 3. Pipeline de Execução (img-to-html)
- **Etapa 1:** Wireframe ASCII tipado (`wireframe.txt`) e Plano de Implementação detalhado -> **[Gate 1]**
- **Etapa 2:** Atmosfera e fundos completos (CSS / texturas / gradientes sem elementos de conteúdo) -> **[Gate 2]**
- **Etapa 3:** Estrutura HTML semântica, componentes, tipografia fina e botões -> **[Gate 3]**
- **Etapa 4:** Assets recortados/extraídos (veleiro, rastro, luz, selos, símbolos) -> **[Gate 4]**
- **Etapa 5:** Revisão integrada e responsividade (Desktop, Tablet 768px, Mobile 360-390px) -> **[Gate 5]**

## 4. Regras Operacionais Críticas
- **Gates:** Parar obrigatoriamente a cada gate para aprovação do usuário.
- **Deploy:** Ao final de modificações de código, commitar e sincronizar com `main` para Vercel.
- **Visualização:** Manter link de 1 clique acessível.
