import { Link } from "react-router-dom";

export default function Home() {
  return (
    <>
      <header style={{ textAlign: "center", padding: "50px 20px", backgroundColor: "#f4f4f4" }}>
        <h1>讓學習不再孤單，讓專長找到價值</h1>
        <p>透過興趣標籤與技能配對，找到你的最佳學習夥伴。</p>
        <br />
        <Link to="/explore">
          <button>開始尋找夥伴</button>
        </Link>
      </header>

      <main>
        <section>
          <h2>為什麼選擇我們？</h2>
          <p>
            1. 使用學號跟姓名註冊
            <br />
            2. 智慧演算法配對
            <br />
            3. 實時聊天互動
          </p>
        </section>
      </main>
    </>
  );
}
