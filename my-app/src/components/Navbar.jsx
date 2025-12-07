import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav>
      <div className="logo">SkillSwap</div>
      <ul>
        <li><Link to="/">首頁</Link></li>
        <li><Link to="/explore">探索</Link></li>
        <li><Link to="/about">關於</Link></li>
        <li><Link to="/login">登入/註冊</Link></li>
      </ul>
    </nav>
  );
}
