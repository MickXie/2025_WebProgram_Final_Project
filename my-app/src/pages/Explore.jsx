export default function Explore() {
  return (
    <main>
      <h1>探索學習夥伴</h1>

      <div className="search-bar" style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="搜尋技能或興趣..."
          style={{ padding: "10px", width: "60%" }}
        />
        <button>搜尋</button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "20px",
        }}
      >
        <div className="card">
          <h3>謝小米</h3>
          <p>技能: 放電</p>
          <button>查看詳情</button>
        </div>

        <div className="card">
          <h3>吳泓陞</h3>
          <p>技能: 足球</p>
          <button>查看詳情</button>
        </div>

        <div className="card">
          <h3>張雲翔</h3>
          <p>技能: 我的世界S</p>
          <button>查看詳情</button>
        </div>
      </div>
    </main>
  );
}
