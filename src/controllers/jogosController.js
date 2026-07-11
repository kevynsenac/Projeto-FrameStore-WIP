const db = require("../config/db");
const { formatarImagem } = require("../utils/imageFormat");

async function getJogos(req, res) {
  try {
    const [jogos] = await db.query("SELECT id, titulo, preco, desconto, platform, cover FROM JOGOS");
    const jogosFormatados = jogos.map((jogo) => ({
      ...jogo,
      cover: formatarImagem(jogo.cover),
    }));
    res.json(jogosFormatados);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar catálogo de jogos." });
  }
}

async function getJogoById(req, res) {
  try {
    const { id } = req.params;
    const [rows] = await db.query("SELECT * FROM JOGOS WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Jogo não encontrado." });
    }
    const jogo = rows[0];
    const jogoFormatado = {
      ...jogo,
      cover: formatarImagem(jogo.cover),
      screenshot1: formatarImagem(jogo.screenshot1),
      screenshot2: formatarImagem(jogo.screenshot2),
      screenshot3: formatarImagem(jogo.screenshot3),
    };
    res.json(jogoFormatado);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar detalhes do jogo." });
  }
}

module.exports = { getJogos, getJogoById };