const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const upload = require("../config/upload");
const userUploadFields = upload.fields([{ name: "foto_perfil", maxCount: 1 }, { name: "fundo_perfil", maxCount: 1 },]);

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/usuarios/:id", authController.getUsuario);
router.get("/usuarios/:id/biblioteca", authController.getBiblioteca);
router.put("/usuarios/:id/perfil", userUploadFields, authController.atualizarPerfil);

module.exports = router;