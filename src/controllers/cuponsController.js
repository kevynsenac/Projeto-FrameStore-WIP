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
      SELECT c.id, c.nome, c.data_expiracao, c.desconto, uc.usado 
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
    const [cupomExistente] = await db.query(
      "SELECT * FROM USUARIO_CUPONS WHERE id_usuario = ? AND id_cupom = ?", 
      [id_usuario, id_cupom]
    );
    
    if (cupomExistente.length > 0) {
      return res.status(400).json({ error: "Você já possui este cupom em sua carteira." });
    }

    const [usuario] = await db.query("SELECT pontos FROM USUARIOS WHERE id = ?", [id_usuario]);
    const [cupom] = await db.query("SELECT custo_pontos, data_expiracao FROM CUPONS WHERE id = ?", [id_cupom]);

    if (usuario.length === 0 || cupom.length === 0) {
      return res.status(404).json({ error: "Usuário ou Cupom não encontrado." });
    }

    if (new Date(cupom[0].data_expiracao) < new Date()) {
      return res.status(400).json({ error: "Este cupom já expirou e não pode mais ser resgatado." });
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
    res.status(500).json({ error: "Erro interno ao processar o resgate." });
  }
}

async function girarRoleta(req, res) {
  const { id_usuario } = req.body;
  
  try {
    const [usuario] = await db.query("SELECT ultima_roleta FROM USUARIOS WHERE id = ?", [id_usuario]);
    
    if (usuario.length === 0) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    const dataHoje = new Date().toISOString().split('T')[0];
    
    const ultimaRoleta = usuario[0].ultima_roleta 
      ? new Date(usuario[0].ultima_roleta).toISOString().split('T')[0] 
      : null;

    if (ultimaRoleta === dataHoje) {
      return res.status(400).json({ error: "Você já girou a roleta hoje. Volte amanhã!" });
    }

    const sorteio = Math.random();
    let pontosGanhos = 0;

    if (sorteio < 0.10) {
      pontosGanhos = 250;
    } else if (sorteio < 0.30) {
      pontosGanhos = 100;
    } else if (sorteio < 0.60) {
      pontosGanhos = 50;
    } else {
      pontosGanhos = 0;
    }

    if (pontosGanhos > 0) {
      await db.query("UPDATE USUARIOS SET pontos = pontos + ?, ultima_roleta = ? WHERE id = ?", [pontosGanhos, dataHoje, id_usuario]);
    } else {
      await db.query("UPDATE USUARIOS SET ultima_roleta = ? WHERE id = ?", [dataHoje, id_usuario]);
    }

    res.json({ 
      pontosGanhos, 
      message: pontosGanhos > 0 ? `Você ganhou ${pontosGanhos} pontos!` : "Que pena, você não ganhou pontos hoje." 
    });
  } catch (error) {
    res.status(500).json({ error: "Erro ao processar a roleta." });
  }
}

module.exports = { 
  getCupons, 
  getCuponsUsuario, 
  resgatarCupom, 
  girarRoleta 
};