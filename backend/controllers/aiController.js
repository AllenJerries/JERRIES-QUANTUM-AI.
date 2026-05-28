const { askOllama, streamOllama } = require("../services/ollamaService");

const generateResponse = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: "Prompt is required",
      });
    }

    const response = await askOllama(prompt);

    res.status(200).json({
      success: true,
      response,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const generateStreamResponse = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).send("Prompt is required");
    }

    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Transfer-Encoding", "chunked");

    await streamOllama(prompt, res);
  } catch (error) {
    console.error(error);
    res.end("Streaming Error");
  }
};

module.exports = {
  generateResponse,
  generateStreamResponse,
};