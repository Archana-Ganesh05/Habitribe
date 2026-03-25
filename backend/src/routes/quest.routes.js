const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const questController = require("../controllers/quest.controller");
const role = require("../middleware/role.middleware");


router.get("/faction/:factionId", auth, questController.getFactionQuests);
router.post("/accept", auth, questController.acceptQuest);
router.post("/complete", auth, questController.completeQuest);
router.post("/create", auth, questController.createQuest);
router.post("/approve",auth,role("moderator"),questController.approveQuest);

module.exports = router;