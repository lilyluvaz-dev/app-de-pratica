# App de Prática de Idiomas

App que guarda o material de prática que você manda pros seus alunos, com um painel de acompanhamento pra você ver o que eles responderam.

## O que é
- Página do aluno: abre por link secreto (sem senha), salva as respostas sozinho. Pode fechar e voltar.
- Seu painel: protegido por senha, cria alunos/sessões, vê respostas.

## Regra importante sobre o que este repositório NÃO tem
O conteúdo de cada aula (o HTML de cada lição) não mora aqui — mora no banco de dados, colado manualmente por você via painel. Este repositório é só o código do app em si (`server.js`, `painel.html`, `aluno.html`). Nunca tente "criar uma lição" aqui dentro do código — o conteúdo é sempre colado depois, através do painel, numa lição já criada.

Isso é de propósito: **código e dados são separados**. Atualizar o código (subir uma versão nova) nunca apaga nada que os alunos já responderam, porque as respostas vivem no banco (Turso), não no repositório.

## Tipos de bloco e convenção de marcação
`aluno.html` reconhece tipos de bloco (bloco explicativo, texto livre, drag-and-drop em 4 formatos — match up, complete the sentence, unjumble, sorting —, quiz, flashcard, reading, link/embed) por convenção de `id`/classe no HTML colado. Ver [CONTEUDO.md](CONTEUDO.md) para os esqueletos HTML prontos de cada tipo — é o que quem gera o HTML da lição precisa seguir.

Regra vale pra todos os exercícios: **nenhum corrige automaticamente**. O aluno só monta a resposta dele (escreve, liga, ordena, escolhe) e isso é salvo. A conferência é sempre depois, por conta do próprio aluno, através de um botão de revelar gabarito (`.reveal-content`).

Cada tipo de bloco ganha uma identidade visual própria (cor/estilo de borda, cantos arredondados) detectada automaticamente a partir do conteúdo colado — não precisa (e não deve) marcar o tipo manualmente. Três comportamentos são automáticos, injetados pelo `aluno.html`, e **não devem ser colados no HTML da lição**:
- Bloco sem exercício nenhum dentro (só texto) ganha o rótulo "Focus point" sozinho.
- Flashcards colados em sequência (3 a 7) viram um baralho navegável (Prev/Next) com uma pergunta de reflexão fixa logo abaixo, que salva.
- Toda sessão ganha uma pergunta de fechamento fixa no final, antes do botão de concluir.

## Já resolvido, não precisa reabrir a discussão
- Vercel + Turso pra hospedagem e banco: os planos grátis de ambos não fazem o app dormir e não expiram.
- O CSS já é tolerante a algumas variações comuns de formatação do conteúdo (ex: faltar a div `.card` dentro de `section.block`). Se algum texto sumir (ficar praticamente invisível), é provavelmente um problema de contraste — confira essa blindagem no CSS antes de sair mudando a estrutura do HTML colado.

## Como personalizar
- **Cor e fonte**: no topo do `<style>` de `aluno.html` e de `painel.html` tem um bloco de variáveis CSS comentado — troque os valores ali (mantenha os dois arquivos com a mesma paleta pra combinar).
- **Nome do seu app / seu nome**: `painel.html` tem uma constante `NOME_CABECALHO` no topo do `<script>`.
- **Textos que o aluno vê** (título da aba, botões, mensagens de erro/status): `aluno.html` tem um objeto `TEXTOS` no topo do `<script>`, com cada texto comentado — é o lugar certo pra trocar de idioma ou de tom.

## Antes de publicar
1. Crie um banco grátis no [Turso](https://turso.tech) e anote a URL e o token de acesso.
2. Escolha uma senha pro seu painel. O app se recusa a iniciar sem essa senha configurada — não existe senha padrão embutida no código, de propósito.
3. Suba este repositório num projeto na [Vercel](https://vercel.com) e configure três variáveis de ambiente lá (Settings → Environment Variables): `TURSO_URL`, `TURSO_TOKEN`, `SENHA_PAINEL`.
4. Publique (Deploy). A Vercel detecta e republica sozinha a cada vez que você subir uma alteração pro repositório.

### Add-on opcional: leitura assistida (Microsoft Immersive Reader)
Nos blocos de reading (`.reading-passage`), o app pode mostrar um botão **"Open in assisted reading"** que abre aquele texto no Immersive Reader da Azure (voz, velocidade, destaque de substantivo/verbo, dicionário de imagem, tradução). É **totalmente opcional** e vem desligado: se você não configurar nada, o botão simplesmente não aparece e o resto do app funciona igual.

Pra ligar, crie um recurso Immersive Reader na Azure e configure mais quatro variáveis de ambiente na Vercel (Settings → Environment Variables): `IR_TENANT_ID`, `IR_CLIENT_ID`, `IR_CLIENT_SECRET`, `IR_SUBDOMAIN`. Com as quatro presentes, o botão passa a aparecer sozinho nos blocos de reading; sem elas, nada muda. O `IR_CLIENT_SECRET` tem validade (definida na criação) e, quando vencer, é só gerar um novo no portal da Azure e atualizar essa variável — não muda nada no código.

## Como pedir ajuda ao Claude pra mexer nisso

Você não precisa instalar nada pra começar. Dá pra simplesmente **colar os arquivos deste repositório** (`server.js`, `public/aluno.html`, `public/painel.html`, `CONTEUDO.md`, este `LEIA-ME.md`) numa conversa comum com o Claude e pedir os ajustes que quiser — trocar cor, texto, criar uma lição, o que precisar.

Se você for mexer bastante e quiser uma forma mais fluida de trabalhar direto no código (sem precisar colar arquivo por arquivo toda vez), existe o **Claude Code Desktop**, que se conecta numa pasta do seu computador e lê o contexto sozinho a cada conversa nova. Não é obrigatório — é só uma opção pra quando fizer sentido.
