export default function Match() {
  return (
    <main
      className="match-container"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "60vh",
        flexDirection: "column",
      }}
    >
      <div
        className="user-card"
        id="current-card"
        style={{
          width: "300px",
          height: "400px",
          border: "2px solid #333",
          borderRadius: "15px",
          padding: "20px",
          textAlign: "center",
          background: "white",
          backgroundImage: "linear-gradient(to bottom, #f0f0f0 50%, white 50%)",
        }}
      >
        <div
          style={{
            height: "180px",
            background: "#ccc",
            borderRadius: "10px",
            marginBottom: "10px",
          }}
        >
          (照片區域)
        </div>

        <h2>陳同學</h2>
        <p>擅長：英文、攝影</p>
        <p>想學：網頁設計 (程度: 高)</p>
        <p><i>"希望能找到人教我寫 HTML!"</i></p>
      </div>

      <div className="actions" style={{ marginTop: "20px" }}>
        <button style={{ backgroundColor: "#ff4d4d" }}>Skip (跳過)</button>
        <button style={{ backgroundColor: "#4CAF50" }}>Like (配對)</button>
      </div>
    </main>
  );
}
