const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3000;

// Configurar view engine para EJS (para páginas dinâmicas)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware para tratar dados POST
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

// Criar banco SQLite em arquivo
const db = new sqlite3.Database('./usuarios.db');

// Criar tabela usuário
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS usuario (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    senha TEXT NOT NULL
  )`);
});

// Rotas

// Listar todos usuários
app.get('/', (req, res) => {
  db.all('SELECT * FROM usuario', [], (err, rows) => {
    if (err) {
      return res.status(500).send("Erro ao listar usuários");
    }
    res.render('index', { usuarios: rows });
  });
});

// Página para criar novo usuário
app.get('/usuario/novo', (req, res) => {
  res.render('form', { usuario: {}, acao: '/usuario/novo', botao: 'Criar' });
});

// Inserir usuário
app.post('/usuario/novo', (req, res) => {
  const { nome, email, senha } = req.body;
  db.run('INSERT INTO usuario (nome, email, senha) VALUES (?, ?, ?)', [nome, email, senha], function(err) {
    if (err) {
      return res.status(500).send("Erro ao cadastrar usuário: " + err.message);
    }
    res.redirect('/');
  });
});

// Página para editar usuário
app.get('/usuario/editar/:id', (req, res) => {
  const id = req.params.id;
  db.get('SELECT * FROM usuario WHERE id = ?', [id], (err, row) => {
    if (err || !row) {
      return res.status(404).send("Usuário não encontrado");
    }
    res.render('form', { usuario: row, acao: '/usuario/editar/' + id, botao: 'Atualizar' });
  });
});

// Atualizar usuário
app.post('/usuario/editar/:id', (req, res) => {
  const id = req.params.id;
  const { nome, email, senha } = req.body;
  db.run('UPDATE usuario SET nome = ?, email = ?, senha = ? WHERE id = ?', [nome, email, senha, id], function(err) {
    if (err) {
      return res.status(500).send("Erro ao atualizar usuário: " + err.message);
    }
    res.redirect('/');
  });
});

// Excluir usuário
app.post('/usuario/excluir/:id', (req, res) => {
  const id = req.params.id;
  db.run('DELETE FROM usuario WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).send("Erro ao excluir usuário");
    }
    res.redirect('/');
  });
});

// Visualizar detalhes do usuário
app.get('/usuario/:id', (req, res) => {
  const id = req.params.id;
  db.get('SELECT * FROM usuario WHERE id = ?', [id], (err, row) => {
    if (err || !row) {
      return res.status(404).send("Usuário não encontrado");
    }
    res.render('detalhes', { usuario: row });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});