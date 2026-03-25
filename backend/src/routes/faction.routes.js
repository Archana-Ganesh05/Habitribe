const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const factionController = require("../controllers/faction.controller");

router.get("/", factionController.getFactions);
router.post("/join", auth, factionController.joinFaction);
router.get("/mine", auth, factionController.getMyFactions);

module.exports = router;