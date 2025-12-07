export default function About() {
  return (
    <main>
      <h1>關於技能交換平台</h1>
      <p>這是一個網頁程式設計課程的期末專案。</p>

      <div className="card">
        <h2>開發團隊</h2>
        <ul>
          <li><strong>01357043 謝侑均</strong> - 負責前端介面、UI/UX 設計</li>
          <li><strong>01357031 顏家駿</strong> - 負責後端開發、演算法設計</li>
        </ul>
      </div>

      <div className="card">
        <h2>專案理念</h2>
        <p>
          打造一個以「技能交換」為主題的互動平台，
          讓使用者根據興趣、技能與地區進行配對交流。
        </p>
      </div>
    </main>
  );
}
