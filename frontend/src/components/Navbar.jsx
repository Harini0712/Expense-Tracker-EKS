import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (!user) return null;

  return (
    <header className="navbar">
      <div className="brand">
        Expense<span>Tracker</span>
      </div>
      <nav>
        <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>
          Dashboard
        </NavLink>
        <NavLink to="/expenses" className={({ isActive }) => (isActive ? "active" : "")}>
          Expenses
        </NavLink>
        <span style={{ color: "#9aa1b5", fontSize: 13 }}>{user.username}</span>
        <button onClick={handleLogout}>Logout</button>
      </nav>
    </header>
  );
}
