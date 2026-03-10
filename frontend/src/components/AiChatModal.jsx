import { useEffect, useMemo, useRef, useState } from "react";
import aiApi from "../aiApi";
import { useAuth } from "../context/AuthContext";

export default function AIChatModal({ open, onClose }) {
  const { user, isAdmin } = useAuth();
  const token = useMemo(() => localStorage.getItem("token"), []);
  const sessionId = useMemo(() => {
    const key = "ai_session_id";
    let s = localStorage.getItem(key);
    if (!s) {
      s = `sess-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      localStorage.setItem(key, s);
    }
    return s;
  }, []);

  const [messages, setMessages] = useState([
    {
      role: "bot",
      text:
        "Hi 👋 I’m Keells AI Assistant. I can compare products by **price/unit**, suggest best value, and add items to your cart. What do you want to compare?",
    },
  ]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const bottomRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }, [open, messages]);

  if (!open) return null;

  // only logged-in customers
  if (!user || isAdmin) return null;

  const send = async () => {
    const msg = text.trim();
    if (!msg || sending) return;

    setMessages((m) => [...m, { role: "user", text: msg }]);
    setText("");
    setSending(true);

    try {
      const headers = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await aiApi.post(
        "/chat",
        { sessionId, message: msg },
        { headers }
      );

      setMessages((m) => [...m, { role: "bot", text: res.data?.reply || "OK" }]);
    } catch (e) {
      const detail =
        e.response?.data?.detail ||
        e.response?.data?.message ||
        "AI Service error. Make sure ai-service is running on port 8001.";
      setMessages((m) => [...m, { role: "bot", text: `❌ ${detail}` }]);
    } finally {
      setSending(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(980px, 96vw)",
          height: "min(620px, 86vh)",
          background: "white",
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(90deg, #1f6b2c, #2e8a3b)",
            color: "white",
            padding: "0.9rem 1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontWeight: 700, fontSize: "1.05rem" }}>Keells AI Assistant</div>
            <div style={{ opacity: 0.9, fontSize: "0.9rem" }}>
              Smart Product Comparison • Recommendations
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.18)",
              border: "none",
              color: "white",
              width: 40,
              height: 40,
              borderRadius: 12,
              cursor: "pointer",
              fontSize: 20,
            }}
            aria-label="Close"
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Messages */}
        <div
          style={{
            flex: 1,
            padding: "1rem",
            overflowY: "auto",
            background: "#fafafa",
          }}
        >
          {messages.map((m, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                justifyContent: m.role === "user" ? "flex-end" : "flex-start",
                marginBottom: "0.75rem",
              }}
            >
              <div
                style={{
                  maxWidth: "78%",
                  padding: "0.8rem 0.9rem",
                  borderRadius: 14,
                  background: m.role === "user" ? "#1f6b2c" : "white",
                  color: m.role === "user" ? "white" : "#111",
                  border: m.role === "user" ? "none" : "1px solid #e6e6e6",
                  whiteSpace: "pre-wrap",
                  lineHeight: 1.35,
                }}
              >
                {m.text}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div
          style={{
            padding: "0.9rem",
            borderTop: "1px solid #e8e8e8",
            display: "flex",
            gap: "0.75rem",
            alignItems: "center",
            background: "white",
          }}
        >
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder='Ask: "compare milk 1L", "cheddar cheese cheapest", "Kotmale milk compare"...'
            rows={1}
            style={{
              flex: 1,
              resize: "none",
              borderRadius: 12,
              border: "1px solid #ddd",
              padding: "0.75rem 0.9rem",
              outline: "none",
              minHeight: 46,
            }}
          />
          <button
            className="btn btn-primary"
            onClick={send}
            disabled={sending}
            style={{ minWidth: 96, height: 46 }}
          >
            {sending ? "..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}