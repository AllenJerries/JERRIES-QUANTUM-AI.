const axios = require("axios");

const askOllama = async (prompt) => {
  const response = await axios.post(
    `${process.env.OLLAMA_URL}/api/generate`,
    {
      model: process.env.MODEL,
      prompt,
      stream: false,
    }
  );

  return response.data.response;
};

const streamOllama = async (prompt, res) => {
  const response = await axios.post(
    `${process.env.OLLAMA_URL}/api/generate`,
    {
      model: process.env.MODEL,
      prompt,
      stream: true,
    },
    {
      responseType: "stream",
    }
  );

  response.data.on("data", (chunk) => {
    const lines = chunk.toString().split("\n").filter(Boolean);

    for (const line of lines) {
      const data = JSON.parse(line);

      if (data.response) {
        res.write(data.response);
      }
    }
  });

  response.data.on("end", () => {
    res.end();
  });
};

module.exports = {
  askOllama,
  streamOllama,
};