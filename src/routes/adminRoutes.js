const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { verificarAdmin } = require("../middlewares/auth");
const upload = require("../config/upload");

// Middlewares de imagem para jogos
const imageUploadFields = upload.fields([
  { name: "cover", maxCount: 1 },
  { name: "screenshot1", maxCount: 1 },
  { name: "screenshot2", maxCount: 1 },
  { name: "screenshot3", maxCount: 1 },
]);

// Rotas de Jogos
router.post("/jogos", verificarAdmin, imageUploadFields, adminController.criarJogo);
router.put("/jogos/:id", verificarAdmin, imageUploadFields, adminController.atualizarJogo);
router.delete("/jogos/:id", verificarAdmin, adminController.deletarJogo);

// Rotas de Usuários
router.get("/usuarios", verificarAdmin, adminController.getUsuarios);
router.put("/usuarios/:id", verificarAdmin, adminController.atualizarUsuario);
router.delete("/usuarios/:id", verificarAdmin, adminController.deletarUsuario);

// Rotas de Cupons
router.post("/cupons", verificarAdmin, adminController.criarCupom);
router.put("/cupons/:id", verificarAdmin, adminController.atualizarCupom);
router.delete("/cupons/:id", verificarAdmin, adminController.deletarCupom);

module.exports = router;