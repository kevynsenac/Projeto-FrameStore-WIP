const db = require("../config/db");

async function verificarAdmin(req, res, next) {
  const userId = req.headers["x-user-id"] || req.body.id_usuario_admin;

  if (!userId) {
    return res.status(401).json({ error: "Acesso negado. Usuário não identificado." });
  }

  try {
    const [rows] = await db.query("SELECT adm FROM USUARIOS WHERE id = ?", [userId]);
    if (rows.length === 0 || !rows[0].adm) {
      return res.status(403).json({ error: "Acesso negado. Privilégios administrativos requeridos." });
    }
    next();
  } catch (error) {
    return res.status(500).json({ error: "Erro ao verificar privilégios de administrador." });
  }
}

module.exports = { verificarAdmin };