const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const profileController = require("../controllers/profile.controller");

router.post("/", auth, profileController.createProfile);
router.get("/", auth, profileController.getProfile);

module.exports = router;