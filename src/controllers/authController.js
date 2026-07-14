const db = require("../config/db");
const { formatarImagem } = require("../utils/imageFormat");

async function register(req, res) {
  const { email, senha, nome } = req.body;
  try {
    // 1. Verifica se o email ou o nome já estão em uso
    const [existentes] = await db.query(
      "SELECT nome, email FROM USUARIOS WHERE email = ? OR nome = ?",
      [email, nome],
    );

    if (existentes.length > 0) {
      if (existentes[0].nome === nome) {
        return res
          .status(400)
          .json({ error: "Este nome de usuário já está em uso." });
      }
      if (existentes[0].email === email) {
        return res.status(400).json({ error: "Este e-mail já está em uso." });
      }
    }

    // 2. Se estiver tudo limpo, cria a conta
    const query =
      "INSERT INTO USUARIOS (nome, email, senha, saldo, pontos, adm) VALUES (?, ?, ?, 0, 0, 0)";
    const [result] = await db.query(query, [nome, email, senha]);

    res
      .status(201)
      .json({ message: "Conta criada com sucesso!", id: result.insertId });
  } catch (error) {
    // Fallback de segurança caso a restrição seja disparada pelo MySQL
    if (error.code === "ER_DUP_ENTRY") {
      return res
        .status(400)
        .json({ error: "E-mail ou nome de usuário já em uso." });
    }
    console.error(error);
    res.status(500).json({ error: "Erro interno ao criar conta." });
  }
}

async function login(req, res) {
  const { email, senha } = req.body;
  try {
    // 1. Removemos 'foto_perfil' e 'fundo_perfil' do SELECT
    const [rows] = await db.query(
      "SELECT id, nome, email, saldo, pontos, adm, ultima_roleta, bio, cor_tema FROM USUARIOS WHERE email = ? AND senha = ?",
      [email, senha],
    );
    
    if (rows.length === 0) {
      return res.status(401).json({ error: "Credenciais inválidas." });
    }

    // 2. Não precisamos mais do bloco de 'formatarImagem' aqui. 
    // Pegamos apenas os dados leves (textos e números)
    const user = rows[0];

    res.json({ message: "Login efetuado com sucesso!", user });
  } catch (error) {
    res.status(500).json({ error: "Erro ao processar o login." });
  }
}

async function getUsuario(req, res) {
  const { id } = req.params;
  try {
    const [rows] = await db.query(
      // ADICIONAMOS O cor_tema AQUI NO SELECT TAMBÉM:
      "SELECT id, nome, email, saldo, pontos, adm, ultima_roleta, bio, cor_tema, foto_perfil, fundo_perfil FROM USUARIOS WHERE id = ?",
      [id],
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    // Formatando as imagens do usuário para facilitar o envio pro front-end
    const user = {
      ...rows[0],
      foto_perfil: formatarImagem(rows[0].foto_perfil),
      fundo_perfil: formatarImagem(rows[0].fundo_perfil),
    };

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar dados do usuário." });
  }
}

async function getBiblioteca(req, res) {
  const { id } = req.params;
  try {
    const query = `
      SELECT j.id, j.titulo, j.cover, b.data_compra, b.codigo_resgate 
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

async function atualizarPerfil(req, res) {
  const { id } = req.params;
  const { nome, email, senha, bio, cor_tema, senhaAtual } = req.body;

  try {
    // 0. VERIFICAÇÃO DE SEGURANÇA: Valida a palavra-passe atual antes de qualquer alteração
    const [userDb] = await db.query("SELECT senha FROM USUARIOS WHERE id = ?", [
      id,
    ]);
    if (!userDb.length || userDb[0].senha !== senhaAtual) {
      return res
        .status(401)
        .json({
          error:
            "A tua palavra-passe atual está incorreta. Alterações bloqueadas.",
        });
    }

    // 1. Verifica se o nome ou email já existem noutro utilizador
    const [existentes] = await db.query(
      "SELECT id, nome, email FROM USUARIOS WHERE (email = ? OR nome = ?) AND id != ?",
      [email, nome, id],
    );

    if (existentes.length > 0) {
      if (existentes[0].nome === nome)
        return res
          .status(400)
          .json({ error: "Este nome já está em uso por outro jogador." });
      if (existentes[0].email === email)
        return res
          .status(400)
          .json({ error: "Este e-mail já está cadastrado." });
    }

    // 2. Atualiza os dados de texto
    if (senha && senha.trim() !== "") {
      await db.query(
        "UPDATE USUARIOS SET nome = ?, email = ?, senha = ?, bio = ?, cor_tema = ? WHERE id = ?",
        [nome, email, senha, bio, cor_tema || "#2a2aef", id],
      );
    } else {
      await db.query(
        "UPDATE USUARIOS SET nome = ?, email = ?, bio = ?, cor_tema = ? WHERE id = ?",
        [nome, email, bio, cor_tema || "#2a2aef", id],
      );
    }

    // 3. Atualiza as imagens
    if (req.files && req.files["foto_perfil"]) {
      await db.query("UPDATE USUARIOS SET foto_perfil = ? WHERE id = ?", [
        req.files["foto_perfil"][0].buffer,
        id,
      ]);
    }
    if (req.files && req.files["fundo_perfil"]) {
      await db.query("UPDATE USUARIOS SET fundo_perfil = ? WHERE id = ?", [
        req.files["fundo_perfil"][0].buffer,
        id,
      ]);
    }

    res.json({ message: "Perfil atualizado com sucesso!" });
  } catch (error) {
    res.status(500).json({ error: "Erro interno ao atualizar perfil." });
  }
}

module.exports = {
  register,
  login,
  getUsuario,
  getBiblioteca,
  atualizarPerfil,
};
