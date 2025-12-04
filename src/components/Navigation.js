import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navigation.css";

function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate("/login");
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  return (
    <nav className="navigation">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          🏔️ Places Mongolia
        </Link>

        <div className="nav-content">
          {isAuthenticated && (
            <ul className="nav-menu">
              <li>
                <Link
                  to="/"
                  className={
                    location.pathname === "/" ? "nav-link active" : "nav-link"
                  }
                >
                  Нүүр хуудас
                </Link>
              </li>
              <li>
                <Link
                  to="/add-place"
                  className={
                    location.pathname === "/add-place"
                      ? "nav-link active"
                      : "nav-link"
                  }
                >
                  Газар нэмэх
                </Link>
              </li>
              <li>
                <Link
                  to="/friends"
                  className={
                    location.pathname === "/friends" ||
                    location.pathname.startsWith("/users")
                      ? "nav-link active"
                      : "nav-link"
                  }
                >
                  Найзууд
                </Link>
              </li>
            </ul>
          )}

          <div className="nav-auth">
            {isAuthenticated ? (
              <div className="user-menu">
                <button className="user-btn" onClick={toggleUserMenu}>
                  <span className="user-avatar">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                  <span className="user-name">{user?.name}</span>
                  <span className="dropdown-arrow">▼</span>
                </button>

                {showUserMenu && (
                  <div className="user-dropdown">
                    <Link
                      to="/profile"
                      className="dropdown-item"
                      onClick={() => setShowUserMenu(false)}
                    >
                      👤 Профайл
                    </Link>
                    <button
                      className="dropdown-item logout-btn"
                      onClick={handleLogout}
                    >
                      🚪 Гарах
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-links">
                <Link
                  to="/login"
                  className={
                    location.pathname === "/login"
                      ? "auth-link active"
                      : "auth-link"
                  }
                >
                  Нэвтрэх
                </Link>
                <Link
                  to="/register"
                  className={
                    location.pathname === "/register"
                      ? "auth-link active"
                      : "auth-link"
                  }
                >
                  Бүртгүүлэх
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
