const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
require("dotenv").config();

// Importação do pool do banco de dados
const db = require("./db");

const app = express();
const port = process.env.PORT || 3000;

// ==========================================
// 1. CONFIGURAÇÕES E MIDDLEWARES GLOBAIS
// ==========================================
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

// Configuração do Multer para uploads de imagens em memória (LONGBLOB)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Função utilitária para converter Buffer em Base64
function formatarImagem(buffer) {
  if (!buffer) return null;
  return `data:image/jpeg;base64,${buffer.toString("base64")}`;
}

// ==========================================
// 2. MIDDLEWARES DE SEGURANÇA
// ==========================================
async function verificarAdmin(req, res, next) {
  const userId = req.headers["x-user-id"] || req.body.id_usuario_admin;

  if (!userId) {
    return res
      .status(401)
      .json({ error: "Acesso negado. Usuário não identificado." });
  }

  try {
    const [rows] = await db.query("SELECT adm FROM USUARIOS WHERE id = ?", [
      userId,
    ]);
    if (rows.length === 0 || !rows[0].adm) {
      return res
        .status(403)
        .json({
          error: "Acesso negado. Privilégios administrativos requeridos.",
        });
    }
    next();
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Erro ao verificar privilégios de administrador." });
  }
}

// ==========================================
// 3. ROTA RAIZ (FRONTEND)
// ==========================================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "homepage.html"));
});

// ==========================================
// 4. ROTAS DE AUTENTICAÇÃO E USUÁRIOS
// ==========================================
app.post("/api/register", async (req, res) => {
  const { email, senha, nome } = req.body;
  try {
    const query =
      "INSERT INTO USUARIOS (nome, email, senha, saldo, pontos, adm) VALUES (?, ?, ?, 0, 0, 0)";
    const [result] = await db.query(query, [nome, email, senha]);

    res
      .status(201)
      .json({ message: "Conta criada com sucesso!", id: result.insertId });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "Este e-mail já está em uso." });
    }
    res.status(500).json({ error: "Erro interno ao criar conta." });
  }
});

app.post("/api/login", async (req, res) => {
  const { email, senha } = req.body;
  try {
    const [rows] = await db.query(
      "SELECT id, nome, email, saldo, pontos, adm FROM USUARIOS WHERE email = ? AND senha = ?",
      [email, senha],
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Credenciais inválidas." });
    }

    res.json({ message: "Login efetuado com sucesso!", user: rows[0] });
  } catch (error) {
    res.status(500).json({ error: "Erro ao processar o login." });
  }
});

app.get("/api/usuarios/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query(
      "SELECT id, nome, email, saldo, pontos, adm FROM USUARIOS WHERE id = ?",
      [id],
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar dados do usuário." });
  }
});

app.get("/api/usuarios/:id/biblioteca", async (req, res) => {
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
});

// ==========================================
// 5. ROTAS DE CATÁLOGO (JOGOS PÚBLICOS)
// ==========================================
app.get("/api/jogos", async (req, res) => {
  try {
    const [jogos] = await db.query(
      "SELECT id, titulo, preco, desconto, platform, cover FROM JOGOS",
    );

    const jogosFormatados = jogos.map((jogo) => ({
      ...jogo,
      cover: formatarImagem(jogo.cover),
    }));

    res.json(jogosFormatados);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar catálogo de jogos." });
  }
});

app.get("/api/jogos/:id", async (req, res) => {
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
});

// ==========================================
// 6. ROTAS DE CARRINHO E CHECKOUT
// ==========================================
app.get("/api/carrinho/:id_usuario", async (req, res) => {
  const { id_usuario } = req.params;
  try {
    const query = `
            SELECT j.id, j.titulo, j.preco, j.desconto, j.cover 
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
});

app.post("/api/carrinho", async (req, res) => {
  const { id_usuario, id_jogo } = req.body;
  try {
    await db.query("INSERT INTO CARRINHO (id_usuario, id_jogo) VALUES (?, ?)", [
      id_usuario,
      id_jogo,
    ]);
    res.json({ message: "Jogo adicionado ao carrinho!" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res
        .status(400)
        .json({ error: "Este jogo já está no seu carrinho." });
    }
    res.status(500).json({ error: "Erro ao adicionar jogo ao carrinho." });
  }
});

app.delete("/api/carrinho", async (req, res) => {
  const { id_usuario, id_jogo } = req.body;
  try {
    await db.query(
      "DELETE FROM CARRINHO WHERE id_usuario = ? AND id_jogo = ?",
      [id_usuario, id_jogo],
    );
    res.json({ message: "Jogo removido do carrinho." });
  } catch (error) {
    res.status(500).json({ error: "Erro ao remover jogo do carrinho." });
  }
});

app.post("/api/checkout", async (req, res) => {
  const { id_usuario, id_cupom } = req.body;
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [usuarios] = await connection.query(
      "SELECT saldo, pontos FROM USUARIOS WHERE id = ?",
      [id_usuario],
    );
    if (usuarios.length === 0) throw new Error("Usuário não encontrado.");
    let { saldo, pontos } = usuarios[0];

    const [itensCarrinho] = await connection.query(
      "SELECT j.id, j.preco, j.desconto FROM CARRINHO c JOIN JOGOS j ON c.id_jogo = j.id WHERE c.id_usuario = ?",
      [id_usuario],
    );

    if (itensCarrinho.length === 0) throw new Error("O carrinho está vazio.");

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
        [id_usuario, id_cupom],
      );
      if (cupomValido.length === 0)
        throw new Error("Cupom inválido ou já utilizado.");

      const descontoCupom = parseFloat(cupomValido[0].desconto);
      totalCompra = Math.max(0, totalCompra - descontoCupom);
    }

    if (saldo < totalCompra) throw new Error("Saldo virtual insuficiente.");

    const novosPontosGanhos = Math.floor(totalCompra * 0.1);
    const novoSaldo = saldo - totalCompra;
    const novosPontosTotais = pontos + novosPontosGanhos;

    await connection.query(
      "UPDATE USUARIOS SET saldo = ?, pontos = ? WHERE id = ?",
      [novoSaldo, novosPontosTotais, id_usuario],
    );

    for (const jogo of itensCarrinho) {
      await connection.query(
        "INSERT INTO BIBLIOTECA (id_usuario, id_jogo) VALUES (?, ?)",
        [id_usuario, jogo.id],
      );
    }

    if (id_cupom) {
      await connection.query(
        "UPDATE USUARIO_CUPONS SET usado = TRUE WHERE id_usuario = ? AND id_cupom = ?",
        [id_usuario, id_cupom],
      );
    }

    await connection.query("DELETE FROM CARRINHO WHERE id_usuario = ?", [
      id_usuario,
    ]);

    await connection.commit();
    res.json({
      message: "Compra finalizada com sucesso!",
      saldoRestante: novoSaldo,
      pontosAtuais: novosPontosTotais,
    });
  } catch (error) {
    await connection.rollback();
    res.status(400).json({ error: error.message });
  } finally {
    connection.release();
  }
});

// ==========================================
// 7. ROTAS DE PONTOS E CUPONS
// ==========================================
app.get("/api/cupons", async (req, res) => {
  try {
    const [cupons] = await db.query("SELECT * FROM CUPONS");
    res.json(cupons);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar cupons." });
  }
});

app.get("/api/usuarios/:id/cupons", async (req, res) => {
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
});

app.post("/api/cupons/resgatar", async (req, res) => {
  const { id_usuario, id_cupom } = req.body;
  try {
    const [usuario] = await db.query(
      "SELECT pontos FROM USUARIOS WHERE id = ?",
      [id_usuario],
    );
    const [cupom] = await db.query(
      "SELECT custo_pontos FROM CUPONS WHERE id = ?",
      [id_cupom],
    );

    if (usuario.length === 0 || cupom.length === 0) {
      return res
        .status(404)
        .json({ error: "Usuário ou Cupom não encontrado." });
    }

    const pontosUsuario = usuario[0].pontos;
    const custoCupom = cupom[0].custo_pontos;

    if (pontosUsuario < custoCupom) {
      return res
        .status(400)
        .json({ error: "Pontos insuficientes para resgatar este cupom." });
    }

    await db.query("UPDATE USUARIOS SET pontos = pontos - ? WHERE id = ?", [
      custoCupom,
      id_usuario,
    ]);
    await db.query(
      "INSERT INTO USUARIO_CUPONS (id_usuario, id_cupom) VALUES (?, ?)",
      [id_usuario, id_cupom],
    );

    res.json({ message: "Cupom resgatado com sucesso!" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res
        .status(400)
        .json({ error: "Você já possui este cupom em sua carteira." });
    }
    res.status(500).json({ error: "Erro ao processar o resgate." });
  }
});

// ==========================================
// 8. ROTAS DE ADMINISTRAÇÃO (PROTEGIDAS)
// ==========================================

// --- ADMIN: JOGOS ---
app.post(
  "/api/admin/jogos",
  verificarAdmin,
  upload.fields([
    { name: "cover", maxCount: 1 },
    { name: "screenshot1", maxCount: 1 },
    { name: "screenshot2", maxCount: 1 },
    { name: "screenshot3", maxCount: 1 },
  ]),
  async (req, res) => {
    const { titulo, preco, desconto, platform } = req.body;

    const cover = req.files["cover"] ? req.files["cover"][0].buffer : null;
    const screenshot1 = req.files["screenshot1"]
      ? req.files["screenshot1"][0].buffer
      : null;
    const screenshot2 = req.files["screenshot2"]
      ? req.files["screenshot2"][0].buffer
      : null;
    const screenshot3 = req.files["screenshot3"]
      ? req.files["screenshot3"][0].buffer
      : null;

    try {
      const query = `
            INSERT INTO JOGOS (titulo, preco, desconto, platform, cover, screenshot1, screenshot2, screenshot3) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
      await db.query(query, [
        titulo,
        preco,
        desconto || null,
        platform,
        cover,
        screenshot1,
        screenshot2,
        screenshot3,
      ]);
      res.json({ message: "Jogo cadastrado com sucesso no banco de dados!" });
    } catch (error) {
      res.status(500).json({ error: "Erro ao cadastrar novo jogo." });
    }
  },
);

app.put(
  "/api/admin/jogos/:id",
  verificarAdmin,
  upload.fields([
    { name: "cover", maxCount: 1 },
    { name: "screenshot1", maxCount: 1 },
    { name: "screenshot2", maxCount: 1 },
    { name: "screenshot3", maxCount: 1 },
  ]),
  async (req, res) => {
    const { id } = req.params;
    const { titulo, preco, desconto, platform } = req.body;

    try {
      await db.query(
        "UPDATE JOGOS SET titulo = ?, preco = ?, desconto = ?, platform = ? WHERE id = ?",
        [titulo, preco, desconto || null, platform, id],
      );

      if (req.files["cover"]) {
        await db.query("UPDATE JOGOS SET cover = ? WHERE id = ?", [
          req.files["cover"][0].buffer,
          id,
        ]);
      }
      if (req.files["screenshot1"]) {
        await db.query("UPDATE JOGOS SET screenshot1 = ? WHERE id = ?", [
          req.files["screenshot1"][0].buffer,
          id,
        ]);
      }
      if (req.files["screenshot2"]) {
        await db.query("UPDATE JOGOS SET screenshot2 = ? WHERE id = ?", [
          req.files["screenshot2"][0].buffer,
          id,
        ]);
      }
      if (req.files["screenshot3"]) {
        await db.query("UPDATE JOGOS SET screenshot3 = ? WHERE id = ?", [
          req.files["screenshot3"][0].buffer,
          id,
        ]);
      }

      res.json({ message: "Jogo atualizado com sucesso!" });
    } catch (error) {
      res.status(500).json({ error: "Erro ao atualizar o jogo." });
    }
  },
);

app.delete("/api/admin/jogos/:id", verificarAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM JOGOS WHERE id = ?", [id]);
    res.json({ message: "Jogo removido com sucesso." });
  } catch (error) {
    res.status(500).json({ error: "Erro ao remover o jogo." });
  }
});

// --- ADMIN: USUÁRIOS ---
app.get("/api/admin/usuarios", verificarAdmin, async (req, res) => {
  try {
    // Adicionamos 'senha' na query SELECT abaixo
    const [usuarios] = await db.query(
      "SELECT id, nome, email, senha, saldo, pontos, adm FROM USUARIOS",
    );
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: "Erro ao listar usuários." });
  }
});

app.put("/api/admin/usuarios/:id", verificarAdmin, async (req, res) => {
  const { id } = req.params;
  // Agora desestruturando todos os dados enviados do Modal do Admin
  const { nome, email, saldo, pontos, adm } = req.body;
  
  try {
    await db.query(
      "UPDATE USUARIOS SET nome = ?, email = ?, saldo = ?, pontos = ?, adm = ? WHERE id = ?", 
      [nome, email, saldo, pontos, adm, id]
    );
    res.json({ message: "Dados do usuário modificados com sucesso!" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "Este e-mail já está sendo utilizado por outro usuário." });
    }
    res.status(500).json({ error: "Erro ao modificar dados do usuário." });
  }
});

// --- ADMIN: CUPONS ---
app.post("/api/admin/cupons", verificarAdmin, async (req, res) => {
  const { nome, tipo, desconto, custo_pontos } = req.body;
  try {
    await db.query(
      "INSERT INTO CUPONS (nome, tipo, desconto, custo_pontos) VALUES (?, ?, ?, ?)",
      [nome, tipo, desconto, custo_pontos],
    );
    res.json({ message: "Cupom cadastrado com sucesso!" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar cupom." });
  }
});

app.put("/api/admin/cupons/:id", verificarAdmin, async (req, res) => {
  const { id } = req.params;
  const { nome, tipo, desconto, custo_pontos } = req.body;
  try {
    await db.query(
      "UPDATE CUPONS SET nome = ?, tipo = ?, desconto = ?, custo_pontos = ? WHERE id = ?",
      [nome, tipo, desconto, custo_pontos, id],
    );
    res.json({ message: "Cupom atualizado com sucesso!" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao modificar cupom." });
  }
});

app.delete("/api/admin/cupons/:id", verificarAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM CUPONS WHERE id = ?", [id]);
    res.json({ message: "Cupom removido com sucesso." });
  } catch (error) {
    res.status(500).json({ error: "Erro ao remover cupom." });
  }
});

app.delete("/api/admin/usuarios/:id", verificarAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    // Como você configurou "ON DELETE CASCADE" no banco de dados,
    // excluir o usuário aqui irá automaticamente limpar os cupons, jogos e carrinho dele!
    await db.query("DELETE FROM USUARIOS WHERE id = ?", [id]);
    res.json({ message: "Usuário removido com sucesso." });
  } catch (error) {
    res.status(500).json({ error: "Erro ao remover o usuário." });
  }
});

// ==========================================
// 9. INICIALIZAÇÃO DO SERVIDOR
// ==========================================
app.listen(port, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${port}`);
});