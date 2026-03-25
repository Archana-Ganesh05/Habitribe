require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 5000;

const authRoutes = require("./routes/auth.routes");
app.use("/auth", authRoutes);

const profileRoutes = require("./routes/profile.routes");
app.use("/profile", profileRoutes);

const factionRoutes = require("./routes/faction.routes");
app.use("/factions", factionRoutes);

const questRoutes = require("./routes/quest.routes");
app.use("/quests", questRoutes);

const userRoutes = require("./routes/user.routes");
app.use("/", userRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});