import React, { useState, useEffect } from "react";
import "./Navbar.css";
import logo from "../../assets/logo.png";
import userImg from "../../assets/user.png";
import logoutImg from "../../assets/logout.png";
import { useAuth } from "../../services/authContext";
import { useNavigate } from "react-router-dom";


const Navbar = () => {
  const navigate = useNavigate();
  const { logout, userNav, isAuthenticated, checkLogin, userId, userRole } = useAuth();

  useEffect(() => {
    const verifyLoginAndFetchCursos = async () => {
      await checkLogin(); // Verifica el login
    };

    verifyLoginAndFetchCursos();
  }, []);

  // Función para navegar a "Mis Cursos"
  const navigateToPageAlumnnosMisCursos = () => {
    if (userId) {
      navigate(`/alumnos/miscursos/${userId}`);
      console.log("Navigating to mis cursos with userId:", userId);
    } else {
      console.error("userId is null, cannot navigate");
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
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
          {userRole === "student" && ( // Mostrar "Mis Cursos" solo si el rol es student
              <li>
                <a onClick={navigateToPageAlumnnosMisCursos}>Mis Cursos</a>
              </li>
          )}
          <li className="user-section">
            <img src={userImg} alt="User" className="user-icon" />
            <h5 className="username">
              {userNav}
            </h5>
          </li>
          
            <li className="logout-section">
              <img
                src={logoutImg}
                alt="Logout"
                className="logout-icon"
                onClick={logout}
              />
              <h5 className="logout">
                logout
              </h5>
            </li>
          
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;

