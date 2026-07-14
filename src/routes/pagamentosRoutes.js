const express = require("express");
const router = express.Router();
const pagamentosController = require("../controllers/pagamentosController");

router.get("/usuarios/:id_usuario/cartoes", pagamentosController.getCartoes);
router.post("/cartoes", pagamentosController.addCartao);
router.post("/usuarios/adicionar-saldo", pagamentosController.adicionarSaldo);

module.exports = router;