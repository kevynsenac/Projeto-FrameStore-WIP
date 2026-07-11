const express = require("express");
const router = express.Router();
const cuponsController = require("../controllers/cuponsController");

router.get("/cupons", cuponsController.getCupons);
router.get("/usuarios/:id/cupons", cuponsController.getCuponsUsuario);
router.post("/cupons/resgatar", cuponsController.resgatarCupom);
router.post("/roleta/girar", cuponsController.girarRoleta);

module.exports = router;