import React, { useState } from "react";
import "./Navbar.css";
import logo from "../../assets/logo.png";
import { FaRegUser } from 'react-icons/fa';

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
            <a href="alumno/miscursos/sd">mis cursos</a>
          </li>
          <li>
            <FaRegUser className='userIcono'/>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
