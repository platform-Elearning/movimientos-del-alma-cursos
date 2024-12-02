import React, { useState, useEffect } from "react";
import "./Navbar.css";
import logo from "../../assets/logo.png";
import userImg from "../../assets/user.png";
import logoutImg from "../../assets/logout.png";
import { useAuth } from "../context/authContext";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const { logout, userNav, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated && navigate === "/alumnos/miscursos/asd") {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);
 
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <img src={logo} alt="Logo" />
        </div>
        <button className="menu-toggle" onClick={toggleMenu}>
          ☰
        </button>
        <ul className={`navbar-links ${isMenuOpen ? "open" : ""}`}>
          <li>
            <a href="/miscursos">mis Cursos</a>
          </li>
          <li className="user-section">
            <img src={userImg} alt="User" className="user-icon" />
          </li>
          
            <li className="logout-section">
              <img
                src={logoutImg}
                alt="Logout"
                className="logout-icon"
                onClick={logout}
              />
            </li>
          
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
