# Convenção de marcação dos exercícios

Este arquivo documenta o "formato" que o HTML de cada lição (`conteudo_html`) precisa seguir
para que os tipos de exercício interativo funcionem. Quem gera o HTML da lição (numa conversa
separada, fora deste repositório — ver regra no LEIA-ME.md) deve seguir esses esqueletos.

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
praticamente invisível até você clicar/arrastar em cima às cegas. Todo bloco abaixo (exercício
ou não) precisa estar dentro de `<section class="block">...</section>` (ou de uma
`<div class="card">`). Os exemplos deste arquivo já vêm com o wrapper — não cole só o
`<div id="dnd-...">` sozinho.

## Bloco explicativo (o tipo "padrão")

Um `section.block` sem nenhum exercício dentro — intro, contexto, explicação, exemplos — é o
bloco "padrão", e ganha automaticamente um rótulo **"Focus point"** no topo. Isso é 100%
visual/CSS, não precisa (e não deve) colar um `.kicker` manual pra isso — o `aluno.html` já
detecta que o bloco não tem exercício nenhum dentro e injeta o rótulo sozinho.

```html
<section class="block">
  <h2>Título do tópico</h2>
  <p class="tagline">Frase de contexto sobre o que foi visto na aula.</p>
  <p>Explicação, com <strong>destaques</strong> onde fizer sentido...</p>
</section>
```

Esse bloco é **só explicação** — não tem caixa de resposta embutida. Se depois da explicação
tem prática (pergunta pro aluno, drag-and-drop, quiz...), isso é um **bloco separado**, logo em
seguida, do tipo que fizer sentido.

## Drag and drop (match up / complete the sentence / unjumble / sorting)

Mesmo motor pros quatro — peça solta (`.dnd-piece`) arrastada até um alvo, dentro de um banco
(`.dnd-bank`). O que muda entre eles é só o arranjo do HTML e o tipo de alvo (único ou coluna).

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

**Sorting** — em vez de um alvo por peça, colunas (`.dnd-column` + `data-column-id`) que aceitam
várias peças cada. Use 2 ou 3 colunas:
```html
<section class="block">
  <h3>Sort the items</h3>
  <div id="dnd-sort-1" class="dnd-exercise formato-sorting">
    <p class="qtext">Drag each item to the correct category.</p>
    <div class="dnd-bank">
      <span class="dnd-piece" data-piece-id="p1">item 1</span>
      <span class="dnd-piece" data-piece-id="p2">item 2</span>
      <span class="dnd-piece" data-piece-id="p3">item 3</span>
    </div>
    <div class="dnd-columns">
      <div class="dnd-column" data-column-id="c1"><span class="dnd-column-label">Categoria A</span></div>
      <div class="dnd-column" data-column-id="c2"><span class="dnd-column-label">Categoria B</span></div>
    </div>
  </div>
</section>
```
`data-column-id` só precisa ser único dentro do próprio exercício, igual `data-target-id`.

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

## Flashcard

Casca visual sobre o `.reveal-btn`/`.reveal-content` já existente. **Cole sempre de 3 a 7
flashcards em sequência** (um `section.block` por card, um atrás do outro, sem nenhum outro
tipo de bloco no meio) — o `aluno.html` detecta cards consecutivos e monta um baralho sozinho,
com botões Prev/Next (o Next vira ↻ pra recomeçar quando chega no último card). Não precisa (e
não deve) tentar montar essa navegação na mão.

```html
<section class="block">
  <h3>Vocab</h3>
  <div class="flashcard">
    <div class="flashcard-front">deadline</div>
    <button class="reveal-btn" data-target="fc-back-1">Flip card</button>
    <div class="reveal-content flashcard-back" id="fc-back-1">The latest time or date by which something must be finished.</div>
  </div>
</section>
<section class="block">
  <div class="flashcard">
    <div class="flashcard-front">overwhelmed</div>
    <button class="reveal-btn" data-target="fc-back-2">Flip card</button>
    <div class="reveal-content flashcard-back" id="fc-back-2">Feeling like you have more than you can handle.</div>
  </div>
</section>
```

O verso (`.flashcard-back`) aceita um texto mais longo — uma explicação, definição ou exemplo,
não só uma palavra curta — o CSS já foi ajustado pra isso (texto alinhado à esquerda, mais
compacto). Escreva o que fizer mais sentido pro tipo de conteúdo da sua aula.

**A pergunta de reflexão depois do baralho é automática** — o `aluno.html` sempre acrescenta,
logo depois do último card, uma pergunta padrão (configurável no objeto `TEXTOS` do
`aluno.html`, chave `flashReflectPergunta`) com uma caixa de texto que salva normalmente. Não
precisa (e não deve) colar essa pergunta manualmente.

## Reading

Passagem curta de leitura que você cola. Diferente do bloco explicativo — é conteúdo pro aluno
ler, não uma explicação sua. O texto precisa estar dentro de
`<div class="reading-passage" id="...">` — esse `id` não precisa ser único fora do próprio
bloco, mas dá um nome descritivo (`leitura-1` etc.).

```html
<section class="block">
  <h3>Texto</h3>
  <div class="reading-passage" id="leitura-1">
    <p>Primeiro parágrafo da passagem...</p>
    <p>Segundo parágrafo da passagem...</p>
  </div>
</section>
```

**Add-on opcional — botão "Open in assisted reading" (Microsoft Immersive Reader).** Se o
servidor tiver a leitura assistida configurada, o `aluno.html` injeta automaticamente, logo acima
de cada `.reading-passage`, um botão que abre aquele texto no Immersive Reader da Azure — com voz,
controle de velocidade, destaque de substantivo/verbo, dicionário de imagem e tradução, tudo que a
ferramenta já traz. O botão só aparece nos blocos de reading; enunciados, explicações e exercícios
nunca ganham esse botão.

Pra quem gera o HTML da lição, **nada muda**: basta usar `.reading-passage` como sempre — o botão é
automático, não se cola na mão. Cada parágrafo (`<p>`) da passagem vira um "chunk" no leitor, e o
`<h3>`/`<h2>` do bloco vira o título dentro do Immersive Reader. É um add-on **opcional**: depende de
4 variáveis de ambiente (`IR_*`) que quem publica configura no servidor se/quando quiser (ver
`LEIA-ME.md`). Se elas não estiverem configuradas, ou se o SDK não carregar (aluno offline, por
exemplo), a leitura continua funcionando normalmente — só sem o botão, nunca um botão que dá erro.

## Link/embed (vídeo ou artigo externo)

**Vídeo**: cole o código de embed que o próprio YouTube (ou Vimeo etc.) fornece — em "Compartilhar
→ Incorporar" — dentro de `<div class="embed-video">`. Não precisa mexer no `<iframe>`, o CSS já
deixa responsivo (proporção 16:9).
```html
<section class="block">
  <h3>Assista</h3>
  <div class="embed-video">
    <iframe src="https://www.youtube.com/embed/VIDEO_ID" title="..." allowfullscreen></iframe>
  </div>
</section>
```

**Artigo/página externa**: só funciona como link clicável, não como embed de verdade — a maioria
dos sites de artigo/notícia bloqueia ser embutido em iframe por segurança (política do próprio
site, não é algo que dá pra contornar). Use um `.link-card`, que abre em nova aba:
```html
<section class="block">
  <h3>Leitura extra</h3>
  <a class="link-card" href="https://exemplo.com/artigo" target="_blank" rel="noopener">
    <span class="link-card-label">Article</span>
    <span class="link-card-title">Título do artigo</span>
    <span class="link-card-url">exemplo.com</span>
  </a>
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
ok pra um ícone pequeno, evite pra fotos (o Turso grátis tem teto de 5GB no total).

## Pergunta de fechamento da sessão (automática)

O `aluno.html` sempre acrescenta, sozinho, uma última pergunta fixa no final de toda sessão,
logo antes do botão "I'm done with this session" (textos configuráveis no objeto `TEXTOS`,
chaves `fechamentoKicker`/`fechamentoPergunta`). Isso não é algo que quem gera o HTML da lição
precisa (ou deve) colar — é automático, igual a pergunta de reflexão do flashcard.

## Estrutural vs cosmético

- **Estrutural** (o motor em `aluno.html` depende disso pra funcionar): `.dnd-exercise` com
  `id="dnd-..."`, `.dnd-bank`, `.dnd-piece` + `data-piece-id`, `.dnd-target` + `data-target-id`,
  `.dnd-column` + `data-column-id` (sorting), `.dnd-label`, `.dnd-row`, `.quiz-exercise` com
  `id="quiz-..."`, `.quiz-option` + `data-valor`, `.flashcard` (pra detecção do baralho),
  `.reveal-btn`/`.reveal-content` com `data-target`/`id` combinando.
- **Cosmético** (só CSS de layout, o JS nunca lê essas classes): `formato-fill`,
  `formato-unjumble`, `formato-matchup`, `formato-sorting`, `.embed-video`,
  `.link-card` + `.link-card-label`/`.link-card-title`/`.link-card-url`. Pode remover sem quebrar
  a funcionalidade (mas quebra o visual pretendido daquele tipo de bloco).
- **Meio-termo**: `.reading-passage` é cosmético pro visual do bloco, mas o JS **lê** essa classe
  pra injetar o botão do Immersive Reader (ver seção Reading). Remover a classe tira o botão, mas
  não quebra nada além disso — o texto continua legível.

## Como as respostas viram texto legível (painel e exportação)

O drag-and-drop salva um JSON de ids (`{"t1":"p2"}` pros formatos de alvo único,
`{"p1":"c1"}` pro sorting) e o quiz salva a letra do `data-valor` (`"b"`). Isso é cru e
ilegível, mas o painel **reconstrói em palavras** cruzando esses ids com o próprio HTML da
lição (`conteudo_html`): descobre que `p2` era "went", que `t1` era tal lacuna, etc. Vale pra
"Ver respostas" e pra exportação, ambos em `public/painel.html` (função `reconstruirSessao`,
que roda no navegador via `DOMParser`).

O que isso significa pra quem gera o HTML da lição: **nada muda**. A reconstrução depende só
das convenções de marcação que este arquivo já exige (`data-piece-id`, `data-target-id`,
`data-column-id`, `.dnd-label`, `.quiz-option`+`data-valor`, `.flashcard`). Se a marcação
estiver certa, a frase legível sai sozinha. Cada formato vira uma forma natural: fill remonta
a frase com as palavras nas lacunas, unjumble junta as palavras na ordem, matchup lista
"rótulo → palavra", sorting lista "coluna: itens", quiz mostra o texto da opção escolhida.

O gabarito (quando o exercício tem `.reveal-btn`/`.reveal-content`) também entra na exportação
como "Esperado", pra IA saber o que era o certo. Se não houver `.reveal-content`, a linha
some sem quebrar nada. Se um id salvo não bater com o HTML atual (conteúdo editado depois que
o aluno respondeu), o valor cru é preservado com um aviso `⚠️` em texto — nunca some.

## Exportar respostas pra análise de IA

No painel, dentro de cada aluno, dá pra selecionar sessões (checkbox individual, "Todas", ou
os atalhos de data — últimos 30 dias / 2 / 3 / N meses, que marcam as sessões do período sem
desmarcar o resto) e baixar um `.md` único, em ordem cronológica, com as respostas já
reconstruídas em palavras. A ideia é levar esse arquivo a uma IA pra analisar padrões de
progresso ao longo do tempo. Cada sessão leva título, data e o rótulo do tema (o `<h2>` do
primeiro bloco só explicativo) como contexto; só entra o que o aluno produziu — bloco
puramente explicativo, reading ou vídeo fica de fora do corpo.
