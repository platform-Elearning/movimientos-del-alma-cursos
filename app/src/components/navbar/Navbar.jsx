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
            <a href="/alumnos/miscursos/asdsd">mis cursos</a>
          </li>
          <li className="userListItem">
              <FaRegUser className='userIcono'/>
              <h5 className='username'>username</h5>
              <h5 className='logout'>logout</h5>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
