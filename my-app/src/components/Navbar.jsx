import { NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <nav>
      <div className="logo">SkillSwap</div>
      <ul>
        <li><NavLink to="/" end>首頁</NavLink></li>
        <li><NavLink to="/explore">探索</NavLink></li>
        <li><NavLink to="/about">關於</NavLink></li>
        <li><NavLink to="/login">登入/註冊</NavLink></li>
        <li><NavLink to="/match">配對</NavLink></li>
        <li><NavLink to="/chat">聊天室</NavLink></li>
        <li><NavLink to="/profile">我的檔案</NavLink></li>
      </ul>
    </nav>
  );
}
