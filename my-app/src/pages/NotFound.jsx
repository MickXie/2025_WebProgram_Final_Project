import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div style={styles.container}>
      <h1 style={styles.code}>404</h1>
      <p style={styles.text}>頁面不存在或已移除</p>
      <Link to="/" style={styles.link}>
        回首頁
      </Link>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "#f5f5f7",
    color: "#333",
  },
  code: {
    fontSize: "100px",
    margin: "0",
  },
  text: {
    fontSize: "20px",
    margin: "12px 0 24px",
  },
  link: {
    fontSize: "16px",
    color: "#007bff",
    textDecoration: "none",
    border: "1px solid #007bff",
    borderRadius: "6px",
    padding: "8px 16px",
  },
};
