export default function Login() {
  return (
    <main>
      <div className="form-container" style={{ maxWidth: 400, margin: "0 auto" }}>
        <h2 id="form-title">學號登入</h2>

        <form id="auth-form">
          <div style={{ marginBottom: "15px" }}>
            <label htmlFor="student-id">學號 (Student ID):</label><br />
            <input
              type="text"
              id="student-id"
              name="student_id"
              required
              placeholder="例如: 01357043"
              style={{ width: "100%", padding: "8px" }}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label htmlFor="password">密碼:</label><br />
            <input
              type="password"
              id="password"
              name="password"
              required
              style={{ width: "100%", padding: "8px" }}
            />
          </div>

          <button type="submit">登入</button>
        </form>

        <hr />
        <p>還沒有帳號？ <a href="#">註冊新帳號</a></p>
      </div>
    </main>
  );
}
