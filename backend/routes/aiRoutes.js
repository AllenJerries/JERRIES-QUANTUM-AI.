const express = require("express");
const router = express.Router();

const {
  generateResponse,
  generateStreamResponse,
} = require("../controllers/aiController");

router.post("/chat", generateResponse);
router.post("/stream", generateStreamResponse);

module.exports = router;