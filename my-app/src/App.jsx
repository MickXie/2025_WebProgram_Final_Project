import { Routes, Route } from "react-router-dom";
import PrivateLayout from "./layouts/PrivateLayout";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import About from "./pages/About";
import Explore from "./pages/Explore";
import Login from "./pages/Login";
import Match from "./pages/Match";
import Chat from "./pages/Chat";
import Profile from "./pages/Profile";

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Public Pages */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />

        {/* Private Pages */}
        <Route element={<PrivateLayout />}>
          <Route path="/explore" element={<Explore />} />
          <Route path="/match" element={<Match />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </>
  );
}
