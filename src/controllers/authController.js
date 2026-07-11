const db = require("../config/db");
const { formatarImagem } = require("../utils/imageFormat");

async function register(req, res) {
  const { email, senha, nome } = req.body;
  try {
    const query = "INSERT INTO USUARIOS (nome, email, senha, saldo, pontos, adm) VALUES (?, ?, ?, 0, 0, 0)";
    const [result] = await db.query(query, [nome, email, senha]);
    res.status(201).json({ message: "Conta criada com sucesso!", id: result.insertId });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "Este e-mail já está em uso." });
    }
    res.status(500).json({ error: "Erro interno ao criar conta." });
  }
}

async function login(req, res) {
  const { email, senha } = req.body;
  try {
    const [rows] = await db.query(
      "SELECT id, nome, email, saldo, pontos, adm, ultima_roleta FROM USUARIOS WHERE email = ? AND senha = ?",
      [email, senha]
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: "Credenciais inválidas." });
    }
    res.json({ message: "Login efetuado com sucesso!", user: rows[0] });
  } catch (error) {
    res.status(500).json({ error: "Erro ao processar o login." });
  }
}

async function getUsuario(req, res) {
  const { id } = req.params;
  try {
    const [rows] = await db.query("SELECT id, nome, email, saldo, pontos, adm, ultima_roleta FROM USUARIOS WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar dados do usuário." });
  }
}

async function getBiblioteca(req, res) {
  const { id } = req.params;
  try {
    const query = `
      SELECT j.id, j.titulo, j.cover, b.data_compra 
      FROM BIBLIOTECA b
      JOIN JOGOS j ON b.id_jogo = j.id
      WHERE b.id_usuario = ?
    `;
    const [jogos] = await db.query(query, [id]);
    const jogosFormatados = jogos.map((j) => ({
      ...j,
      cover: formatarImagem(j.cover),
    }));
    res.json(jogosFormatados);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar biblioteca do usuário." });
  }
}

module.exports = { register, login, getUsuario, getBiblioteca };