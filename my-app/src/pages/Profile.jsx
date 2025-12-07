export default function Profile() {
  return (
    <main>
      <section className="card">
        <h2>個人資料設定</h2>
        <form>
          <label>姓名/暱稱:</label>
          <input type="text" defaultValue="王小明" /><br /><br />
          <label>自我介紹:</label>
          <textarea rows="3" cols="30">我很喜歡寫程式，想學吉他。</textarea>
          <button type="button">儲存資料</button>
        </form>
      </section>

      <section className="card">
        <h3>我擁有的技能 (Skills)</h3>
        <ul>
          <li>Python 程式設計 <button>刪除</button></li>
          <li>網頁開發 <button>刪除</button></li>
        </ul>
        <input type="text" placeholder="輸入新技能" />
        <button>新增</button>
      </section>

      <section className="card" style={{ borderLeft: "5px solid orange" }}>
        <h3>我想學的興趣 (Interests & Level)</h3>
        <p>設定程度以優化配對演算法：高(3)、中(2)、低(1)</p>

        <div className="interest-item">
          <span>吉他</span>
          <select defaultValue="2">
            <option value="3">高 (High)</option>
            <option value="2">中 (Mid)</option>
            <option value="1">低 (Low)</option>
          </select>
          <button>刪除</button>
        </div>
        <br />

        <input type="text" placeholder="輸入興趣標籤" />
        <select>
          <option value="3">程度: 高</option>
          <option value="2">程度: 中</option>
          <option value="1">程度: 低</option>
        </select>
        <button>新增標籤</button>
      </section>
    </main>
  );
}
