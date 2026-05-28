import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import { useState, useEffect, useRef } from "react";

function App() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const sendMessage = async () => {
    if (!prompt.trim() || loading) return;

    const userMessage = {
      role: "user",
      content: prompt,
    };

    setMessages((prev) => [...prev, userMessage]);

    const currentPrompt = prompt;
    setPrompt("");
    setLoading(true);

    const aiMessage = {
      role: "ai",
      content: "",
    };

    setMessages((prev) => [...prev, aiMessage]);

    try {
      const response = await fetch("http://localhost:5000/api/ai/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: currentPrompt,
        }),
      });

      if (!response.body) {
        throw new Error("No response body from server");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let fullText = "";
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();

        done = doneReading;

        if (value) {
          const chunkValue = decoder.decode(value, { stream: true });
          fullText += chunkValue;

          setMessages((prev) => {
            const updated = [...prev];

            updated[updated.length - 1] = {
              role: "ai",
              content: fullText,
            };

            return updated;
          });
        }
      }
    } catch (error) {
      console.error(error);

      setMessages((prev) => {
        const updated = [...prev];

        updated[updated.length - 1] = {
          role: "ai",
          content: "⚠️ Error connecting to JERRIES QUANTUM AI server.",
        };

        return updated;
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="p-5 border-b border-gray-800">
        <h1 className="text-3xl font-bold text-cyan-400">
          JERRIES QUANTUM AI
        </h1>

        <p className="text-gray-500">Unlimited Local Intelligence 🚀</p>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-4 rounded-2xl max-w-4xl ${
              msg.role === "user" ? "bg-cyan-600 ml-auto" : "bg-gray-900"
            }`}
          >
            <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
              {msg.content}
            </ReactMarkdown>
          </div>
        ))}

        {loading && <div className="text-gray-500">AI is thinking...</div>}

        <div ref={messagesEndRef}></div>
      </div>

      <div className="p-5 border-t border-gray-800 flex gap-3">
        <textarea
          placeholder="Ask anything..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          rows="1"
          className="flex-1 bg-gray-900 border border-gray-700 rounded-xl p-4 outline-none resize-none"
        />

        <button
          onClick={sendMessage}
          disabled={loading}
          className="bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-700 disabled:cursor-not-allowed px-6 rounded-xl font-semibold"
        >
          {loading ? "Thinking..." : "Send"}
        </button>
      </div>
    </div>
  );
}

export default App;