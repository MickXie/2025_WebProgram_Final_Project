import { Outlet, Navigate } from "react-router-dom";

export default function PrivateLayout() {
  const isLoggedIn = localStorage.getItem("user"); // 未來改 auth context

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div style={{ display: "flex" }}>
      {/* 未來放 Sidebar / Header / Chat Icon */}
      <div style={{ flex: 1, padding: "24px" }}>
        <Outlet />
      </div>
    </div>
  );
}
