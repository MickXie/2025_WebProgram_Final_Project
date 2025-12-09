import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";

export default function PrivateLayout() {
  const [loggedIn, setLoggedIn] = useState(localStorage.getItem("loggedIn") === "true");

  useEffect(() => {
    const checkLogin = () => {
      setLoggedIn(localStorage.getItem("loggedIn") === "true");
    };
    window.addEventListener("storage", checkLogin);
    return () => window.removeEventListener("storage", checkLogin);
  }, []);

  if (!loggedIn) {
    return (
      <div className="blur-container">
        <div className="blur-content">
          <Outlet />
        </div>
        <div className="login-required-warning">
          請先登入才能使用此功能
          <br />
          <button onClick={() => window.location.href = "/login"}>
            前往登入
          </button>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
