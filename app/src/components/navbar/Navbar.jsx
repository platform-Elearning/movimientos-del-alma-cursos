import React, { useState } from "react";
import "./Navbar.css";
import Button from "../../components/button/Button"; // Importa el componente Button
import logo from "../../assets/logo.png";

const Navbar = () => {
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
            <a href="#home">Conocenos</a>
          </li>
          <li>
            <a href="#about">Nuestros cursos</a>
          </li>

          <li>
            <Button text="Plataforma" /> {/* El botón ahora dirá PLATAFORMA */}
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
