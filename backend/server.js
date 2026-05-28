const express = require("express");
const cors = require("cors");
require("dotenv").config();

const aiRoutes = require("./routes/aiRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/ai", aiRoutes);

app.get("/", (req, res) => {
  res.send("JERRIES QUANTUM AI Backend Running 🚀");
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Keeps Node process alive
setInterval(() => {}, 1000);

server.on("error", (error) => {
  console.error("Server Error:", error);
});
