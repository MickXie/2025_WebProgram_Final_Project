export default function Chat() {
  return (
    <main>
      <div
        className="chat-layout"
        style={{
          display: "flex",
          height: "70vh",
          border: "1px solid #ccc",
        }}
      >
        <aside
          className="friend-list"
          style={{
            width: "30%",
            borderRight: "1px solid #ccc",
            padding: "10px",
            background: "#f9f9f9",
          }}
        >
          <h3>好友列表</h3>
          <ul>
            <li style={{ padding: 10, background: "#ddd", cursor: "pointer" }}>
              陳同學 (線上)
            </li>
            <li style={{ padding: 10, cursor: "pointer" }}>林同學</li>
          </ul>
        </aside>

        <section
          className="chat-area"
          style={{
            width: "70%",
            padding: "10px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            className="messages"
            style={{
              flexGrow: 1,
              border: "1px solid #eee",
              marginBottom: "10px",
              padding: "10px",
              overflowY: "scroll",
            }}
          >
            <p><strong>陳同學:</strong> 嗨！我們配對成功了！</p>
            <p><strong>我:</strong> 你好啊，請多指教。</p>
          </div>

          <div className="input-area">
            <input
              type="text"
              placeholder="輸入訊息..."
              style={{ width: "80%" }}
            />
            <button>發送</button>
          </div>
        </section>
      </div>
    </main>
  );
}
