const db = require("../config/db");
const { formatarImagem } = require("../utils/imageFormat");

async function addCarrinho(req, res) {
  const { id_usuario, id_jogo } = req.body;

  try {
    await db.query("INSERT INTO CARRINHO (id_usuario, id_jogo) VALUES (?, ?)", [id_usuario, id_jogo]);
    res.json({ message: "Jogo adicionado ao carrinho!" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "Este jogo já está no seu carrinho." });
    }
    
    res.status(500).json({ error: "Erro ao adicionar jogo ao carrinho." });
  }
}

async function getCarrinho(req, res) {
  const { id_usuario } = req.params;

  try {
    const query = `
      SELECT j.id, j.titulo, j.preco, j.desconto, j.cover, j.platform 
      FROM CARRINHO c
      JOIN JOGOS j ON c.id_jogo = j.id
      WHERE c.id_usuario = ?
    `;
    
    const [itens] = await db.query(query, [id_usuario]);
    
    const itensFormatados = itens.map((i) => ({
      ...i,
      cover: formatarImagem(i.cover),
    }));
    
    res.json(itensFormatados);
  } catch (error) {
    res.status(500).json({ error: "Erro ao listar itens do carrinho." });
  }
}

async function removeCarrinho(req, res) {
  const { id_usuario, id_jogo } = req.body;

  try {
    await db.query("DELETE FROM CARRINHO WHERE id_usuario = ? AND id_jogo = ?", [id_usuario, id_jogo]);
    res.json({ message: "Jogo removido do carrinho." });
  } catch (error) {
    res.status(500).json({ error: "Erro ao remover jogo do carrinho." });
  }
}

async function checkout(req, res) {
  const { id_usuario, id_cupom } = req.body;
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [usuarios] = await connection.query("SELECT saldo, pontos FROM USUARIOS WHERE id = ?", [id_usuario]);
    
    if (usuarios.length === 0) {
      throw new Error("Usuário não encontrado.");
    }
    
    let { saldo, pontos } = usuarios[0];

    const [itensCarrinho] = await connection.query(
      "SELECT j.id, j.preco, j.desconto, j.platform FROM CARRINHO c JOIN JOGOS j ON c.id_jogo = j.id WHERE c.id_usuario = ?",
      [id_usuario]
    );

    if (itensCarrinho.length === 0) {
      throw new Error("O carrinho está vazio.");
    }

    let totalCompra = 0;
    
    itensCarrinho.forEach((jogo) => {
      let precoJogo = parseFloat(jogo.preco);
      
      if (jogo.desconto && parseFloat(jogo.desconto) > 0) {
        precoJogo -= precoJogo * (parseFloat(jogo.desconto) / 100);
      }
      
      totalCompra += precoJogo;
    });

    if (id_cupom) {
      const [cupomValido] = await connection.query(
        "SELECT uc.id_cupom, c.desconto FROM USUARIO_CUPONS uc JOIN CUPONS c ON uc.id_cupom = c.id WHERE uc.id_usuario = ? AND uc.id_cupom = ? AND uc.usado = FALSE",
        [id_usuario, id_cupom]
      );
      
      if (cupomValido.length === 0) {
        throw new Error("Cupom inválido ou já utilizado.");
      }

      const descontoCupom = parseFloat(cupomValido[0].desconto);
      totalCompra = Math.max(0, totalCompra - descontoCupom);
    }

    if (saldo < totalCompra) {
      throw new Error("Saldo virtual insuficiente.");
    }

    const novosPontosGanhos = Math.floor(totalCompra);
    const novoSaldo = saldo - totalCompra;
    const novosPontosTotais = pontos + novosPontosGanhos;

    await connection.query("UPDATE USUARIOS SET saldo = ?, pontos = ? WHERE id = ?", [novoSaldo, novosPontosTotais, id_usuario]);

    for (const jogo of itensCarrinho) {
      const codigoResgate = gerarCodigoPlataforma(jogo.platform);
      await connection.query("INSERT INTO BIBLIOTECA (id_usuario, id_jogo, codigo_resgate) VALUES (?, ?, ?)", [id_usuario, jogo.id, codigoResgate]);
    }

    if (id_cupom) {
      await connection.query("UPDATE USUARIO_CUPONS SET usado = TRUE WHERE id_usuario = ? AND id_cupom = ?", [id_usuario, id_cupom]);
    }

    await connection.query("DELETE FROM CARRINHO WHERE id_usuario = ?", [id_usuario]);
    
    await connection.commit();
    
    res.json({ 
      message: "Compra finalizada com sucesso!", 
      saldoRestante: novoSaldo, 
      pontosAtuais: novosPontosTotais 
    });
  } catch (error) {
    await connection.rollback();
    res.status(400).json({ error: error.message });
  } finally {
    connection.release();
  }
}

function gerarCodigoPlataforma(plataforma) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const rnd = (len) => Array.from({length: len}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  let plat = (plataforma || '').toLowerCase();
  
  if (plat.includes('steam') || plat.includes('pc')) {
    return `${rnd(5)}-${rnd(5)}-${rnd(5)}`;
  }
  
  if (plat.includes('playstation')) {
    return `${rnd(4)}-${rnd(4)}-${rnd(4)}`;
  }
  
  if (plat.includes('xbox')) {
    return `${rnd(5)}-${rnd(5)}-${rnd(5)}-${rnd(5)}-${rnd(5)}`;
  }
  
  if (plat.includes('nintendo')) {
    return `${rnd(4)}-${rnd(4)}-${rnd(4)}-${rnd(4)}`;
  }
  
  return `${rnd(4)}-${rnd(4)}-${rnd(4)}`;
}

module.exports = { 
  getCarrinho, 
  addCarrinho, 
  removeCarrinho, 
  checkout 
};