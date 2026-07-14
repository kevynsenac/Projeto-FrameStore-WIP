const express = require("express");
const router = express.Router();
const pagamentosController = require("../controllers/pagamentosController");

router.get("/usuarios/:id_usuario/cartoes", pagamentosController.getCartoes);
router.post("/cartoes", pagamentosController.addCartao);
router.post("/usuarios/adicionar-saldo", pagamentosController.adicionarSaldo);
router.delete("/cartoes/:id", pagamentosController.deleteCartao);
router.put("/cartoes/:id", pagamentosController.updateCartao);

module.exports = router;