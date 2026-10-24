# Apps para Gravação de Tela com Rosto Circular

**Created:** 10/24/2026 12:04:57  
**Updated:** 10/24/2026 13:27:39  
**Exported:** 10/24/2026 13:34:51  
**Link:** [https://gemini.google.com/app/fb2e9675627e83d3](https://gemini.google.com/app/fb2e9675627e83d3)

## Gemini:

> 10/24/2026 13:27:39

### 1. Análise dos Arquivos e Plano de Integração

#### Mapeamento dos Artefatos Analisados

1. **`guia_gravacao_windows_s23.html`**: Documento base do projeto _Aline Resolve_ contendo 12 seções, paleta de cores acessível (`:root` claro/escuro), checklist persistente via `localStorage` e calculadora de tempo de narração[cite: 2].
2. **`LEIA-ME.txt`**: Especificação operacional do Kit Facecam no OBS Studio: recorte 1:1 da webcam via filtro `Recortar/Preencher`, aplicação do filtro `Máscara/Mistura de imagem` em modo `Máscara alfa (canal alfa)` com `mascara_circular_OBS_alpha.png`, sobreposição opcional de `borda_dourada_opcional.png` e execução do `scrcpy`[cite: 4].
3. **`Abrir_Android_no_Windows.bat`**: Script batch para espelhamento fluido a 30 fps sem captura duplicada de áudio e mantendo a tela ativa (`scrcpy.exe --no-audio --max-fps=30 --stay-awake --pause-on-exit=if-error`)[cite: 3].
4. **`mascara_circular_OBS_alpha.png` & `borda_dourada_opcional.png`**: Assets gráficos de recorte alfa 1:1 e moldura circular alinhada ao token `--gold` (`#b8892b` / `#e0b45c`) do guia[cite: 2, 5, 6].
5. **`exemplo_gravacao_com_circulo_imagem_falando.jpg`**: Referência visual de _bubble cam_ posicionada no canto superior direito sem obstruir o conteúdo principal[cite: 1].

#### Plano de Integração Estrutural (`Modo C — Tela + Rosto em Círculo`)

- **Seção 1 (`#visao`)**: Evolução de "Duas formas de colocar a voz" para **"Três formas de gravar (Voz e Rosto)"**, introduzindo o **Modo C — Tela + rosto em círculo (OBS + Kit Facecam)** ao lado dos Modos A e B[cite: 2, 4].
- **Seção 7 (`#planob`)**: Expansão para **"Plano B e Modo C: Gravar S23 pelo PC + Facecam Circular no OBS"**, documentando:
  1. Automação do espelhamento via `Abrir_Android_no_Windows.bat`[cite: 3, 4].
  2. Pipeline exato de filtros no OBS Studio (`Recortar/Preencher` 1:1 → `Máscara alfa` com `mascara_circular_OBS_alpha.png` → Camada superior com `borda_dourada_opcional.png`)[cite: 4, 5, 6].
  3. Posicionamento seguro nos cantos para evitar colisão com elementos interativos do app ou com as zonas de interface do Reels/YouTube[cite: 1, 2].
- **Seção 10 (`#checklist`)**: Adição de um grupo `<fieldset>` específico para validação opcional do **Kit Facecam OBS + scrcpy** antes da gravação.

---

### 2. Correções W3C, Acessibilidade (WCAG 2.2 AA) e Clean Code ES6+

1. **Semântica de Formulários e Indicadores Dinâmicos**:
   - Substituição de `<div class="prog" role="progressbar">` pelo elemento nativo `<progress id="bar" max="100" value="0">`[cite: 2].
   - Substituição dos elementos `<b id="c-words">`, `<b id="c-fast">` e `<b id="c-slow">` por tags `<output for="narr">`[cite: 2].
   - Agrupamento das listas de verificação da Seção 10 em blocos `<fieldset>` com `<legend>` descritivos[cite: 2].
2. **Semântica Textual, Tabelas e Blocos de Código**:
   - Substituição de `<b class="t">` por `<strong>` e caminhos de menu em `<i>` por `<span class="ui-path">` estilizado via CSS[cite: 2].
   - Adição de `<caption>` (com classe `.sr-only` quando apropriado) e `scope="col"` em todas as células `<th>` das tabelas[cite: 2].
   - Padronização de todos os blocos `.cmd` com `<pre><code>...</code></pre>` e botões com `type="button"` e `aria-live="polite"`[cite: 2].
3. **Respeito a Movimento e Remoção de Estilos Inline**:
   - Encapsulamento de `scroll-behavior: smooth` dentro de `@media (prefers-reduced-motion: no-preference)`.
   - Migração de todos os atributos `style="..."` inline para classes utilitárias limpas no CSS[cite: 2].
4. **JavaScript Moderno (ES6+)**:
   - Substituição de `var` e `[].slice.call` por `const`/`let`, `Array.from()`, _arrow functions_, _template literals_ e API assíncrona `navigator.clipboard.writeText` com fallback resiliente[cite: 2].

---

### 3. Código Completo Refatorado (`guia_gravacao_windows_s23.html`)

`​`​`html

<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Guia de gravação — Windows, Galaxy S23 e Kit Facecam OBS</title>
<meta name="description" content="Passo a passo para gravar tutoriais de aplicativos com tela, voz e facecam circular no Samsung Galaxy S23 e editar no Windows, só com ferramentas gratuitas.">
<style>
:root {
  --bg: #f6f4ef;
  --card: #ffffff;
  --ink: #1b2a30;
  --muted: #506068;
  --line: #d9d4c7;
  --brand: #0E4D64;
  --brand-ink: #ffffff;
  --gold: #b8892b;
  --gold-bg: #fbf3df;
  --ok: #1d6b3a;
  --ok-bg: #e6f4ea;
  --warn: #8a4b00;
  --warn-bg: #fff0d9;
  --bad: #9b1c1c;
  --bad-bg: #fde8e8;
  --code-bg: #12232a;
  --code-ink: #e8f1f4;
}

@media (prefers-color-scheme: dark) {
:root {
--bg: #0f1a1f;
--card: #17262d;
--ink: #eaf0f2;
--muted: #a9bac1;
--line: #2b3f48;
--brand: #5cb8d6;
--brand-ink: #08222c;
--gold: #e0b45c;
--gold-bg: #2c2512;
--ok: #7fd49b;
--ok-bg: #13301f;
--warn: #f0b866;
--warn-bg: #33240d;
--bad: #f19a9a;
--bad-bg: #3a1717;
--code-bg: #0a1418;
--code-ink: #e3eef2;
}
}

- {
  box-sizing: border-box;
  }

html {
scroll-padding-top: 70px;
}

@media (prefers-reduced-motion: no-preference) {
html {
scroll-behavior: smooth;
}
}

body {
margin: 0;
background: var(--bg);
color: var(--ink);
font: 18px/1.6 system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
-webkit-text-size-adjust: 100%;
}

a {
color: var(--brand);
}

.sr-only {
position: absolute;
width: 1px;
height: 1px;
padding: 0;
margin: -1px;
overflow: hidden;
clip: rect(0, 0, 0, 0);
white-space: nowrap;
border: 0;
}

.skip {
position: absolute;
left: -999px;
top: 0;
background: var(--brand);
color: var(--brand-ink);
padding: 10px 14px;
z-index: 99;
text-decoration: none;
font-weight: 600;
}

.skip:focus {
left: 8px;
top: 8px;
}

header.hero {
background: var(--brand);
color: var(--brand-ink);
padding: 36px 16px 28px;
}

.wrap {
max-width: 900px;
margin: 0 auto;
padding: 0 16px;
}

header.hero .wrap {
padding: 0;
}

.hero h1 {
margin: 0 0 8px;
font-size: clamp(1.6rem, 5vw, 2.4rem);
line-height: 1.2;
}

.hero p {
margin: 0;
max-width: 65ch;
opacity: .95;
}

.tags {
display: flex;
flex-wrap: wrap;
gap: 8px;
margin-top: 16px;
}

.tag {
background: rgba(255, 255, 255, .18);
border: 1px solid rgba(255, 255, 255, .35);
border-radius: 999px;
padding: 4px 12px;
font-size: .85rem;
}

@media (prefers-color-scheme: dark) {
.tag {
background: rgba(0, 0, 0, .2);
border-color: rgba(0, 0, 0, .35);
}
}

nav.toc {
position: sticky;
top: 0;
z-index: 20;
background: var(--card);
border-bottom: 1px solid var(--line);
}

nav.toc ul {
list-style: none;
margin: 0 auto;
padding: 8px 16px;
max-width: 900px;
display: flex;
gap: 6px;
overflow-x: auto;
white-space: nowrap;
}

nav.toc a {
display: block;
padding: 6px 12px;
border-radius: 999px;
text-decoration: none;
font-size: .9rem;
border: 1px solid var(--line);
color: var(--ink);
}

nav.toc a:hover,
nav.toc a:focus-visible {
background: var(--brand);
color: var(--brand-ink);
border-color: var(--brand);
}

main {
padding: 20px 0 60px;
}

section {
background: var(--card);
border: 1px solid var(--line);
border-radius: 14px;
padding: 22px 20px;
margin: 18px 0;
}

section > h2 {
margin: 0 0 4px;
font-size: 1.45rem;
line-height: 1.25;
}

section > h2 .n {
display: inline-block;
min-width: 1.9em;
height: 1.9em;
line-height: 1.9em;
text-align: center;
border-radius: 50%;
background: var(--brand);
color: var(--brand-ink);
font-size: .8em;
margin-right: 8px;
}

.lead {
color: var(--muted);
margin: 0 0 14px;
}

h3 {
margin: 22px 0 6px;
font-size: 1.12rem;
}

p {
margin: .55em 0;
}

ul, ol {
padding-left: 1.3em;
margin: .5em 0;
}

li {
margin: .3em 0;
}

.ui-path {
font-style: italic;
font-weight: 500;
}

.flow {
display: grid;
grid-template-columns: repeat(auto-fit, minmax(135px, 1fr));
gap: 10px;
margin: 14px 0;
padding: 0;
list-style: none;
counter-reset: f;
}

.flow li {
counter-increment: f;
border: 1px solid var(--line);
border-radius: 12px;
padding: 12px;
background: var(--bg);
margin: 0;
position: relative;
}

.flow li::before {
content: counter(f);
position: absolute;
top: -10px;
left: 10px;
background: var(--gold);
color: #fff;
font-weight: 700;
width: 24px;
height: 24px;
border-radius: 50%;
text-align: center;
line-height: 24px;
font-size: .85rem;
}

.flow strong {
display: block;
margin-top: 4px;
}

.flow span {
font-size: .88rem;
color: var(--muted);
}

.steps {
counter-reset: s;
list-style: none;
padding: 0;
}

.steps > li {
counter-increment: s;
position: relative;
padding: 10px 12px 10px 52px;
border: 1px solid var(--line);
border-radius: 12px;
margin: 10px 0;
background: var(--bg);
}

.steps > li::before {
content: counter(s);
position: absolute;
left: 12px;
top: 10px;
width: 28px;
height: 28px;
border-radius: 50%;
background: var(--brand);
color: var(--brand-ink);
font-weight: 700;
text-align: center;
line-height: 28px;
}

.steps strong.t {
display: block;
}

.box {
border-left: 5px solid var(--gold);
background: var(--gold-bg);
padding: 10px 14px;
border-radius: 8px;
margin: 14px 0;
}

.box.ok {
border-color: var(--ok);
background: var(--ok-bg);
}

.box.warn {
border-color: var(--warn);
background: var(--warn-bg);
}

.box.bad {
border-color: var(--bad);
background: var(--bad-bg);
}

.box > strong:first-child {
display: block;
margin-bottom: 2px;
}

.ver {
display: inline-block;
font-size: .72rem;
font-weight: 700;
letter-spacing: .03em;
text-transform: uppercase;
background: var(--warn-bg);
color: var(--warn);
border: 1px solid var(--warn);
border-radius: 6px;
padding: 0 6px;
vertical-align: middle;
margin-left: 4px;
}

.tw {
overflow-x: auto;
margin: 12px 0;
}

table {
border-collapse: collapse;
width: 100%;
min-width: 560px;
font-size: .95rem;
}

th, td {
border: 1px solid var(--line);
padding: 8px 10px;
text-align: left;
vertical-align: top;
}

th {
background: var(--bg);
}

kbd, code {
font-family: ui-monospace, SFMono-Regular, Consolas, Menlo, monospace;
font-size: .88em;
}

kbd {
background: var(--bg);
border: 1px solid var(--line);
border-bottom-width: 2px;
border-radius: 5px;
padding: 1px 6px;
}

.cmd {
position: relative;
background: var(--code-bg);
color: var(--code-ink);
border-radius: 10px;
padding: 12px 90px 12px 14px;
margin: 10px 0;
overflow-x: auto;
}

.cmd pre {
margin: 0;
white-space: pre;
font: .85rem/1.5 ui-monospace, SFMono-Regular, Consolas, Menlo, monospace;
}

.cmd pre code {
font-size: inherit;
color: inherit;
background: transparent;
}

.cmd button {
position: absolute;
top: 6px;
right: 6px;
}

button, .btn {
font: inherit;
font-size: .85rem;
background: var(--brand);
color: var(--brand-ink);
border: 0;
border-radius: 8px;
padding: 6px 12px;
cursor: pointer;
}

button.ghost {
background: transparent;
color: var(--brand);
border: 1px solid var(--brand);
}

.cmd button.ghost {
color: var(--code-ink);
border-color: rgba(232, 241, 244, .45);
}

.cmd button.ghost:hover {
background: rgba(255, 255, 255, .12);
}

button:focus-visible,
a:focus-visible,
summary:focus-visible,
input:focus-visible,
textarea:focus-visible {
outline: 3px solid var(--gold);
outline-offset: 2px;
}

.cols {
display: grid;
grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
gap: 12px;
}

.col {
border: 1px solid var(--line);
border-radius: 12px;
padding: 12px 14px;
background: var(--bg);
}

.col h3 {
margin-top: 0;
}

.good {
color: var(--ok);
font-weight: 700;
}

.badt {
color: var(--bad);
font-weight: 700;
}

details {
border: 1px solid var(--line);
border-radius: 10px;
padding: 8px 14px;
margin: 10px 0;
background: var(--bg);
}

summary {
cursor: pointer;
font-weight: 600;
padding: 4px 0;
}

fieldset.chk-group {
border: 1px solid var(--line);
border-radius: 12px;
padding: 12px 16px;
margin: 14px 0;
background: var(--bg);
}

fieldset.chk-group legend {
font-weight: 700;
font-size: 1.05rem;
padding: 0 8px;
color: var(--ink);
}

.chk {
list-style: none;
padding: 0;
margin: 0;
}

.chk li {
display: flex;
gap: 10px;
align-items: flex-start;
margin: 8px 0;
}

.chk input {
width: 22px;
height: 22px;
margin-top: 4px;
flex: none;
accent-color: var(--brand);
}

.chk label {
cursor: pointer;
}

.chk input:checked + label {
color: var(--muted);
text-decoration: line-through;
}

.prog-wrap {
margin: 8px 0 14px;
}

.prog-label {
display: block;
color: var(--muted);
font-size: .95rem;
margin-bottom: 6px;
}

progress.prog {
width: 100%;
height: 12px;
appearance: none;
-webkit-appearance: none;
border: none;
border-radius: 999px;
background-color: var(--line);
overflow: hidden;
}

progress.prog::-webkit-progress-bar {
background-color: var(--line);
border-radius: 999px;
}

progress.prog::-webkit-progress-value {
background-color: var(--ok);
border-radius: 999px;
transition: width .2s ease;
}

progress.prog::-moz-progress-bar {
background-color: var(--ok);
border-radius: 999px;
}

.form-label {
display: block;
font-weight: 600;
margin-bottom: 6px;
}

textarea {
width: 100%;
min-height: 130px;
font: inherit;
padding: 10px;
border: 1px solid var(--line);
border-radius: 10px;
background: var(--bg);
color: var(--ink);
}

.calc {
display: grid;
grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
gap: 10px;
margin-top: 10px;
}

.calc div {
border: 1px solid var(--line);
border-radius: 10px;
padding: 10px;
background: var(--bg);
}

.calc output {
display: block;
font-size: 1.4rem;
font-weight: 700;
}

.muted-note {
color: var(--muted);
font-size: .9rem;
}

footer {
color: var(--muted);
font-size: .9rem;
padding: 10px 0 40px;
}

@media print {
nav.toc, .skip, button {
display: none !important;
}
body {
background: #fff;
color: #000;
font-size: 12pt;
}
section {
break-inside: avoid;
border-color: #999;
}
.cmd {
background: #fff;
color: #000;
border: 1px solid #999;
}
}

@media (max-width: 520px) {
body {
font-size: 17px;
}
section {
padding: 18px 14px;
}
.steps > li {
padding-left: 48px;
}
}
</style>

</head>
<body>
<a class="skip" href="#main">Ir para o conteúdo principal</a>

<header class="hero">
  <div class="wrap">
    <h1>Gravar tutorial de aplicativo com o Galaxy S23 e editar no Windows</h1>
    <p>Guia completo, só com ferramentas gratuitas: gravar a tela do celular com a sua voz (ou rosto em círculo via OBS Studio), levar o vídeo ao computador, editar, conferir a privacidade e preparar para o Instagram e YouTube.</p>
    <div class="tags">
      <span class="tag">Samsung Galaxy S23</span>
      <span class="tag">Windows 10/11</span>
      <span class="tag">Tela + Voz + Facecam Circular</span>
      <span class="tag">Guia v2.0 · 24/10/2026</span>
    </div>
  </div>
</header>

<nav class="toc" aria-label="Seções do guia">
  <ul>
    <li><a href="#visao">1 Visão geral</a></li>
    <li><a href="#preparar">2 Preparar</a></li>
    <li><a href="#gravar">3 Gravar</a></li>
    <li><a href="#privacidade">4 Privacidade</a></li>
    <li><a href="#transferir">5 Ao Windows</a></li>
    <li><a href="#editar">6 Editar</a></li>
    <li><a href="#planob">7 Plano B e Facecam OBS</a></li>
    <li><a href="#roteiro">8 Roteiro e voz</a></li>
    <li><a href="#instagram">9 Instagram</a></li>
    <li><a href="#checklist">10 Checklist</a></li>
    <li><a href="#problemas">11 Problemas</a></li>
    <li><a href="#pendencias">12 Verificar</a></li>
  </ul>
</nav>

<main id="main" class="wrap">

<section id="visao">
  <h2><span class="n" aria-hidden="true">1</span>Visão geral</h2>
  <p class="lead">O celular grava. O computador edita. Cada aparelho faz o que faz melhor.</p>
  <ol class="flow">
    <li><strong>Preparar</strong><span>Celular limpo, sem notificação, conta segura</span></li>
    <li><strong>Gravar</strong><span>Gravador nativo do S23 ou espelhamento + OBS</span></li>
    <li><strong>Conferir</strong><span>Assistir ao bruto: voz, toque, dados à vista?</span></li>
    <li><strong>Levar</strong><span>Cabo USB ou Quick Share até o Windows</span></li>
    <li><strong>Editar</strong><span>Cortes, zoom, legenda, capa</span></li>
    <li><strong>Publicar</strong><span>Revisão no celular, Reels e YouTube</span></li>
  </ol>
  <div class="box ok">
    <strong>Recomendação em uma frase</strong>
    Grave com o <strong>gravador de tela nativo do S23</strong> (nada para instalar) e edite no <strong>Clipchamp</strong>, que já vem no Windows 11. Use o DaVinci Resolve se quiser mais controle, ou o <strong>OBS Studio + scrcpy</strong> quando quiser aparecer falando em um círculo flutuante.
  </div>
  <h3>Por que gravar no celular e não só no computador?</h3>
  <p>O tutorial mostra a tela real do aplicativo, do jeito que a pessoa vai ver no aparelho dela. O gravador do S23 já captura o som do aplicativo e a sua voz, sem instalar nada e sem enviar nada para a nuvem.</p>
  <h3>Três formas de colocar a voz e o rosto</h3>
  <div class="cols">
    <div class="col">
      <h3>Modo A — Voz junto com a tela <span class="good">(comece por aqui)</span></h3>
      <p>Você fala enquanto toca direto no S23. Mais natural e mais rápido. Se errar a fala, regrava o trecho.</p>
    </div>
    <div class="col">
      <h3>Modo B — Voz depois</h3>
      <p>Grave a tela em silêncio e narre depois, vendo o vídeo no computador. A fala sai mais limpa. Serve para fluxos longos ou difíceis.</p>
    </div>
    <div class="col">
      <h3>Modo C — Tela + Rosto em Círculo (OBS + Kit Facecam)</h3>
      <p>Espelhe a tela do S23 no Windows via <code>scrcpy</code> e grave no OBS Studio com sua webcam recortada em um círculo com borda dourada sobre a apresentação ou app (detalhes na seção 7.2).</p>
    </div>
  </div>
</section>

<section id="preparar">
  <h2><span class="n" aria-hidden="true">2</span>Preparar o Galaxy S23</h2>
  <p class="lead">Dez minutos de preparo evitam regravar tudo.</p>
  <ol class="steps">
    <li><strong class="t">Atualize e anote a versão do aplicativo</strong>Abra a loja de aplicativos, atualize o app que vai ensinar e escreva a versão em um caderno. O app muda; o tutorial precisa dizer de qual versão foi gravado.</li>
    <li><strong class="t">Ative o Não perturbe</strong>Deslize a tela de cima para baixo e toque em <span class="ui-path">Não perturbe</span>. Isso segura sons e a maior parte dos avisos durante a gravação. Não é garantia: continue conferindo o vídeo depois.</li>
    <li><strong class="t">Deixe a tela na vertical, sem girar</strong>Nos botões rápidos, confira se <span class="ui-path">Girar automaticamente</span> está desligado.</li>
    <li><strong class="t">Brilho e tamanho das letras</strong>Brilho alto o bastante para a tela ficar nítida. Para tutoriais, vale aumentar o tamanho da fonte do sistema: <span class="ui-path">Configurações → Visor → Tamanho e estilo da fonte</span><span class="ver">verificar nome</span>. Letra maior no celular vira letra maior no vídeo.</li>
    <li><strong class="t">Bateria e espaço</strong>Bateria acima de 50% (ou carregador ligado) e pelo menos 2 GB livres. Um minuto de gravação pesa algumas dezenas de megabytes.</li>
    <li><strong class="t">Feche o que não precisa</strong>Feche aplicativos abertos, abas e conversas que mostrem nome ou foto de alguém.</li>
    <li><strong class="t">Escolha o lugar</strong>Cômodo fechado, sem ventilador, geladeira ou TV ligada. Cortinas e tapete ajudam a reduzir eco.</li>
    <li><strong class="t">Conexão estável</strong>Use o Wi-Fi de casa. Evite gravar com sinal fraco: carregamentos longos viram tempo morto.</li>
  </ol>
  <div class="box">
    <strong>Dica de microfone</strong>
    O microfone principal do S23 fica na borda inferior. Segure o celular sem tampar essa borda e fale a uns 20 a 30 cm. Se for apoiar o aparelho em um suporte, melhor ainda: a mão fica livre e o áudio não balança.
  </div>
</section>

<section id="gravar">
  <h2><span class="n" aria-hidden="true">3</span>Gravar a tela com som no S23</h2>
  <p class="lead">Gravador de tela da Samsung: gratuito, nativo e com áudio.</p>

  <h3>3.1 Ajuste uma vez só</h3>
  <ol class="steps">
    <li><strong class="t">Abra as configurações do gravador</strong><span class="ui-path">Configurações → Recursos avançados → Capturas de tela e gravador de tela</span><span class="ver">verificar nome</span>.</li>
    <li><strong class="t">Som</strong>Escolha <strong>Mídia e microfone</strong>. Assim o vídeo leva o som do aplicativo e a sua voz. Para o Modo B (voz depois), escolha <strong>Mídia</strong> ou <strong>Sem som</strong>.</li>
    <li><strong class="t">Qualidade do vídeo</strong>Escolha <strong>1080p</strong>. Quando estiver nesse ajuste, a gravação costuma sair em 1080 × 2340 pixels. Confira no computador (seção 5).</li>
    <li><strong class="t">Mostrar toques e gestos</strong>Ative. Aparece um círculo onde o dedo toca, e quem assiste entende onde tocar.</li>
    <li><strong class="t">Temporizador</strong>Ative a contagem regressiva (3 segundos), se existir na sua versão. Dá tempo de abrir o app antes de a gravação começar.</li>
    <li><strong class="t">Vídeo do rosto (selfie nativa)</strong>Deixe desligado quando a tela for a única protagonista. Se quiser usar rosto em círculo com controle de posição e moldura dourada, utilize o Modo C no OBS Studio (seção 7.2).</li>
  </ol>

  <h3>3.2 Iniciar a gravação</h3>
  <ol class="steps">
    <li><strong class="t">Abra o painel rápido</strong>Deslize duas vezes de cima para baixo. Se não achar <span class="ui-path">Gravador de tela</span>, toque nos três pontos ou no ícone de edição e arraste o botão para a primeira página.</li>
    <li><strong class="t">Toque em Gravador de tela</strong>Confirme o som escolhido e toque em <span class="ui-path">Iniciar gravação</span>. A contagem regressiva aparece.</li>
    <li><strong class="t">Deixe 2 segundos de silêncio no início</strong>Isso facilita o corte depois.</li>
    <li><strong class="t">Fale e toque, uma ação por vez</strong>Siga a regra: <strong>localizar → nomear → tocar → aguardar</strong> (seção 8).</li>
    <li><strong class="t">Pare a gravação</strong>Toque no quadrado da barra flutuante, ou abra o painel rápido e toque no botão de parar. O vídeo vai para a Galeria.</li>
  </ol>

  <h3>3.3 Teste de 10 segundos (sempre)</h3>
  <p>Antes de gravar de verdade, grave 10 segundos: diga uma frase, toque em algo e mude de tela. Assista e responda:</p>
  <ul>
    <li>A minha voz está clara e sem chiado?</li>
    <li>O círculo do toque aparece?</li>
    <li>Alguma notificação ou dado pessoal apareceu?</li>
    <li>As letras ficaram legíveis?</li>
  </ul>

  <div class="box warn">
    <strong>Alguns aplicativos bloqueiam a gravação</strong>
    Aplicativos de banco e alguns de saúde impedem que a tela seja gravada: o vídeo sai preto naquele trecho. Isso é uma proteção do aplicativo. Não tente contornar. Nesse caso, mostre o caminho com uma cartela explicativa e deixe claro no vídeo o que não foi mostrado.
  </div>
  <div class="box warn">
    <strong>Fone de ouvido</strong>
    Fone Bluetooth costuma baixar a qualidade do microfone. Se usar fone, prefira um com fio e microfone. Se não tiver, use o microfone do próprio celular.
  </div>
</section>

<section id="privacidade">
  <h2><span class="n" aria-hidden="true">4</span>Privacidade: o que nunca pode aparecer</h2>
  <p class="lead">Regra do projeto: a Aline Resolve não guarda senha de ninguém e não mostra dado de cliente.</p>
  <div class="box bad">
    <strong>Nunca grave a tela de um cliente</strong>
    Vídeo de tutorial é gravado em conta própria ou em conta de demonstração. Nunca na conta de uma cliente, nem com a cliente ao lado.
  </div>
  <div class="cols">
    <div class="col">
      <h3 class="badt">Não pode aparecer</h3>
      <ul>
        <li>Senhas, códigos de verificação, QR de autenticação</li>
        <li>CPF, RG, endereço, telefone, e-mail pessoais</li>
        <li>Número de carteirinha e dados de dependentes</li>
        <li>Diagnóstico, exame, receita, medicação</li>
        <li>Nome de contato, foto de perfil, conversa aberta</li>
        <li>Saldos, extratos, cartões</li>
      </ul>
    </div>
    <div class="col">
      <h3 class="good">Como proteger</h3>
      <ul>
        <li>Use conta própria ou de demonstração, autorizada pelo dono</li>
        <li>Não grave a digitação da senha; corte do campo vazio para a tela já acessada e diga isso na narração</li>
        <li>Desligue as notificações antes de começar</li>
        <li>Assista ao bruto inteiro, até o último quadro</li>
        <li>Se um dado vazar, regrave. Borrar no editor é o último recurso</li>
      </ul>
    </div>
  </div>
  <div class="box">
    <strong>Não use a tela de um app como se fosse de outro</strong>
    Nunca invente botão, menu ou etapa. Se não conseguiu confirmar como o aplicativo funciona hoje, grave o caminho real antes de escrever a narração.
  </div>
  <div class="box warn">
    <strong>Editores na nuvem</strong>
    CapCut, Canva e editores de celular com sincronização enviam o arquivo para a internet. Se o vídeo bruto tiver qualquer dado pessoal, ele já saiu do seu controle, mesmo que você borre depois. Anonimize localmente antes de subir.
  </div>
  <div class="box">
    <strong>Material gravado fica fora do Drive da Aline</strong>
    Vídeo bruto e dados do projeto ficam em <code>alineresolve-private/</code>. A pasta de entrada da Aline no Drive é só para o que ela mesma solta em linguagem natural: nunca coloque scripts, projetos de edição ou configurações nela.
  </div>
</section>

<section id="transferir">
  <h2><span class="n" aria-hidden="true">5</span>Levar o vídeo do S23 ao Windows</h2>
  <p class="lead">Do mais simples para o mais confortável.</p>

  <h3>Opção 1 — Cabo USB (recomendada: sem conta, sem nuvem)</h3>
  <ol class="steps">
    <li><strong class="t">Conecte o celular ao PC</strong>Use o cabo original ou um cabo de dados bom. Cabos só de carga não servem.</li>
    <li><strong class="t">Mude o modo USB</strong>No celular, toque na notificação <span class="ui-path">Carregando este dispositivo via USB</span> e escolha <strong>Transferência de arquivos</strong>. Libere o acesso se o celular pedir.</li>
    <li><strong class="t">Abra o Explorador de Arquivos</strong>Vá em <span class="ui-path">Este Computador → Galaxy S23 → Armazenamento interno</span>.</li>
    <li><strong class="t">Encontre a pasta</strong>As gravações costumam ficar em <code>DCIM\Screen recordings</code><span class="ver">verificar pasta</span>.</li>
    <li><strong class="t">Copie, não mova</strong>Copie para uma pasta do projeto no PC e só apague do celular depois de abrir o arquivo e conferir.</li>
  </ol>

  <h3>Opção 2 — Quick Share</h3>
  <p>A Samsung e o Google oferecem o <strong>Quick Share para Windows</strong>. Instale no PC, entre com a mesma conta e envie o vídeo direto pela Galeria do celular (<span class="ui-path">Compartilhar → Quick Share</span>). Funciona bem para arquivos pequenos. <span class="ver">verificar disponibilidade</span></p>

  <h3>Opção 3 — Vínculo com o Windows (Phone Link)</h3>
  <p>O app <span class="ui-path">Vínculo com o Windows</span> (Phone Link) mostra no PC as fotos e vídeos recentes do S23 e deixa copiar. Exige conta Microsoft e pareamento. Use só se já estiver configurado. <span class="ver">verificar</span></p>

  <div class="box warn">
    <strong>O que evitar</strong>
    Enviar o bruto por WhatsApp (comprime e baixa a qualidade) e subir o bruto em serviços de terceiros antes de conferir os dados.
  </div>

  <h3>Organize assim (simples, sem criar estrutura grande)</h3>
  <div class="cmd">
    <pre><code>Tutoriais\
  TUT-001_NomeDoApp\
    bruto\      (o arquivo do celular, intocado)
    projeto\    (arquivos do editor)
    final\      (MP4 pronto e capa)
  kit_obs_facecam\ (máscaras PNG e script .bat do scrcpy)</code></pre>
  </div>
  <p>Nome do arquivo final: <code>TUT-001_NomeDoApp_Tarefa_v01.mp4</code>. Guarde ao lado a versão do aplicativo e a data da gravação.</p>

  <h3>Confira o que o celular gravou</h3>
  <p>Clique com o botão direito no vídeo → <span class="ui-path">Propriedades → Detalhes</span>. Veja largura, altura e taxa de quadros. O normal do S23 é largura 1080 e altura 2340 (mais alto que 9:16). Com <code>ffprobe</code> (seção 6.3):</p>
  <div class="cmd">
    <button type="button" class="ghost" data-copy aria-live="polite">Copiar</button>
    <pre><code>ffprobe -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate,duration -of default=nw=1 bruto.mp4</code></pre>
  </div>
</section>

<section id="editar">
  <h2><span class="n" aria-hidden="true">6</span>Editar no Windows (gratuito)</h2>
  <p class="lead">Escolha uma ferramenta e fique com ela nos primeiros vídeos.</p>

  <div class="tw">
    <table>
      <caption class="sr-only">Comparativo de ferramentas gratuitas de edição de vídeo para Windows</caption>
      <thead>
        <tr>
          <th scope="col">Ferramenta</th>
          <th scope="col">Quando usar</th>
          <th scope="col">Prós</th>
          <th scope="col">Cuidados</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Clipchamp</strong> <span class="ver">recomendado</span></td>
          <td>Para começar. Já vem no Windows 11.</td>
          <td>Simples, legenda automática, gravação de voz, exporta em 1080p no plano gratuito.</td>
          <td>Recursos e limites mudam com a versão e o plano. A legenda automática pode depender do idioma e da conta. Verifique antes de planejar.</td>
        </tr>
        <tr>
          <td><strong>DaVinci Resolve</strong> (gratuito)</td>
          <td>Para mais controle de zoom, áudio e cor.</td>
          <td>Edição local, sem enviar nada, qualidade profissional.</td>
          <td>Pede computador razauvel e aprendizado. Se der erro de áudio ou codec, converta o bruto (6.3).</td>
        </tr>
        <tr>
          <td><strong>ffmpeg + whisper-cli</strong></td>
          <td>Cortar, ajustar formato e transcrever sem nuvem.</td>
          <td>Rápido, repetível, tudo local; é o que o projeto já usa.</td>
          <td>Linha de comando. Não tem linha do tempo visual.</td>
        </tr>
        <tr>
          <td><strong>CapCut</strong></td>
          <td>Só em contingência.</td>
          <td>Muitos recursos de legenda e efeitos.</td>
          <td>Envia arquivos à nuvem. Use apenas depois de anonimizar o vídeo.</td>
        </tr>
      </tbody>
    </table>
  </div>

  <h3>6.1 Receita no Clipchamp</h3>
  <ol class="steps">
    <li><strong class="t">Novo vídeo</strong>Abra o Clipchamp, <span class="ui-path">Criar novo vídeo</span>. Mude a proporção para <strong>9:16</strong>.</li>
    <li><strong class="t">Importe o bruto</strong>Arraste o MP4 para a mídia e depois para a linha do tempo.</li>
    <li><strong class="t">Ajuste o enquadramento</strong>O vídeo do S23 é mais alto que 9:16. Use <span class="ui-path">Preencher</span> para cortar um pouco em cima e embaixo (isso também esconde a barra de status). Se o botão importante ficar perto da borda, escolha <span class="ui-path">Ajustar</span> e mantenha as bordas.</li>
    <li><strong class="t">Corte o que não ensina</strong>Corte esperas longas de carregamento, tropeços e silêncios sem função. Preserve o tempo que a pessoa precisa para achar o botão e ver o resultado.</li>
    <li><strong class="t">Zoom suave</strong>Copie o trecho, ajuste o tamanho entre 120% e 160% e posicione sobre o botão. Antes de aproximar, mostre onde ele fica na tela inteira.</li>
    <li><strong class="t">Destaque</strong>Um círculo ou contorno amarelo com borda escura, um destaque por vez.</li>
    <li><strong class="t">Legendas</strong>Gere a legenda automática, <strong>corrija cada linha</strong> e confira o nome dos botões. Máximo de duas linhas por bloco.</li>
    <li><strong class="t">Áudio</strong>Reduza ruído se houver a opção, deixe a voz constante e sem música nos primeiros vídeos.</li>
    <li><strong class="t">Exportar</strong>1080p, MP4. Assista no celular antes de publicar.</li>
  </ol>

  <h3>6.2 Receita no DaVinci Resolve (resumo)</h3>
  <ol>
    <li>Novo projeto, <span class="ui-path">Project Settings</span> → resolução <strong>1080 × 1920</strong>, 30 quadros por segundo.</li>
    <li>Importe o bruto na aba <span class="ui-path">Media</span>, arraste para a linha do tempo na aba <span class="ui-path">Edit</span>.</li>
    <li>Use <span class="ui-path">Inspector → Zoom e Position</span> para enquadrar e criar o zoom.</li>
    <li>Legenda: <span class="ui-path">Timeline → Create Subtitles from Audio</span> existe em versões recentes <span class="ver">verificar na sua versão</span>; revise tudo.</li>
    <li>Exporte em <span class="ui-path">Deliver</span>: preset <span class="ui-path">H.264</span>, 1080 × 1920, MP4.</li>
  </ol>

  <h3>6.3 Receita com ffmpeg (opcional, já usada no projeto)</h3>
  <p>Instalação no Windows, uma vez, pelo PowerShell:</p>
  <div class="cmd">
    <button type="button" class="ghost" data-copy aria-live="polite">Copiar</button>
    <pre><code>winget install Gyan.FFmpeg</code></pre>
  </div>
  <p>Feche e abra o PowerShell depois de instalar.</p>

  <p><strong>Ajustar o bruto do S23 para 1080 × 1920 e 30 quadros</strong> (corta o topo para esconder a barra de status; mude <code>120</code> se precisar mostrar mais embaixo ou em cima):</p>
  <div class="cmd">
    <button type="button" class="ghost" data-copy aria-live="polite">Copiar</button>
    <pre><code>ffmpeg -i bruto.mp4 -vf "crop=1080:1920:0:120,fps=30" -c:v libx264 -crf 18 -pix_fmt yuv420p -c:a aac -b:a 192k pronto_para_editar.mp4</code></pre>
  </div>

  <p><strong>Cortar um trecho</strong> (início e fim em horas:minutos:segundos):</p>
  <div class="cmd">
    <button type="button" class="ghost" data-copy aria-live="polite">Copiar</button>
    <pre><code>ffmpeg -i pronto_para_editar.mp4 -ss 00:00:03 -to 00:00:45 -c:v libx264 -crf 18 -c:a aac corte.mp4</code></pre>
  </div>

  <p><strong>Tirar só o áudio para transcrever</strong> (16 kHz, mono):</p>
  <div class="cmd">
    <button type="button" class="ghost" data-copy aria-live="polite">Copiar</button>
    <pre><code>ffmpeg -i corte.mp4 -ar 16000 -ac 1 audio.wav</code></pre>
  </div>

  <p><strong>Transcrever sem nuvem com whisper.cpp</strong> (precisa do programa e de um modelo baixados; no Mac do projeto o programa é o <code>whisper-cli</code>):</p>
  <div class="cmd">
    <button type="button" class="ghost" data-copy aria-live="polite">Copiar</button>
    <pre><code>whisper-cli -m modelo.bin -l pt -osrt -f audio.wav</code></pre>
  </div>
  <p>O resultado é um arquivo <code>.srt</code> de legenda. Importe no Clipchamp ou no DaVinci e revise.</p>
  <div class="box warn">
    <strong>Verifique os caminhos</strong>
    Os comandos acima são o modelo. Ajuste os nomes dos arquivos e, se o nome tiver espaço, coloque entre aspas. Rode em uma cópia: nunca sobrescreva o bruto.
  </div>
</section>

<section id="planob">
  <h2><span class="n" aria-hidden="true">7</span>Plano B e Modo C: Gravar S23 pelo PC + Facecam Circular no OBS</h2>
  <p class="lead">Use se o celular travar na gravação, se preferir operar pelo PC ou quando quiser gravar seu rosto falando dentro de um círculo flutuante (estilo bubble cam).</p>

  <h3>7.1 Opção 1 — Espelhamento limpo com scrcpy (gratuito, local)</h3>
  <p>Mostra e controla a tela do Android no PC via cabo USB, mantendo 30 quadros por segundo estáveis e a tela sempre acesa.</p>
  <ol class="steps">
    <li>
      <strong class="t">Instale no PowerShell</strong>
      <div class="cmd">
        <button type="button" class="ghost" data-copy aria-live="polite">Copiar</button>
        <pre><code>winget install Genymobile.scrcpy</code></pre>
      </div>
    </li>
    <li><strong class="t">Ative a depuração USB no S23</strong><span class="ui-path">Configurações → Sobre o telefone → Informações do software</span>: toque 7 vezes em <span class="ui-path">Número de compilação</span>. Depois, em <span class="ui-path">Opções do desenvolvedor</span>, ligue <span class="ui-path">Depuração USB</span>. Aceite a autorização quando o celular perguntar. <span class="ver">verificar nomes</span></li>
    <li>
      <strong class="t">Use o script Abrir_Android_no_Windows.bat</strong>
      Copie o arquivo <code>Abrir_Android_no_Windows.bat</code> para a mesma pasta do <code>scrcpy.exe</code> (ou use o script PowerShell da equipe). Ele executa o espelhamento sem duplicar o áudio, trava em 30 fps e mantém a tela ativa:
      <div class="cmd">
        <button type="button" class="ghost" data-copy aria-live="polite">Copiar</button>
        <pre><code>@echo off
cd /d "%~dp0"
scrcpy.exe --no-audio --max-fps=30 --stay-awake --pause-on-exit=if-error</code></pre>
      </div>
    </li>
    <li>
      <strong class="t">Alternativa para gravar direto pelo scrcpy sem OBS</strong>
      <div class="cmd">
        <button type="button" class="ghost" data-copy aria-live="polite">Copiar</button>
        <pre><code>scrcpy --show-touches --max-fps=30 --stay-awake --record=bruto_pc.mp4</code></pre>
      </div>
    </li>
  </ol>
  <p>Desative a depuração USB quando terminar.</p>

  <h3>7.2 Modo C — Rosto em Círculo Flutuante (Kit Facecam OBS Studio)</h3>
  <p>Ideal para tutoriais interativos de sites web (16:9 no YouTube) ou aplicativos espelhados (9:16 no Reels), onde seu rosto aparece falando dentro de um círculo no canto superior direito ou inferior da tela.</p>
  <ol class="steps">
    <li><strong class="t">Feche outros aplicativos de câmera</strong>Antes de abrir o OBS Studio, feche Zoom, Teams, navegador ou qualquer programa que esteja usando a webcam.</li>
    <li><strong class="t">Adicione a tela de fundo</strong>Em <span class="ui-path">Fontes → +</span>, adicione <span class="ui-path">Captura de Janela</span> (selecione a janela do <code>scrcpy</code> ou do navegador web) ou <span class="ui-path">Captura de Tela</span>.</li>
    <li><strong class="t">Adicione sua webcam e deixe quadrada (1:1)</strong>Adicione <span class="ui-path">Dispositivo de Captura de Vídeo</span>. Clique com o botão direito na fonte da webcam → <span class="ui-path">Filtros</span> → em <span class="ui-path">Filtros de Efeito</span> clique em <span class="ui-path">+ → Recortar/Preencher (Crop/Pad)</span>. Recorte as laterais (ex.: Esquerda 420 e Direita 420 em uma câmera 1920×1080) para que a imagem fique exatamente quadrada (1080×1080). Se não estiver 1:1, o círculo ficará oval.</li>
    <li><strong class="t">Aplique a máscara circular Alpha</strong>Ainda em <span class="ui-path">Filtros de Efeito</span> da webcam, clique em <span class="ui-path">+ → Máscara/Mistura de imagem (Image Mask/Blend)</span>. Em <span class="ui-path">Tipo</span>, escolha <strong>Máscara alfa (canal alfa) / Alpha Mask (Alpha Channel)</strong>. Em <span class="ui-path">Caminho</span>, selecione o arquivo <code>mascara_circular_OBS_alpha.png</code>.</li>
    <li><strong class="t">Adicione a borda dourada opcional</strong>Na lista de <span class="ui-path">Fontes</span>, clique em <span class="ui-path">+ → Imagem</span>, escolha <code>borda_dourada_opcional.png</code> e posicione-a na camada imediatamente <strong>acima</strong> da webcam. Redimensione e alinhe exatamente sobre o círculo. (Dica: selecione a webcam e a borda juntas, clique com o botão direito e escolha <span class="ui-path">Agrupar itens selecionados</span> para mover os dois juntos pela tela).</li>
    <li><strong class="t">Posicione sem tampar botões</strong>Em vídeos horizontais (16:9 para YouTube), posicione o círculo no canto superior direito, como no modelo de referência. Em vídeos verticais (9:16 para Reels), posicione no topo central/direito, fora da área onde os botões do aplicativo aparecem.</li>
  </ol>

  <h3>7.3 Opção 2 — Xbox Game Bar (emergência)</h3>
  <p>Se estiver espelhando o celular em uma janela, aperte <kbd>Win</kbd> + <kbd>Alt</kbd> + <kbd>R</kbd> para gravar a janela ativa com microfone. A qualidade depende do espelhamento. <span class="ver">verificar</span></p>

  <div class="box">
    <strong>Qual escolher?</strong>
    Gravador nativo do S23 como padrão rápido. <strong>OBS Studio + Kit Facecam + scrcpy</strong> quando quiser presença pessoal com rosto em círculo. Game Bar só em emergência.
  </div>
</section>

<section id="roteiro">
  <h2><span class="n" aria-hidden="true">8</span>Roteiro e voz: Método CALMA</h2>
  <p class="lead">Uma tarefa de cada vez. Uma instrução de cada vez. Uma conquista ao final.</p>

  <div class="tw">
    <table>
      <caption class="sr-only">Etapas do Método CALMA para elaboração de roteiros</caption>
      <thead>
        <tr>
          <th scope="col">Letra</th>
          <th scope="col">O que fazer</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>C</strong></td>
          <td><strong>Comece pela dificuldade real.</strong> Diga o problema da pessoa em uma frase. Não comece explicando o aplicativo.</td>
        </tr>
        <tr>
          <td><strong>A</strong></td>
          <td><strong>Aponte um alvo único.</strong> Complete: “Ao terminar este vídeo, a pessoa conseguirá ____, sem precisar ____.” Se não completar, o tema está grande demais.</td>
        </tr>
        <tr>
          <td><strong>L</strong></td>
          <td><strong>Localize antes de mandar tocar.</strong> Nomear → mostrar → tocar → aguardar.</td>
        </tr>
        <tr>
          <td><strong>M</strong></td>
          <td><strong>Mostre, narre, marque e pause.</strong> Tela estável, frase curta, destaque no botão, pausa para ver o resultado.</td>
        </tr>
        <tr>
          <td><strong>A</strong></td>
          <td><strong>Assegure o resultado.</strong> Mostre o que comprova que deu certo e só então encerre.</td>
        </tr>
      </tbody>
    </table>
  </div>

  <h3>Ritmo (valores iniciais, ajuste com testes)</h3>
  <ul>
    <li>Fala: <strong>110 a 135 palavras por minuto</strong>, mais devagar nas decisões.</li>
    <li>Pausa de cerca de <strong>1 segundo antes do toque</strong> e de <strong>1,5 a 3 segundos depois de mudar de tela</strong>.</li>
    <li>Uma ação principal por frase.</li>
    <li>Sem música nos primeiros vídeos.</li>
  </ul>

  <h3>Narração ruim × narração boa</h3>
  <div class="tw">
    <table>
      <caption class="sr-only">Exemplos comparativos entre narração inadequada e narração recomendada</caption>
      <thead>
        <tr>
          <th scope="col">Evite</th>
          <th scope="col">Prefira</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>“Clica aqui.”</td>
          <td>“Na parte de baixo da tela, procure o botão <strong>[NOME DO BOTÃO]</strong>. Toque uma vez.”</td>
        </tr>
        <tr>
          <td>“Agora é só fazer o login.”</td>
          <td>“Vamos entrar na conta. Primeiro, encontre o campo onde o aplicativo pede <strong>[DADO]</strong>.”</td>
        </tr>
        <tr>
          <td>“Abre o menu e escolhe a opção.”</td>
          <td>“Toque no símbolo de três linhas, no canto da tela. Ele abre as outras opções.”</td>
        </tr>
        <tr>
          <td>“É muito fácil, não tem erro.”</td>
          <td>“Vou mostrar cada etapa para você acompanhar com calma.”</td>
        </tr>
        <tr>
          <td>“E pronto, já foi!”</td>
          <td>“Quando aparecer <strong>[CONFIRMAÇÃO]</strong> na tela, esta etapa foi concluída.”</td>
        </tr>
      </tbody>
    </table>
  </div>
  <p>Os nomes entre colchetes só entram depois de você ver o nome real na tela do aplicativo.</p>

  <h3>Modelo de roteiro (copie para cada vídeo)</h3>
  <div class="tw">
    <table>
      <caption class="sr-only">Modelo estruturado de roteiro segundo a segundo</caption>
      <thead>
        <tr>
          <th scope="col">Tempo</th>
          <th scope="col">Imagem na tela</th>
          <th scope="col">Ação realizada</th>
          <th scope="col">Narração exata</th>
          <th scope="col">Texto / efeito</th>
          <th scope="col">Acessibilidade</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>0–6 s</td>
          <td>Tela inicial do celular</td>
          <td>Mostrar o problema</td>
          <td>“Você precisa <strong>[OBJETIVO]</strong>? Vou mostrar um passo de cada vez.”</td>
          <td>Título curto</td>
          <td>Fonte grande, contraste alto</td>
        </tr>
        <tr>
          <td>6–14 s</td>
          <td>Ícone do aplicativo</td>
          <td>Abrir o app</td>
          <td>“Procure o aplicativo <strong>[APP]</strong>. Toque nele uma vez.”</td>
          <td>Círculo no ícone</td>
          <td>Pausa antes do toque</td>
        </tr>
        <tr>
          <td>14–28 s</td>
          <td>Tela real 1</td>
          <td>Ação 1</td>
          <td>“Procure <strong>[BOTÃO REAL]</strong> e toque.”</td>
          <td>Zoom 1,3×</td>
          <td>Mostrar a tela inteira antes</td>
        </tr>
        <tr>
          <td>28–45 s</td>
          <td>Tela real 2</td>
          <td>Ação 2</td>
          <td>“<strong>[INSTRUÇÃO EXATA]</strong>.”</td>
          <td>Destaque na opção</td>
          <td>Pausa de 2 s após a mudança</td>
        </tr>
        <tr>
          <td>45–60 s</td>
          <td>Tela de resultado</td>
          <td>Conferir</td>
          <td>“Quando aparecer <strong>[CONFIRMAÇÃO]</strong>, deu certo.”</td>
          <td>Contorno na confirmação</td>
          <td>Não cobrir com legenda</td>
        </tr>
        <tr>
          <td>60–68 s</td>
          <td>Cartela final</td>
          <td>Encerrar</td>
          <td>“Salve este vídeo para ver de novo quando precisar.”</td>
          <td>“Salve para consultar”</td>
          <td>Pouco texto</td>
        </tr>
      </tbody>
    </table>
  </div>

  <h3>Calculadora de tempo da narração</h3>
  <p>Cole a narração. A calculadora mostra a duração para falar entre 110 e 135 palavras por minuto.</p>
  <label for="narr" class="form-label">Texto da narração</label>
  <textarea id="narr" placeholder="Cole aqui a narração do vídeo…"></textarea>
  <div class="calc" aria-live="polite">
    <div>
      <span>Palavras</span>
      <output id="c-words" for="narr">0</output>
    </div>
    <div>
      <span>Falando a 135 pal./min</span>
      <output id="c-fast" for="narr">0 s</output>
    </div>
    <div>
      <span>Falando a 110 pal./min</span>
      <output id="c-slow" for="narr">0 s</output>
    </div>
  </div>
  <p class="muted-note">Não inclui as pausas. Some de 20% a 40% para o tempo de olhar a tela.</p>
</section>

<section id="instagram">
  <h2><span class="n" aria-hidden="true">9</span>Edição, Instagram e YouTube: padrões iniciais</h2>
  <p class="lead">Valores de partida. O teste final é assistir no celular.</p>
  <div class="tw">
    <table>
      <caption class="sr-only">Parâmetros técnicos de vídeo, áudio e design para publicação</caption>
      <thead>
        <tr>
          <th scope="col">Item</th>
          <th scope="col">Padrão inicial</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Formato Reels (Vertical)</td>
          <td>Vertical 9:16, <strong>1080 × 1920</strong></td>
        </tr>
        <tr>
          <td>Formato YouTube (Horizontal)</td>
          <td>Horizontal 16:9, <strong>1920 × 1080</strong> (ideal para tutoriais web + facecam circular)</td>
        </tr>
        <tr>
          <td>Quadros por segundo</td>
          <td>30</td>
        </tr>
        <tr>
          <td>Arquivo</td>
          <td>MP4, vídeo H.264, áudio AAC</td>
        </tr>
        <tr>
          <td>Legenda</td>
          <td>48 a 64 pixels, negrito, texto claro em faixa escura, no máximo duas linhas</td>
        </tr>
        <tr>
          <td>Contraste</td>
          <td>Pelo menos 4,5 para 1 em texto comum</td>
        </tr>
        <tr>
          <td>Zoom</td>
          <td>1,2× a 1,6×, lento, sempre depois de mostrar a tela inteira</td>
        </tr>
        <tr>
          <td>Cortes e transições</td>
          <td>Cortes secos, quase nenhuma transição</td>
        </tr>
        <tr>
          <td>Música</td>
          <td>Nenhuma nos primeiros vídeos</td>
        </tr>
        <tr>
          <td>Cores</td>
          <td>Petróleo, branco e dourado (incluindo a <code>borda_dourada_opcional.png</code> na facecam); um destaque ativo por vez</td>
        </tr>
      </tbody>
    </table>
  </div>
  <div class="box warn">
    <strong>Zona segura do Instagram</strong>
    Nome do perfil, legenda do post e botões ocupam as bordas do Reels, e essas áreas mudam com as versões do aplicativo. Não cole legendas, facecam circular nem botões importantes na borda de baixo ou na da direita. Confira na prévia do próprio Instagram, em um celular pequeno. <span class="ver">verificar</span>
  </div>
  <h3>Título, capa e legenda do post</h3>
  <ul>
    <li><strong>Título:</strong> “Como” + tarefa + aplicativo. Exemplo: “Como aumentar as letras do WhatsApp”. Sem promessa de “facílimo”.</li>
    <li><strong>Capa:</strong> nome do app, a tarefa e o número da série. Legível em miniatura.</li>
    <li><strong>Legenda do post:</strong> benefício, o que precisa ter antes, resumo dos passos, um alerta útil e um pedido só.</li>
    <li><strong>Pedido final:</strong> “Salve para ver de novo” ou “Envie para quem está aprendendo”. Um por vídeo.</li>
    <li><strong>Aviso:</strong> “Tutorial educativo independente. As telas podem mudar conforme a versão do aplicativo.”</li>
  </ul>
  <h3>Teste final: três verificações</h3>
  <ol>
    <li><strong>Sem som:</strong> dá para acompanhar só pelas imagens e legendas?</li>
    <li><strong>Sem olhar:</strong> só ouvindo, dá para saber o que procurar e o que fazer?</li>
    <li><strong>Execução real:</strong> uma pessoa do público consegue repetir no celular dela, sem ajuda?</li>
  </ol>
</section>

<section id="checklist" aria-labelledby="chk-heading">
  <h2 id="chk-heading"><span class="n" aria-hidden="true">10</span>Checklist de produção</h2>
  <p class="lead">Marque conforme avança. Fica salvo neste navegador (se ele permitir).</p>
  <div class="prog-wrap">
    <label for="bar" id="prog-txt" class="prog-label">0 de 0 itens concluídos (0%)</label>
    <progress id="bar" class="prog" max="100" value="0"></progress>
  </div>

  <fieldset class="chk-group">
    <legend>Antes de gravar</legend>
    <ul class="chk">
      <li><input type="checkbox" id="a1" data-chk><label for="a1">Tarefa escolhida e resultado escrito em uma frase</label></li>
      <li><input type="checkbox" id="a2" data-chk><label for="a2">Caminho testado no aplicativo, com conta própria ou de demonstração</label></li>
      <li><input type="checkbox" id="a3" data-chk><label for="a3">Versão do aplicativo e data anotadas</label></li>
      <li><input type="checkbox" id="a4" data-chk><label for="a4">Nome real de cada botão conferido na tela</label></li>
      <li><input type="checkbox" id="a5" data-chk><label for="a5">Roteiro escrito (uma ação por frase)</label></li>
      <li><input type="checkbox" id="a6" data-chk><label for="a6">Não perturbe ligado e notificações fechadas</label></li>
      <li><input type="checkbox" id="a7" data-chk><label for="a7">Bateria acima de 50% e espaço livre</label></li>
      <li><input type="checkbox" id="a8" data-chk><label for="a8">Gravador em Mídia e microfone, 1080p, mostrar toques ligado</label></li>
      <li><input type="checkbox" id="a9" data-chk><label for="a9">Teste de 10 segundos assistido</label></li>
    </ul>
  </fieldset>

  <fieldset class="chk-group">
    <legend>Se usar Modo C (Kit Facecam Circular no OBS + scrcpy)</legend>
    <ul class="chk">
      <li><input type="checkbox" id="o1" data-chk><label for="o1">Outros programas que usam a webcam fechados antes de abrir o OBS</label></li>
      <li><input type="checkbox" id="o2" data-chk><label for="o2">Webcam recortada na proporção quadrada 1:1 (filtro Recortar/Preencher)</label></li>
      <li><input type="checkbox" id="o3" data-chk><label for="o3">Filtro Máscara alfa aplicado com mascara_circular_OBS_alpha.png (e borda_dourada_opcional.png alinhada)</label></li>
      <li><input type="checkbox" id="o4" data-chk><label for="o4">Script Abrir_Android_no_Windows.bat rodando a 30 fps estáveis e tela ativa</label></li>
    </ul>
  </fieldset>

  <fieldset class="chk-group">
    <legend>Antes de publicar</legend>
    <ul class="chk">
      <li><input type="checkbox" id="b1" data-chk><label for="b1">Bruto assistido inteiro: nenhum dado pessoal à vista</label></li>
      <li><input type="checkbox" id="b2" data-chk><label for="b2">Nenhum botão ou etapa inventados</label></li>
      <li><input type="checkbox" id="b3" data-chk><label for="b3">Voz clara, sem eco e sem música competindo</label></li>
      <li><input type="checkbox" id="b4" data-chk><label for="b4">Legenda revisada linha por linha</label></li>
      <li><input type="checkbox" id="b5" data-chk><label for="b5">Pausas suficientes para achar o botão e ver o resultado</label></li>
      <li><input type="checkbox" id="b6" data-chk><label for="b6">Legenda e facecam circular não cobrem botão nem confirmação</label></li>
      <li><input type="checkbox" id="b7" data-chk><label for="b7">Visto no celular, em volume baixo e no alto-falante</label></li>
      <li><input type="checkbox" id="b8" data-chk><label for="b8">Os três testes finais feitos (sem som, sem olhar, execução real)</label></li>
      <li><input type="checkbox" id="b9" data-chk><label for="b9">Capa, título e legenda do post prontos, com aviso de versão</label></li>
      <li><input type="checkbox" id="b10" data-chk><label for="b10">Texto passou pela revisão de limites do projeto</label></li>
    </ul>
  </fieldset>

  <fieldset class="chk-group">
    <legend>Depois de publicar</legend>
    <ul class="chk">
      <li><input type="checkbox" id="c1" data-chk><label for="c1">Vídeo aberto no ar: som, capa e legenda conferidos</label></li>
      <li><input type="checkbox" id="c2" data-chk><label for="c2">Após 7 dias: alcance, salvamentos, compartilhamentos e tempo médio anotados</label></li>
      <li><input type="checkbox" id="c3" data-chk><label for="c3">Dúvidas nos comentários listadas</label></li>
      <li><input type="checkbox" id="c4" data-chk><label for="c4">Uma melhoria concreta escolhida para o próximo vídeo</label></li>
    </ul>
  </fieldset>

  <p><button type="button" class="ghost" id="reset">Limpar marcações</button></p>
</section>

<section id="problemas">
  <h2><span class="n" aria-hidden="true">11</span>Problemas comuns</h2>
  <details open>
    <summary>O vídeo não tem a minha voz</summary>
    <p>O Som estava em <span class="ui-path">Mídia</span> ou <span class="ui-path">Sem som</span>. Mude para <span class="ui-path">Mídia e microfone</span>. Verifique também se o app Gravador de tela tem permissão de microfone em <span class="ui-path">Configurações → Aplicativos</span>.</p>
  </details>
  <details>
    <summary>O círculo da webcam no OBS ficou oval ou deformado</summary>
    <p>A fonte da webcam está em formato retangular (16:9). Adicione primeiro o filtro <span class="ui-path">Recortar/Preencher (Crop/Pad)</span> acima da máscara alfa para deixar a câmera quadrada (1:1) antes do recorte circular.</p>
  </details>
  <details>
    <summary>A câmera não aparece no OBS Studio</summary>
    <p>Outro aplicativo (navegador, WhatsApp Web, Meet, Teams) está ocupando a webcam. Feche esses programas e desative/ative a fonte de captura de vídeo no OBS.</p>
  </details>
  <details>
    <summary>O vídeo não tem o som do aplicativo</summary>
    <p>O volume de mídia do celular estava no zero ou o aplicativo não emite som. Suba o volume de mídia e teste de novo.</p>
  </details>
  <details>
    <summary>A voz sai com eco ou chiado</summary>
    <p>Cômodo vazio e com piso duro cria eco. Grave perto de cortinas e sofá, afaste o ventilador e, se possível, use fone com fio e microfone.</p>
  </details>
  <details>
    <summary>A tela do aplicativo ficou preta</summary>
    <p>O aplicativo bloqueia a captura. Não contorne. Use uma cartela explicativa e diga no vídeo o que não foi mostrado.</p>
  </details>
  <details>
    <summary>Apareceu uma notificação no vídeo</summary>
    <p>Regrave o trecho. Na próxima, use Não perturbe e desligue as notificações do aplicativo que você está ensinando.</p>
  </details>
  <details>
    <summary>O botão ficou pequeno demais no vídeo</summary>
    <p>Aumente a fonte do sistema antes de gravar e use zoom de 120% a 160% no editor, depois de mostrar a tela inteira.</p>
  </details>
  <details>
    <summary>Legenda cobrindo o botão</summary>
    <p>Mude a legenda para o topo naquele trecho ou encurte o texto. Se nada resolver, mova o vídeo para cima na tela.</p>
  </details>
  <details>
    <summary>O Windows não enxerga o celular</summary>
    <p>Troque o cabo, escolha <span class="ui-path">Transferência de arquivos</span> na notificação USB, destrave o celular e tente outra porta USB.</p>
  </details>
  <details>
    <summary>O editor recusa o arquivo ou fica sem áudio</summary>
    <p>Converta com o ffmpeg (seção 6.3) para MP4 H.264/AAC de 30 quadros e importe de novo.</p>
  </details>
  <details>
    <summary>O arquivo ficou grande demais</summary>
    <p>Exporte em 1080p com taxa de bits moderada, ou use <code>-crf 20</code> no ffmpeg. Não baixe para 480p: a letra deixa de ser legível.</p>
  </details>
</section>

<section id="pendencias">
  <h2><span class="n" aria-hidden="true">12</span>O que ainda precisa ser verificado</h2>
  <p class="lead">Itens marcados <span class="ver">verificar</span> neste guia dependem da versão do que você tem em mãos.</p>
  <ul>
    <li>Nomes exatos dos menus do <strong>One UI</strong> instalado no S23 (gravador de tela, fonte, depuração USB).</li>
    <li>Recursos e limites do <strong>Clipchamp</strong> no seu plano gratuito (legenda automática, exportação).</li>
    <li>Compatibilidade de áudio e codec do <strong>DaVinci Resolve</strong> gratuito no seu Windows.</li>
    <li>Disponibilidade do <strong>Quick Share</strong> e do <strong>Vínculo com o Windows</strong> no seu PC.</li>
    <li>Regras e zonas seguras atuais dos <strong>Reels</strong> e das métricas do Instagram.</li>
    <li>Fatos dos aplicativos ensinados (telas, números de contato, fluxos): confirme na ajuda oficial e no próprio aparelho antes de falar no vídeo.</li>
    <li>Decisões do projeto ainda abertas: qual conta será usada nas gravações, o pedido final padrão dos vídeos, o ritmo de publicação e a divisão entre quem grava e quem edita.</li>
    <li>Revisão do prompt e da resposta do GPT que originaram este guia (pasta <code>pop_gravar_videos_alineresolve</code>).</li>
  </ul>
</section>

<footer>
  Guia de produção interno · Aline Resolve · v2.0 gerado em 24/10/2026. Sem dados de clientes. Os valores técnicos são pontos de partida, não regras do Instagram nem da Samsung.
</footer>
</main>

<script>
(() => {
  const STORAGE_KEY = 'alineresolve-guia-s23-checklist-v2';
  const checkboxes = Array.from(document.querySelectorAll('[data-chk]'));
  const progressBar = document.getElementById('bar');
  const progressText = document.getElementById('prog-txt');
  const resetButton = document.getElementById('reset');

  const loadState = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  };

  const saveState = () => {
    try {
      const state = {};
      checkboxes.forEach((box) => {
        if (box.checked) {
          state[box.id] = 1;
        }
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignora silenciosamente se o navegador bloquear localStorage
    }
  };

  const updateProgress = () => {
    const total = checkboxes.length;
    const completed = checkboxes.filter((box) => box.checked).length;
    const percentage = total ? Math.round((completed * 100) / total) : 0;

    if (progressBar) {
      progressBar.value = percentage;
    }
    if (progressText) {
      progressText.textContent = `${completed} de ${total} itens concluídos (${percentage}%)`;
    }
  };

  const savedState = loadState();
  checkboxes.forEach((box) => {
    box.checked = Boolean(savedState[box.id]);
    box.addEventListener('change', () => {
      saveState();
      updateProgress();
    });
  });
  updateProgress();

  resetButton?.addEventListener('click', () => {
    checkboxes.forEach((box) => {
      box.checked = false;
    });
    saveState();
    updateProgress();
  });

  // Botões de cópia com suporte a Clipboard API e fallback acessível
  document.querySelectorAll('[data-copy]').forEach((button) => {
    button.addEventListener('click', async () => {
      const codeEl = button.parentElement?.querySelector('pre code');
      const textToCopy = codeEl ? codeEl.textContent : '';
      const originalLabel = button.textContent;

      const indicateSuccess = () => {
        button.textContent = 'Copiado!';
        setTimeout(() => {
          button.textContent = originalLabel;
        }, 1500);
      };

      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(textToCopy);
          indicateSuccess();
          return;
        }
      } catch {
        // Segue para o fallback de seleção manual
      }

      try {
        if (codeEl) {
          const range = document.createRange();
          range.selectNodeContents(codeEl);
          const selection = window.getSelection();
          selection?.removeAllRanges();
          selection?.addRange(range);
        }
      } catch {
        // Ignora erro caso seleção não seja suportada
      }
    });
  });

  // Calculadora de duração da narração
  const narrativeInput = document.getElementById('narr');
  const wordsOutput = document.getElementById('c-words');
  const fastOutput = document.getElementById('c-fast');
  const slowOutput = document.getElementById('c-slow');

  const formatDuration = (seconds) => {
    if (!Number.isFinite(seconds) || seconds <= 0) {
      return '0 s';
    }
    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = Math.round(seconds % 60);
    if (remainingSeconds === 60) {
      minutes += 1;
      remainingSeconds = 0;
    }
    return minutes > 0
      ? `${minutes} min ${String(remainingSeconds).padStart(2, '0')} s`
      : `${remainingSeconds} s`;
  };

  const updateNarrativeMetrics = () => {
    if (!narrativeInput) return;
    const trimmed = narrativeInput.value.trim();
    const wordCount = trimmed ? trimmed.split(/\s+/).length : 0;

    if (wordsOutput) wordsOutput.value = String(wordCount);
    if (fastOutput) fastOutput.value = formatDuration((wordCount / 135) * 60);
    if (slowOutput) slowOutput.value = formatDuration((wordCount / 110) * 60);
  };

  narrativeInput?.addEventListener('input', updateNarrativeMetrics);
  updateNarrativeMetrics();
})();
</script>
</body>
</html>
`​`​`

---

### 4. Script PowerShell de Automação (`setup_kit_gravacao.ps1`)

Salve o código abaixo como `setup_kit_gravacao.ps1` e execute no PowerShell do Windows. Ele verifica e instala `FFmpeg` e `scrcpy` via `winget`, cria a árvore de diretórios do projeto e gera o arquivo `Abrir_Android_no_Windows.bat`[cite: 3, 4] pronto para uso:

`​`​`powershell
<#
.SYNOPSIS
Configura o ambiente de gravação (FFmpeg + scrcpy) e estrutura de pastas do projeto Aline Resolve.
.DESCRIPTION 1. Verifica disponibilidade do winget e instala Gyan.FFmpeg e Genymobile.scrcpy. 2. Cria a hierarquia Tutoriais\TUT-001_NomeDoApp\{bruto,projeto,final} e kit_obs_facecam\. 3. Gera o script Abrir_Android_no_Windows.bat e copia os assets PNG caso estejam no diretório atual.
#>

$ErrorActionPreference = "Stop"

Write-Host "=== [1/3] Verificando dependencias via winget ===" -ForegroundColor Cyan

if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
Write-Warning "O gerenciador de pacotes 'winget' nao foi encontrado. Instale o 'Instalador de Aplicativo' pela Microsoft Store."
} else {
$packages = @(
@{ Id = "Gyan.FFmpeg"; Name = "FFmpeg" },
@{ Id = "Genymobile.scrcpy"; Name = "scrcpy" }
)

    foreach ($pkg in $packages) {
        Write-Host "Verificando $($pkg.Name) ($($pkg.Id))..."
        $installed = winget list --id $pkg.Id --exact --accept-source-agreements 2>$null | Select-String $pkg.Id
        if ($installed) {
            Write-Host "  [OK] $($pkg.Name) ja esta instalado." -ForegroundColor Green
        } else {
            Write-Host "  [INSTALANDO] $($pkg.Name)..." -ForegroundColor Yellow
            winget install --id $pkg.Id --exact --silent --accept-package-agreements --accept-source-agreements
        }
    }

}

Write-Host "`n=== [2/3] Criando estrutura de diretorios do projeto ===" -ForegroundColor Cyan

$baseDir = Join-Path -Path $PSScriptRoot -ChildPath "Tutoriais"
$directories = @(
(Join-Path $baseDir "TUT-001_NomeDoApp\bruto"),
(Join-Path $baseDir "TUT-001_NomeDoApp\projeto"),
(Join-Path $baseDir "TUT-001_NomeDoApp\final"),
(Join-Path $baseDir "kit_obs_facecam")
)

foreach ($dir in $directories) {
if (-not (Test-Path -Path $dir)) {
New-Item -ItemType Directory -Path $dir -Force | Out-Null
Write-Host " [CRIADO] $dir" -ForegroundColor Green
} else {
Write-Host " [EXISTENTE] $dir" -ForegroundColor Gray
}
}

Write-Host "`n=== [3/3] Gerando Abrir_Android_no_Windows.bat e organizando Kit Facecam ===" -ForegroundColor Cyan

$kitDir = Join-Path $baseDir "kit_obs_facecam"
$batPath = Join-Path $kitDir "Abrir_Android_no_Windows.bat"

$batContent = @"
@echo off
cd /d "%~dp0"
scrcpy.exe --no-audio --max-fps=30 --stay-awake --pause-on-exit=if-error
"@

Set-Content -Path $batPath -Value $batContent -Encoding ASCII
Write-Host " [OK] Script gerado em: $batPath" -ForegroundColor Green

$assets = @(
"mascara_circular_OBS_alpha.png",
"borda_dourada_opcional.png",
"LEIA-ME.txt",
"guia_gravacao_windows_s23.html"
)

foreach ($asset in $assets) {
$sourceFile = Join-Path $PSScriptRoot $asset
if (Test-Path $sourceFile) {
Copy-Item -Path $sourceFile -Destination $kitDir -Force
Write-Host " [COPIADO] $asset -> $kitDir" -ForegroundColor Green
}
}

Write-Host "`nSetup concluido com sucesso!" -ForegroundColor Cyan
`​`​`

Powered by Gemini Exporter (https://www.ai-chat-exporter.com)
