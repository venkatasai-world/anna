import { useState } from "react";
import api from "./api";
import { saveToken, decodeToken } from "./auth";
import { useNavigate } from "react-router-dom";
import { successToast, errorToast } from "./Toast";
export default function Login({ setToken }) {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", { emailOrUsername, password });

      if (res.data.success) {
        saveToken(res.data.token);

        const user = decodeToken(); // { id: "...", iat: .. }

        if (!user || !user.id) {
          errorToast("Token decode error");
          return;
        }

        const sessionId = localStorage.getItem("sessionId");

        // Assign guest session to logged user
        if (sessionId) {
          await api.post("/chat/assign-session", {
            sessionId,
            userId: user.id,
          });
        }

        
        navigate("/chat");
        window.location.reload();
        successToast("Login successful!");

      } else {
        errorToast(res.data.message);
      }

    } catch (err) {
      errorToast(err.response?.data?.message || "Server error");
    }
  };

  return (
    <div style={styles.container}>
      <form style={styles.card} onSubmit={handleLogin}>
        <h2 style={styles.title}>Login</h2>

        <input
          style={styles.input}
          placeholder="Email or Username"
          value={emailOrUsername}
          onChange={(e) => setEmailOrUsername(e.target.value)}
        />

        <input
          style={styles.input}
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button style={styles.btn}>Login</button>
      </form>
    </div>
  );
}
const styles = {
  container: {
    height: "100vh",
    width: "100vw",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#0d1117",
  },

  card: {
    align: "center",
    width: "350px",        // fixed width
    minHeight: "400px",    // ensures consistent height
    background: "#161b22",
    padding: "25px",
    borderRadius: "10px",
    color: "white",
    boxShadow: "0 0 15px rgba(0,0,0,0.5)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },

  title: {
    textAlign: "center",
    marginBottom: "20px",
    fontSize: "22px",
  },

  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "12px",
    borderRadius: "6px",
    border: "1px solid #30363d",
    background: "#0d1117",
    color: "white",
    fontSize: "15px",
  },

  btn: {
    width: "100%",
    padding: "12px",
    background: "#238636",
    color: "white",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
  },
};
