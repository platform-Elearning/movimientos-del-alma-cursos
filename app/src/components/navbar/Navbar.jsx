import React, { useState, useEffect } from "react";
import "./Navbar.css";
import logo from "../../assets/logo.png";
import { FaRegUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../services/authContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { logout, userNav, user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated && navigate === "/alumnos/miscursos/asdsd") {
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
          {" "}
          <img src={logo} alt="Logo" />
        </div>
        <button className="menu-toggle" onClick={toggleMenu}>
          ☰
        </button>
        <ul className={`navbar-links ${isMenuOpen ? "open" : ""}`}>
          <li>
            <a href="/alumnos/miscursos/asdsd">Mis cursos</a>
          </li>
          <li className="userListItem">
            <FaRegUser className="userIcono" />
            <h5 className="username">{userNav}</h5>
            <h5 className="username">{user}</h5>

            <h5 className="logout" onClick={logout}>
              logout
            </h5>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
