# Convenção de marcação dos exercícios

Este arquivo documenta o "formato" que o HTML de cada lição (`conteudo_html`) precisa seguir
para que os tipos de exercício interativo funcionem. Quem gera o HTML da lição (numa conversa
separada, fora deste repositório — ver regra no CLAUDE.md) deve seguir esses esqueletos.

O motor que interpreta essa marcação vive só em `public/aluno.html`. Nenhum desses exercícios
corrige ou dá feedback automático de certo/errado — o aluno monta a resposta dele (liga, ordena,
escolhe), isso é salvo, e ele confere sozinho depois com um `.reveal-btn`/`.reveal-content`
(gabarito), do jeito que a caixa de texto já faz hoje. **Nunca declarar a resposta certa no DOM
do exercício** — o gabarito vive só dentro do `.reveal-content`.

## Regra de ids

- O `id` do container do exercício (`dnd-...`, `quiz-...`, igual `ta-...` das caixas de texto)
  precisa ser único na página inteira — é ele que vira o `campo_id` salvo.
- `data-piece-id` e `data-target-id` só precisam ser únicos **dentro do próprio exercício**.
  Pode repetir `p1`/`t1` em exercícios `dnd-` diferentes na mesma lição sem problema.

## Regra obrigatória: sempre dentro de um `.card` ou `section.block`

O fundo da página é escuro e o texto solto (sem wrapper) herda essa cor escura — fica
praticamente invisível até você clicar/arrastar em cima às cegas. Todo bloco de exercício abaixo
precisa estar dentro de `<section class="block">...</section>` (ou de uma `<div class="card">`).
Os exemplos deste arquivo já vêm com o wrapper — não cole só o `<div id="dnd-...">` sozinho.

## Drag and drop (match up / complete the sentence / unjumble)

Mesmo motor pros três — peça solta (`.dnd-piece`) arrastada até um alvo (`.dnd-target`), dentro
de um banco (`.dnd-bank`). O que muda entre os três é só o arranjo do HTML.

**Complete the sentence** — alvo dentro de uma frase corrida:
```html
<section class="block">
  <h3>Complete the sentence</h3>
  <div id="dnd-past-1" class="dnd-exercise formato-fill">
    <p class="qtext">Complete with the words from the box.</p>
    <div class="dnd-bank">
      <span class="dnd-piece" data-piece-id="p1">went</span>
      <span class="dnd-piece" data-piece-id="p2">saw</span>
    </div>
    <p>Yesterday she <span class="dnd-target" data-target-id="t1"></span> to the market
       and <span class="dnd-target" data-target-id="t2"></span> her friend there.</p>
  </div>
</section>
```

**Unjumble** — alvos numa fileira (`.dnd-row`), sem prosa ao redor:
```html
<section class="block">
  <h3>Unjumble</h3>
  <div id="dnd-unjumble-1" class="dnd-exercise formato-unjumble">
    <p class="qtext">Put the words in order.</p>
    <div class="dnd-bank">
      <span class="dnd-piece" data-piece-id="p1">school</span>
      <span class="dnd-piece" data-piece-id="p2">to</span>
      <span class="dnd-piece" data-piece-id="p3">go</span>
      <span class="dnd-piece" data-piece-id="p4">I</span>
    </div>
    <div class="dnd-row">
      <span class="dnd-target" data-target-id="t1"></span>
      <span class="dnd-target" data-target-id="t2"></span>
      <span class="dnd-target" data-target-id="t3"></span>
      <span class="dnd-target" data-target-id="t4"></span>
    </div>
  </div>
</section>
```

**Match up** — cada linha combina um rótulo fixo (`.dnd-label`, coluna A, não interativo) com
um alvo (coluna B):
```html
<section class="block">
  <h3>Match up</h3>
  <div id="dnd-matchup-1" class="dnd-exercise formato-matchup">
    <p class="qtext">Match the verb to its meaning.</p>
    <div class="dnd-bank">
      <span class="dnd-piece" data-piece-id="p1">to leave</span>
      <span class="dnd-piece" data-piece-id="p2">to arrive</span>
    </div>
    <div class="dnd-row"><span class="dnd-label">sair</span><span class="dnd-target" data-target-id="t1"></span></div>
    <div class="dnd-row"><span class="dnd-label">chegar</span><span class="dnd-target" data-target-id="t2"></span></div>
  </div>
</section>
```

## Quiz (clique/seleção, sem drag)

```html
<section class="block">
  <h3>Quiz</h3>
  <div id="quiz-past-1" class="quiz-exercise">
    <p class="qtext">Which sentence is correct?</p>
    <div class="quiz-option" data-valor="a">She go to school every day.</div>
    <div class="quiz-option" data-valor="b">She goes to school every day.</div>
  </div>
</section>
```
`data-valor` é o que fica salvo — use uma letra/código curto e fixo, não o texto da opção
(se o texto for reescrito depois, a resposta salva do aluno não deve se perder).

## Flashcard de vocab

Não é um tipo novo de verdade — é o `.reveal-btn`/`.reveal-content` já existente, só com uma
casca visual de cartão. Não salva estado (mesmo comportamento efêmero de qualquer gabarito:
reabre fechado se o aluno recarregar a página).
```html
<section class="block">
  <h3>Flashcard</h3>
  <div class="flashcard">
    <div class="flashcard-front">deadline</div>
    <button class="reveal-btn" data-target="fc-back-1">Flip card</button>
    <div class="reveal-content flashcard-back" id="fc-back-1">prazo final</div>
  </div>
</section>
```

## Imagens

Não é um "tipo de exercício", é conteúdo comum — uma tag `<img>` normal já funciona, sem
precisar de nenhuma classe especial. `aluno.html` blinda automaticamente contra imagem grande
estourando a largura do card (`max-width:100%`), então não precisa (nem deve) vir com `style`
inline.
```html
<img src="https://exemplo.com/imagem.png" alt="descrição curta da imagem">
```
A imagem precisa estar hospedada num link público estável. Serviços simples tipo
[postimages.org](https://postimages.org) ou [imgbb.com](https://imgbb.com) resolvem — sobe o
arquivo, copia o link direto da imagem (não o link da página) e usa esse link no `src`.
**Evite link de imagem do Notion**: costuma ser um link assinado que expira depois de um tempo,
e a imagem para de aparecer pro aluno sem aviso.

Alternativa sem depender de link externo: embutir a imagem como base64 direto no `src`
(`<img src="data:image/png;base64,...">`). Funciona, mas engorda a linha da sessão no banco —
ok pra um ícone pequeno, evite pra fotos (o Turso grátis tem teto de 5GB no total, ver Notion).

## Estrutural vs cosmético

- **Estrutural** (o motor em `aluno.html` depende disso pra funcionar): `.dnd-exercise` com
  `id="dnd-..."`, `.dnd-bank`, `.dnd-piece` + `data-piece-id`, `.dnd-target` + `data-target-id`,
  `.dnd-label`, `.dnd-row`, `.quiz-exercise` com `id="quiz-..."`, `.quiz-option` + `data-valor`.
- **Cosmético** (só CSS de layout, o JS nunca lê essas classes): `formato-fill`,
  `formato-unjumble`, `formato-matchup`. Pode remover sem quebrar a funcionalidade.

## Limitação conhecida

No painel, "Ver respostas" mostra o valor salvo cru — pra drag-and-drop isso é um JSON
tipo `{"t1":"p2","t2":"p1"}`, não uma frase legível. A conferência do trabalho do aluno continua
sendo feita na própria página dele, comparando com o `.reveal-content` (gabarito), como já é o
fluxo hoje pros outros exercícios.
