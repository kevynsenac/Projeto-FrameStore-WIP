const db = require("../config/db");

async function criarJogo(req, res) {
  const { titulo, preco, desconto, platform } = req.body;
  const cover = req.files["cover"] ? req.files["cover"][0].buffer : null;
  const screenshot1 = req.files["screenshot1"] ? req.files["screenshot1"][0].buffer : null;
  const screenshot2 = req.files["screenshot2"] ? req.files["screenshot2"][0].buffer : null;
  const screenshot3 = req.files["screenshot3"] ? req.files["screenshot3"][0].buffer : null;

  try {
    const query = `
      INSERT INTO JOGOS (titulo, preco, desconto, platform, cover, screenshot1, screenshot2, screenshot3) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await db.query(query, [titulo, preco, desconto || null, platform, cover, screenshot1, screenshot2, screenshot3]);
    res.json({ message: "Jogo cadastrado com sucesso no banco de dados!" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao cadastrar novo jogo." });
  }
}

async function atualizarJogo(req, res) {
  const { id } = req.params;
  const { titulo, preco, desconto, platform } = req.body;

  try {
    await db.query("UPDATE JOGOS SET titulo = ?, preco = ?, desconto = ?, platform = ? WHERE id = ?", [titulo, preco, desconto || null, platform, id]);

    if (req.files["cover"]) {
      await db.query("UPDATE JOGOS SET cover = ? WHERE id = ?", [req.files["cover"][0].buffer, id]);
    }
    if (req.files["screenshot1"]) {
      await db.query("UPDATE JOGOS SET screenshot1 = ? WHERE id = ?", [req.files["screenshot1"][0].buffer, id]);
    }
    if (req.files["screenshot2"]) {
      await db.query("UPDATE JOGOS SET screenshot2 = ? WHERE id = ?", [req.files["screenshot2"][0].buffer, id]);
    }
    if (req.files["screenshot3"]) {
      await db.query("UPDATE JOGOS SET screenshot3 = ? WHERE id = ?", [req.files["screenshot3"][0].buffer, id]);
    }

    res.json({ message: "Jogo atualizado com sucesso!" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar o jogo." });
  }
}

async function deletarJogo(req, res) {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM JOGOS WHERE id = ?", [id]);
    res.json({ message: "Jogo removido com sucesso." });
  } catch (error) {
    res.status(500).json({ error: "Erro ao remover o jogo." });
  }
}

async function getUsuarios(req, res) {
  try {
    const [usuarios] = await db.query("SELECT id, nome, email, senha, saldo, pontos, adm, ultima_roleta FROM USUARIOS");
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: "Erro ao listar usuários." });
  }
}

async function atualizarUsuario(req, res) {
  const { id } = req.params;
  const { nome, email, saldo, pontos, adm } = req.body;
  try {
    await db.query("UPDATE USUARIOS SET nome = ?, email = ?, saldo = ?, pontos = ?, adm = ? WHERE id = ?", [nome, email, saldo, pontos, adm, id]);
    res.json({ message: "Dados do usuário modificados com sucesso!" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "Este e-mail já está sendo utilizado por outro usuário." });
    }
    res.status(500).json({ error: "Erro ao modificar dados do usuário." });
  }
}

async function deletarUsuario(req, res) {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM USUARIOS WHERE id = ?", [id]);
    res.json({ message: "Usuário removido com sucesso." });
  } catch (error) {
    res.status(500).json({ error: "Erro ao remover o usuário." });
  }
}

async function criarCupom(req, res) {
  const { nome, tipo, desconto, custo_pontos } = req.body;
  try {
    await db.query("INSERT INTO CUPONS (nome, tipo, desconto, custo_pontos) VALUES (?, ?, ?, ?)", [nome, tipo, desconto, custo_pontos]);
    res.json({ message: "Cupom cadastrado com sucesso!" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar cupom." });
  }
}

async function atualizarCupom(req, res) {
  const { id } = req.params;
  const { nome, tipo, desconto, custo_pontos } = req.body;
  try {
    await db.query("UPDATE CUPONS SET nome = ?, tipo = ?, desconto = ?, custo_pontos = ? WHERE id = ?", [nome, tipo, desconto, custo_pontos, id]);
    res.json({ message: "Cupom atualizado com sucesso!" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao modificar cupom." });
  }
}

async function deletarCupom(req, res) {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM CUPONS WHERE id = ?", [id]);
    res.json({ message: "Cupom removido com sucesso." });
  } catch (error) {
    res.status(500).json({ error: "Erro ao remover cupom." });
  }
}

module.exports = {
  criarJogo, atualizarJogo, deletarJogo,
  getUsuarios, atualizarUsuario, deletarUsuario,
  criarCupom, atualizarCupom, deletarCupom
};