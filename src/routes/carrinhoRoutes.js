const express = require("express");
const router = express.Router();
const carrinhoController = require("../controllers/carrinhoController");

router.get("/carrinho/:id_usuario", carrinhoController.getCarrinho);
router.post("/carrinho", carrinhoController.addCarrinho);
router.delete("/carrinho", carrinhoController.removeCarrinho);
router.post("/checkout", carrinhoController.checkout);

module.exports = router;