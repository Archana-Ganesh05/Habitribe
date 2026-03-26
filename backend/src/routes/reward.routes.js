const express = require("express");
const router = express.Router();
const rewardController = require("../controllers/reward.controller");
const auth = require("../middleware/auth.middleware");

router.get("/", rewardController.getRewards);
router.post("/redeem", auth, rewardController.redeemReward);

module.exports = router;
