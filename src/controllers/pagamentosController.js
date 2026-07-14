const db = require("../config/db");

async function getCartoes(req, res) {
  const { id_usuario } = req.params;
  try {
    const [cartoes] = await db.query(
      "SELECT * FROM CARTOES WHERE id_usuario = ?",
      [id_usuario],
    );
    res.json(cartoes);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar cartões." });
  }
}

async function addCartao(req, res) {
  const { id_usuario, numero, nome_titular, vencimento, cvv, bandeira } =
    req.body;
  try {
    const ultimosDigitos = numero.slice(-4);
    const numero_mascarado = `**** **** **** ${ultimosDigitos}`;
    const saldoFicticio = Math.floor(Math.random() * (10000 - 1000 + 1)) + 1000;

    await db.query(
      "INSERT INTO CARTOES (id_usuario, numero_mascarado, nome_titular, vencimento, bandeira, saldo_cartao) VALUES (?, ?, ?, ?, ?, ?)",
      [
        id_usuario,
        numero_mascarado,
        nome_titular,
        vencimento,
        bandeira,
        saldoFicticio,
      ],
    );
    res.status(201).json({ message: "Cartão cadastrado com sucesso!" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao cadastrar cartão." });
  }
}
async function adicionarSaldo(req, res) {
  const { id_usuario, valor, metodo, id_cartao } = req.body;
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    if (metodo === "cartao") {
      const [cartao] = await connection.query(
        "SELECT saldo_cartao FROM CARTOES WHERE id = ? AND id_usuario = ? FOR UPDATE",
        [id_cartao, id_usuario],
      );
      if (cartao.length === 0) throw new Error("Cartão não encontrado.");
      if (cartao[0].saldo_cartao < valor)
        throw new Error("O cartão selecionado não possui limite suficiente.");

      await connection.query(
        "UPDATE CARTOES SET saldo_cartao = saldo_cartao - ? WHERE id = ?",
        [valor, id_cartao],
      );
    }

    await connection.query(
      "UPDATE USUARIOS SET saldo = saldo + ? WHERE id = ?",
      [valor, id_usuario],
    );
    const [usuario] = await connection.query(
      "SELECT saldo FROM USUARIOS WHERE id = ?",
      [id_usuario],
    );

    await connection.commit();
    res.json({
      message: "Saldo adicionado com sucesso!",
      novoSaldo: usuario[0].saldo,
    });
  } catch (error) {
    await connection.rollback();
    res.status(400).json({ error: error.message });
  } finally {
    connection.release();
  }
}

module.exports = { getCartoes, addCartao, adicionarSaldo };
