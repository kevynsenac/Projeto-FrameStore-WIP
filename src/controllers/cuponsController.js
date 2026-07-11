const db = require("../config/db");

async function getCupons(req, res) {
  try {
    const [cupons] = await db.query("SELECT * FROM CUPONS");
    res.json(cupons);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar cupons." });
  }
}

async function getCuponsUsuario(req, res) {
  const { id } = req.params;
  try {
    const query = `
      SELECT c.id, c.nome, c.tipo, c.desconto, uc.usado 
      FROM USUARIO_CUPONS uc
      JOIN CUPONS c ON uc.id_cupom = c.id
      WHERE uc.id_usuario = ?
    `;
    const [cupons] = await db.query(query, [id]);
    res.json(cupons);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar cupons do usuário." });
  }
}

async function resgatarCupom(req, res) {
  const { id_usuario, id_cupom } = req.body;
  try {
    const [usuario] = await db.query("SELECT pontos FROM USUARIOS WHERE id = ?", [id_usuario]);
    const [cupom] = await db.query("SELECT custo_pontos FROM CUPONS WHERE id = ?", [id_cupom]);

    if (usuario.length === 0 || cupom.length === 0) {
      return res.status(404).json({ error: "Usuário ou Cupom não encontrado." });
    }

    const pontosUsuario = usuario[0].pontos;
    const custoCupom = cupom[0].custo_pontos;

    if (pontosUsuario < custoCupom) {
      return res.status(400).json({ error: "Pontos insuficientes para resgatar este cupom." });
    }

    await db.query("UPDATE USUARIOS SET pontos = pontos - ? WHERE id = ?", [custoCupom, id_usuario]);
    await db.query("INSERT INTO USUARIO_CUPONS (id_usuario, id_cupom) VALUES (?, ?)", [id_usuario, id_cupom]);

    res.json({ message: "Cupom resgatado com sucesso!" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "Você já possui este cupom em sua carteira." });
    }
    res.status(500).json({ error: "Erro ao processar o resgate." });
  }
}

module.exports = { getCupons, getCuponsUsuario, resgatarCupom };