const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const upload = require("../config/upload"); // Importamos o Multer

// Middleware para processar os arquivos do perfil
const userUploadFields = upload.fields([
  { name: "foto_perfil", maxCount: 1 },
  { name: "fundo_perfil", maxCount: 1 },
]);

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/usuarios/:id", authController.getUsuario);
router.get("/usuarios/:id/biblioteca", authController.getBiblioteca);

// Nova rota para o usuário atualizar os seus próprios dados
router.put("/usuarios/:id/perfil", userUploadFields, authController.atualizarPerfil);

module.exports = router;