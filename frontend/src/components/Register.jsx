import { useState } from "react";
import api from "./api";
import { useNavigate } from "react-router-dom";
import { successToast, errorToast } from "./Toast";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleRegister(e) {
    e.preventDefault();
    try {
      const res = await api.post("/auth/register", { username, email, password });
      if (res.data.success) {
        successToast("✅ Registration successful!");
        navigate("/login");
      } else {
        errorToast(`⚠️ ${res.data.message}`);
      }
    } catch (err) {
      // console.error(err);
      errorToast(err.response?.data?.message || "❌ Registration failed!");
    }
  }

  return (
    <div style={styles.container}>
      <form style={styles.card} onSubmit={handleRegister}>
        <h2>Register</h2>

        <input
          style={styles.input}
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          style={styles.input}
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          style={styles.input}
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button style={styles.btn}>Create Account</button>
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
    width: "350px",
    background: "#161b22",
    padding: "25px",
    borderRadius: "10px",
    color: "white",
  },
  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "12px",
    borderRadius: "6px",
    border: "1px solid #30363d",
    background: "#0d1117",
    color: "white",
  },
  btn: {
    width: "100%",
    padding: "12px",
    background: "#238636",
    color: "white",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
  },
};
