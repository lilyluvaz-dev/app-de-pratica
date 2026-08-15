// SERVIDOR DO APP
// O "porao" invisivel. Guarda alunos, sessoes e respostas, e entrega as paginas.
// Local: usa arquivo app.db. No Vercel: detecta as variaveis de ambiente e usa o Turso.

const http = require('http');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@libsql/client');

const db = process.env.TURSO_URL
  ? createClient({ url: process.env.TURSO_URL, authToken: process.env.TURSO_TOKEN })
  : createClient({ url: 'file:app.db' });

// Sem senha padrão de propósito: cada instalação define a própria, e o app
// se recusa a iniciar sem isso configurado (ver checagem logo abaixo).
const SENHA_PAINEL = process.env.SENHA_PAINEL;
if (!SENHA_PAINEL) {
  console.error(
    '\n[ERRO] A variável de ambiente SENHA_PAINEL não está definida.\n' +
    'O app não inicia sem uma senha configurada para o painel.\n\n' +
    'No Vercel: Settings → Environment Variables → adicione SENHA_PAINEL com a senha que você quiser → Redeploy.\n' +
    'Rodando local: defina antes de iniciar, por exemplo:\n' +
    '  SENHA_PAINEL=suasenha npm start\n'
  );
  process.exit(1);
}

async function prepararBanco() {
  await db.execute(`CREATE TABLE IF NOT EXISTS alunos (id INTEGER PRIMARY KEY AUTOINCREMENT, codigo TEXT UNIQUE NOT NULL, nome TEXT NOT NULL, criado_em TEXT NOT NULL)`);
  await db.execute(`CREATE TABLE IF NOT EXISTS sessoes (id INTEGER PRIMARY KEY AUTOINCREMENT, aluno_id INTEGER NOT NULL, titulo TEXT NOT NULL, conteudo_html TEXT NOT NULL, data_sessao TEXT, criada_em TEXT NOT NULL, FOREIGN KEY (aluno_id) REFERENCES alunos(id))`);
  try { await db.execute('ALTER TABLE sessoes ADD COLUMN data_sessao TEXT'); } catch (e) {}
  try { await db.execute('ALTER TABLE sessoes ADD COLUMN finalizada_em TEXT'); } catch (e) {}
  try { await db.execute('ALTER TABLE sessoes ADD COLUMN vista_em TEXT'); } catch (e) {}
  await db.execute(`CREATE TABLE IF NOT EXISTS respostas (id INTEGER PRIMARY KEY AUTOINCREMENT, sessao_id INTEGER NOT NULL, campo_id TEXT NOT NULL, valor TEXT NOT NULL, atualizada_em TEXT NOT NULL, UNIQUE(sessao_id, campo_id), FOREIGN KEY (sessao_id) REFERENCES sessoes(id))`);
}

function lerCorpo(req) {
  return new Promise((resolve) => {
    let dados = '';
    req.on('data', (c) => (dados += c));
    req.on('end', () => { try { resolve(JSON.parse(dados || '{}')); } catch { resolve({}); } });
  });
}

function responderJSON(res, status, obj) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(obj));
}

function gerarCodigo(nome) {
  const base = nome.toLowerCase().normalize('NFD').replace(/[^a-z]/g, '').slice(0, 8) || 'aluno';
  const sufixo = Math.random().toString(36).slice(2, 8);
  return `${base}-${sufixo}`;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const rota = url.pathname;
  try {
    if (rota === '/api/criar-aluno' && req.method === 'POST') {
      const { senha, nome } = await lerCorpo(req);
      if (senha !== SENHA_PAINEL) return responderJSON(res, 403, { erro: 'senha' });
      if (!nome || !nome.trim()) return responderJSON(res, 400, { erro: 'nome' });
      const codigo = gerarCodigo(nome);
      await db.execute({ sql: 'INSERT INTO alunos (codigo, nome, criado_em) VALUES (?, ?, ?)', args: [codigo, nome.trim(), new Date().toISOString()] });
      return responderJSON(res, 200, { codigo, nome: nome.trim() });
    }
    if (rota === '/api/painel' && req.method === 'POST') {
      const { senha } = await lerCorpo(req);
      if (senha !== SENHA_PAINEL) return responderJSON(res, 403, { erro: 'senha' });
      const alunos = await db.execute('SELECT * FROM alunos ORDER BY criado_em DESC');
      const sessoes = await db.execute('SELECT id, aluno_id, titulo, criada_em, finalizada_em, vista_em, data_sessao FROM sessoes ORDER BY criada_em DESC');
      return responderJSON(res, 200, { alunos: alunos.rows, sessoes: sessoes.rows });
    }
    if (rota === '/api/criar-sessao' && req.method === 'POST') {
      const { senha, aluno_id, titulo, conteudo_html, data_sessao } = await lerCorpo(req);
      if (senha !== SENHA_PAINEL) return responderJSON(res, 403, { erro: 'senha' });
      if (!aluno_id || !titulo || !conteudo_html) return responderJSON(res, 400, { erro: 'faltando' });
      const r = await db.execute({ sql: 'INSERT INTO sessoes (aluno_id, titulo, conteudo_html, data_sessao, criada_em) VALUES (?, ?, ?, ?, ?)', args: [aluno_id, titulo, conteudo_html, data_sessao || null, new Date().toISOString()] });
      return responderJSON(res, 200, { sessao_id: Number(r.lastInsertRowid) });
    }
    if (rota === '/api/respostas' && req.method === 'POST') {
      const { senha, sessao_id } = await lerCorpo(req);
      if (senha !== SENHA_PAINEL) return responderJSON(res, 403, { erro: 'senha' });
      const r = await db.execute({ sql: 'SELECT campo_id, valor, atualizada_em FROM respostas WHERE sessao_id = ?', args: [sessao_id] });
      return responderJSON(res, 200, { respostas: r.rows });
    }
    if (rota === '/api/sessao' && req.method === 'GET') {
      const codigo = url.searchParams.get('codigo');
      const sessao_id = url.searchParams.get('sessao');
      if (!codigo) return responderJSON(res, 400, { erro: 'codigo' });
      const aluno = await db.execute({ sql: 'SELECT * FROM alunos WHERE codigo = ?', args: [codigo] });
      if (aluno.rows.length === 0) return responderJSON(res, 404, { erro: 'aluno' });
      const alunoId = aluno.rows[0].id;
      let sessao;
      if (sessao_id) {
        sessao = await db.execute({ sql: 'SELECT * FROM sessoes WHERE id = ? AND aluno_id = ?', args: [sessao_id, alunoId] });
      } else {
        sessao = await db.execute({ sql: 'SELECT * FROM sessoes WHERE aluno_id = ? ORDER BY criada_em DESC LIMIT 1', args: [alunoId] });
      }
      if (sessao.rows.length === 0) return responderJSON(res, 404, { erro: 'sessao', nome: aluno.rows[0].nome });
      const s = sessao.rows[0];
      const respostas = await db.execute({ sql: 'SELECT campo_id, valor FROM respostas WHERE sessao_id = ?', args: [s.id] });
      const mapaRespostas = {};
      respostas.rows.forEach((row) => { mapaRespostas[row.campo_id] = row.valor; });
      return responderJSON(res, 200, { nome: aluno.rows[0].nome, sessao: { id: s.id, titulo: s.titulo, conteudo_html: s.conteudo_html, data_sessao: s.data_sessao, finalizada_em: s.finalizada_em }, respostas: mapaRespostas });
    }
    if (rota === '/api/salvar' && req.method === 'POST') {
      const { codigo, sessao_id, campo_id, valor } = await lerCorpo(req);
      if (!codigo || !sessao_id || !campo_id) return responderJSON(res, 400, { erro: 'faltando' });
      const check = await db.execute({ sql: `SELECT s.id FROM sessoes s JOIN alunos a ON a.id = s.aluno_id WHERE s.id = ? AND a.codigo = ?`, args: [sessao_id, codigo] });
      if (check.rows.length === 0) return responderJSON(res, 403, { erro: 'nao autorizado' });
      await db.execute({ sql: `INSERT INTO respostas (sessao_id, campo_id, valor, atualizada_em) VALUES (?, ?, ?, ?) ON CONFLICT(sessao_id, campo_id) DO UPDATE SET valor = excluded.valor, atualizada_em = excluded.atualizada_em`, args: [sessao_id, campo_id, valor || '', new Date().toISOString()] });
      return responderJSON(res, 200, { ok: true });
    }
    if (rota === '/api/deletar-sessao' && req.method === 'POST') {
      const { senha, sessao_id } = await lerCorpo(req);
      if (senha !== SENHA_PAINEL) return responderJSON(res, 403, { erro: 'senha' });
      if (!sessao_id) return responderJSON(res, 400, { erro: 'faltando' });
      await db.execute({ sql: 'DELETE FROM respostas WHERE sessao_id = ?', args: [sessao_id] });
      await db.execute({ sql: 'DELETE FROM sessoes WHERE id = ?', args: [sessao_id] });
      return responderJSON(res, 200, { ok: true });
    }
    if (rota === '/api/sessoes-aluno' && req.method === 'GET') {
      const codigo = url.searchParams.get('codigo');
      if (!codigo) return responderJSON(res, 400, { erro: 'codigo' });
      const aluno = await db.execute({ sql: 'SELECT id FROM alunos WHERE codigo = ?', args: [codigo] });
      if (aluno.rows.length === 0) return responderJSON(res, 404, { erro: 'aluno' });
      const sessoes = await db.execute({ sql: 'SELECT id, titulo, criada_em FROM sessoes WHERE aluno_id = ? ORDER BY criada_em DESC', args: [aluno.rows[0].id] });
      return responderJSON(res, 200, { sessoes: sessoes.rows });
    }
    if (rota === '/api/renomear-aluno' && req.method === 'POST') {
      const { senha, aluno_id, nome } = await lerCorpo(req);
      if (senha !== SENHA_PAINEL) return responderJSON(res, 403, { erro: 'senha' });
      if (!aluno_id || !nome || !nome.trim()) return responderJSON(res, 400, { erro: 'faltando' });
      await db.execute({ sql: 'UPDATE alunos SET nome = ? WHERE id = ?', args: [nome.trim(), aluno_id] });
      return responderJSON(res, 200, { ok: true });
    }
    if (rota === '/api/renomear-sessao' && req.method === 'POST') {
      const { senha, sessao_id, titulo, data_sessao } = await lerCorpo(req);
      if (senha !== SENHA_PAINEL) return responderJSON(res, 403, { erro: 'senha' });
      if (!sessao_id || !titulo || !titulo.trim()) return responderJSON(res, 400, { erro: 'faltando' });
      await db.execute({ sql: 'UPDATE sessoes SET titulo = ?, data_sessao = ? WHERE id = ?', args: [titulo.trim(), data_sessao || null, sessao_id] });
      return responderJSON(res, 200, { ok: true });
    }
    // ---- API: editar o conteúdo (HTML) de uma sessão já criada, sem perder respostas (seu painel) ----
    if (rota === '/api/editar-conteudo-sessao' && req.method === 'POST') {
      const { senha, sessao_id, conteudo_html } = await lerCorpo(req);
      if (senha !== SENHA_PAINEL) return responderJSON(res, 403, { erro: 'senha' });
      if (!sessao_id || !conteudo_html || !conteudo_html.trim()) return responderJSON(res, 400, { erro: 'faltando' });
      await db.execute({ sql: 'UPDATE sessoes SET conteudo_html = ? WHERE id = ?', args: [conteudo_html, sessao_id] });
      return responderJSON(res, 200, { ok: true });
    }
    // ---- API: buscar o conteúdo bruto de uma sessão (para preencher o formulário de edição no painel) ----
    if (rota === '/api/conteudo-sessao' && req.method === 'POST') {
      const { senha, sessao_id } = await lerCorpo(req);
      if (senha !== SENHA_PAINEL) return responderJSON(res, 403, { erro: 'senha' });
      if (!sessao_id) return responderJSON(res, 400, { erro: 'faltando' });
      const r = await db.execute({ sql: 'SELECT conteudo_html FROM sessoes WHERE id = ?', args: [sessao_id] });
      if (r.rows.length === 0) return responderJSON(res, 404, { erro: 'nao encontrada' });
      return responderJSON(res, 200, { conteudo_html: r.rows[0].conteudo_html });
    }
    if (rota === '/api/deletar-aluno' && req.method === 'POST') {
      const { senha, aluno_id } = await lerCorpo(req);
      if (senha !== SENHA_PAINEL) return responderJSON(res, 403, { erro: 'senha' });
      if (!aluno_id) return responderJSON(res, 400, { erro: 'faltando' });
      const sessoes = await db.execute({ sql: 'SELECT id FROM sessoes WHERE aluno_id = ?', args: [aluno_id] });
      for (const s of sessoes.rows) { await db.execute({ sql: 'DELETE FROM respostas WHERE sessao_id = ?', args: [s.id] }); }
      await db.execute({ sql: 'DELETE FROM sessoes WHERE aluno_id = ?', args: [aluno_id] });
      await db.execute({ sql: 'DELETE FROM alunos WHERE id = ?', args: [aluno_id] });
      return responderJSON(res, 200, { ok: true });
    }
    if (rota === '/api/marcar-vista' && req.method === 'POST') {
      const { senha, sessao_id } = await lerCorpo(req);
      if (senha !== SENHA_PAINEL) return responderJSON(res, 403, { erro: 'senha' });
      if (!sessao_id) return responderJSON(res, 400, { erro: 'faltando' });
      await db.execute({ sql: 'UPDATE sessoes SET vista_em = ? WHERE id = ?', args: [new Date().toISOString(), sessao_id] });
      return responderJSON(res, 200, { ok: true });
    }
    if (rota === '/api/finalizar' && req.method === 'POST') {
      const { codigo, sessao_id } = await lerCorpo(req);
      if (!codigo || !sessao_id) return responderJSON(res, 400, { erro: 'faltando' });
      const check = await db.execute({ sql: `SELECT s.id FROM sessoes s JOIN alunos a ON a.id = s.aluno_id WHERE s.id = ? AND a.codigo = ?`, args: [sessao_id, codigo] });
      if (check.rows.length === 0) return responderJSON(res, 403, { erro: 'nao autorizado' });
      await db.execute({ sql: 'UPDATE sessoes SET finalizada_em = ? WHERE id = ?', args: [new Date().toISOString(), sessao_id] });
      return responderJSON(res, 200, { ok: true });
    }
    if (rota === '/' || rota === '/painel') { return servirArquivo(res, 'painel.html'); }
    if (rota === '/aluno') { return servirArquivo(res, 'aluno.html'); }
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Pagina nao encontrada');
  } catch (e) {
    console.error('Erro:', e);
    responderJSON(res, 500, { erro: 'servidor', detalhe: String(e) });
  }
});

function servirArquivo(res, nome) {
  const caminho = path.join(__dirname, 'public', nome);
  fs.readFile(caminho, (err, dados) => {
    if (err) { res.writeHead(404); res.end('Arquivo nao encontrado: ' + nome); return; }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(dados);
  });
}

let bancoPronto = null;
function garantirBanco() { if (!bancoPronto) bancoPronto = prepararBanco(); return bancoPronto; }

if (process.env.VERCEL) {
  module.exports = async (req, res) => { await garantirBanco(); server.emit('request', req, res); };
} else {
  const PORTA = process.env.PORT || 3000;
  garantirBanco().then(() => {
    server.listen(PORTA, () => {
      console.log(`Servidor rodando em http://localhost:${PORTA}`);
      console.log(`  Seu painel:      http://localhost:${PORTA}/painel`);
      console.log(`  Página do aluno: http://localhost:${PORTA}/aluno?codigo=CODIGO`);
    });
  });
}
