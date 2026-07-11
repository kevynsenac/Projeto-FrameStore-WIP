const express = require("express");
const router = express.Router();
const jogosController = require("../controllers/jogosController");

router.get("/jogos", jogosController.getJogos);
router.get("/jogos/:id", jogosController.getJogoById);

module.exports = router;