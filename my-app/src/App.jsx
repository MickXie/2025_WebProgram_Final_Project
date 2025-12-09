import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import About from "./pages/About";
import Explore from "./pages/Explore";
import Match from "./pages/Match";
import Chat from "./pages/Chat";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import PrivateLayout from "./layouts/PrivateLayout";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        {/* 公開頁面 */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<About />} />

        {/* 受保護頁面 - 共用 Layout */}
        <Route element={<PrivateLayout />}>
          <Route path="/explore" element={<Explore />} />
          <Route path="/match" element={<Match />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  );
}
