import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import { useState, useEffect, useRef } from "react";

function App() {
  const [chats, setChats] = useState([
    {
      id: Date.now(),
      title: "New Chat",
      messages: [],
    },
  ]);

  const [activeChatId, setActiveChatId] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    setActiveChatId(chats[0].id);
  }, []);

  const activeChat = chats.find((chat) => chat.id === activeChatId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [activeChat?.messages]);

  const createNewChat = () => {
    const newChat = {
      id: Date.now(),
      title: "New Chat",
      messages: [],
    };

    setChats((prev) => [newChat, ...prev]);
    setActiveChatId(newChat.id);
    setPrompt("");
  };

  const deleteChat = (chatId) => {
    if (chats.length === 1) return;

    const filteredChats = chats.filter((chat) => chat.id !== chatId);

    setChats(filteredChats);

    if (activeChatId === chatId) {
      setActiveChatId(filteredChats[0].id);
    }
  };

  const updateActiveChatMessages = (updater) => {
    setChats((prevChats) =>
      prevChats.map((chat) => {
        if (chat.id !== activeChatId) return chat;

        return {
          ...chat,
          messages:
            typeof updater === "function" ? updater(chat.messages) : updater,
        };
      })
    );
  };

  const updateChatTitle = (chatId, title) => {
    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              title,
            }
          : chat
      )
    );
  };

  const sendMessage = async () => {
    if (!prompt.trim() || loading || !activeChat) return;

    const currentPrompt = prompt;

    const userMessage = {
      role: "user",
      content: currentPrompt,
    };

    if (activeChat.messages.length === 0) {
      updateChatTitle(
        activeChat.id,
        currentPrompt.length > 28
          ? currentPrompt.slice(0, 28) + "..."
          : currentPrompt
      );
    }

    updateActiveChatMessages((prev) => [...prev, userMessage]);

    setPrompt("");
    setLoading(true);

    const aiMessage = {
      role: "ai",
      content: "",
    };

    updateActiveChatMessages((prev) => [...prev, aiMessage]);

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

          updateActiveChatMessages((prev) => {
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

      updateActiveChatMessages((prev) => {
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
    <div className="min-h-screen bg-black text-white flex">
      <aside className="w-72 bg-[#050505] border-r border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <h1 className="text-xl font-bold text-cyan-400">
            JERRIES QUANTUM AI
          </h1>

          <p className="text-xs text-gray-500 mt-1">
            Unlimited Local Intelligence
          </p>
        </div>

        <div className="p-4">
          <button
            onClick={createNewChat}
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-bold py-3 rounded-xl"
          >
            + New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 space-y-2">
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setActiveChatId(chat.id)}
              className={`group cursor-pointer p-3 rounded-xl text-sm flex justify-between items-center ${
                activeChatId === chat.id
                  ? "bg-cyan-500 text-black"
                  : "bg-gray-900 text-gray-300 hover:bg-gray-800"
              }`}
            >
              <span className="truncate">{chat.title}</span>

              {chats.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteChat(chat.id);
                  }}
                  className="opacity-60 hover:opacity-100 ml-2"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-gray-800 text-xs text-gray-500">
          Local Model: Qwen2.5-Coder
        </div>
      </aside>

      <main className="flex-1 flex flex-col">
        <div className="p-5 border-b border-gray-800">
          <h2 className="text-2xl font-bold text-cyan-400">
            {activeChat?.title || "New Chat"}
          </h2>

          <p className="text-gray-500 text-sm">
            Streaming AI Chat • Markdown • Code Highlighting
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {activeChat?.messages.length === 0 && (
            <div className="h-full flex items-center justify-center text-center">
              <div>
                <h2 className="text-4xl font-bold text-cyan-400 mb-3">
                  JERRIES QUANTUM AI
                </h2>

                <p className="text-gray-500">
                  Ask me coding, debugging, project, or study questions 🚀
                </p>
              </div>
            </div>
          )}

          {activeChat?.messages.map((msg, index) => (
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
            className="bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-black px-6 rounded-xl font-bold"
          >
            {loading ? "Thinking..." : "Send"}
          </button>
        </div>
      </main>
    </div>
  );
}

export default App;