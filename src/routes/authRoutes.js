const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/usuarios/:id", authController.getUsuario);
router.get("/usuarios/:id/biblioteca", authController.getBiblioteca);

module.exports = router;