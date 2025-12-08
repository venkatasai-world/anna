import { useEffect, useState } from "react";
import api from "./api";
import { decodeToken, getToken } from "./auth";

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState("");
  const [sessions, setSessions] = useState([]);

  const [sessionId, setSessionId] = useState(null);

  const token = getToken();
  const user = decodeToken();

  // -------------------------------
  // Load user sessions AFTER login
  // -------------------------------
  async function loadSessions() {
    if (!user) return;

    try {
      const res = await api.get(`/chat/sessions/all/${user.id}`);
      // Sort sessions newest first
      setSessions(res.data.sort((a, b) => new Date(b._id) - new Date(a._id)));
    } catch (err) {
      console.log("Session load failed", err);
    }
  }

  // -------------------------------
  // Start New Chat (guest or user)
  // -------------------------------
  async function startNewChat() {
    const res = await api.post("/chat/start");

    setSessionId(res.data.sessionId);
    localStorage.setItem("sessionId", res.data.sessionId);

    setMessages([]);

    if (user) loadSessions();
  }

  // -------------------------------
  // Load chat history
  // -------------------------------
  async function loadHistory(id) {
    try {
      const res = await api.get(`/chat/${id}/history`);
      // Show latest messages at the top
      setMessages(res.data.reverse());
    } catch (err) {
      console.log("History failed:", err);
    }
  }

  // -------------------------------
  // Send Message
  // -------------------------------
  async function sendMessage() {
    if (!msg.trim()) return;

    // Always save user bubble locally
    const newMsg = { role: "user", content: msg };
    setMessages(prev => [newMsg, ...prev]);

    try {
      const res = await api.post(`/chat/${sessionId}`, {
        message: msg,
        userId: user?.id || null,
      });

      // AI reply
      const aiMsg = { role: "assistant", content: res.data.reply };
      setMessages(prev => [aiMsg, ...prev]);

      setMsg("");

      if (user) loadSessions();
    } catch (err) {
      console.log("Send message failed", err);
      // Optionally show an error message
    }
  }

  // -------------------------------
  // FIRST LOAD — restore session
  // -------------------------------
  useEffect(() => {
    const saved = localStorage.getItem("sessionId");

    if (saved) {
      setSessionId(saved);
      loadHistory(saved);
    } else {
      startNewChat();
    }

    if (user) loadSessions();
  }, []);

  // -------------------------------
  // Sidebar click → load session
  // -------------------------------
  async function openSession(id) {
    setSessionId(id);
    localStorage.setItem("sessionId", id);
    loadHistory(id);
  }

  return (
    <div style={styles.container}>

      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <h3>Chats</h3>

        <button style={styles.newChatBtn} onClick={startNewChat}>
          + New Chat
        </button>

        {sessions.map(s => (
          <div
            key={s._id}
            style={styles.session}
            onClick={() => openSession(s._id)}
          >
            {s.firstMessage?.slice(0, 25) || "New chat"}
          </div>
        ))}
      </div>

      {/* CHAT BOX */}
      <div style={styles.chatBox}>
        <div id="messagesContainer" style={{ ...styles.messages, display: "flex", flexDirection: "column-reverse" }}>
          {messages.map((m, i) => (
            <div key={i} style={m.role === "user" ? styles.userMsg : styles.aiMsg}>
              {m.content}
            </div>
          ))}
        </div>

        <div style={styles.inputArea}>
          <input
            style={styles.input}
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            placeholder="Type message..."
          />
          <button style={styles.sendBtn} onClick={sendMessage}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}


// ---------------------------------
// UI STYLES
// ---------------------------------
const styles = {
  container: { display: "flex", height: "90vh",width:"100vw", background: "#6d6767ff" },

  sidebar: {
    width: "260px",
    background: "#0d1117",
    color: "white",
    padding: "15px",
    overflowY: "auto",
  },

  newChatBtn: {
    width: "100%",
    padding: "10px",
    background: "#238636",
    border: "none",
    color: "white",
    borderRadius: "6px",
    cursor: "pointer",
    marginBottom: "12px",
  },

  session: {
    padding: "12px",
    background: "#161b22",
    marginBottom: "10px",
    borderRadius: "6px",
    cursor: "pointer",
    border: "1px solid #30363d",
  },

  chatBox: { flex: 1, display: "flex", flexDirection: "column" },

  messages: { flex: 1, padding: "20px", overflowY: "auto" },

  userMsg: {
    textAlign: "right",
    margin: "8px 0",
    background: "#121513ff",
    padding: "12px",
    borderRadius: "8px",
    maxWidth: "60%",
    marginLeft: "auto",
  },

  aiMsg: {
    textAlign: "left",
    margin: "8px 0",
    background: "#131315ff",
    padding: "12px",
    borderRadius: "8px",
    maxWidth: "60%",
  },

  inputArea: {
    display: "flex",
    padding: "10px",
    background: "white",
    borderTop: "1px solid #4e4a4aff",
  },

  input: {
    flex: 1,
    padding: "12px",
    borderRadius: "6px",
    border: "1px solid #7e7575ff",
    outline: "none",
    fontSize: "16px",
  },

  sendBtn: {
    marginLeft: "10px",
    padding: "12px 18px",
    background: "#0078ff",
    border: "none",
    color: "white",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "16px",
  },
};
