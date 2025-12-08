import { logout, getToken } from "./auth";

export default function Navbar() {
  const token = getToken();

  return (
    <nav style={styles.navbar}>
      {/* Brand Logo */}
      <div style={styles.logo}>Software AI</div>

      {/* Right Section */}
      <div style={styles.right}>
        {token ? (
          <button style={styles.logoutBtn} onClick={logout}>
            Logout
          </button>
        ) : (
          <>
            <a href="/login" style={styles.link}>
              Login
            </a>
            <a href="/register" style={styles.registerBtn}>
              Register
            </a>
          </>
        )}
      </div>
    </nav>
  );
}

/* ---------- STYLES ---------- */
const styles = {
  navbar: {
    width: "97%",
    padding: "15px 25px",
    background: "#0d1117",
    color: "white",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #30363d",
    position: "sticky",
    top: 0,
    zIndex: 999,
  },

  logo: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#58a6ff",
    cursor: "pointer",
  },

  right: {
    display: "flex",
    gap: "15px",
    alignItems: "center",
  },

  link: {
    color: "#c9d1d9",
    textDecoration: "none",
    fontSize: "16px",
    padding: "8px 14px",
    borderRadius: "6px",
    border: "1px solid #30363d",
  },

  registerBtn: {
    color: "white",
    textDecoration: "none",
    background: "#238636",
    padding: "8px 14px",
    borderRadius: "6px",
    fontSize: "16px",
    border: "1px solid #2ea043",
  },

  logoutBtn: {
    background: "#da3633",
    color: "white",
    padding: "8px 14px",
    borderRadius: "6px",
    fontSize: "16px",
    border: "none",
    cursor: "pointer",
  },
};
