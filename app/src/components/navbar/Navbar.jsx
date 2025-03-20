import React, { useState, useEffect } from "react";
import "./Navbar.css";
import logo from "../../assets/logo.png";
import userImg from "../../assets/user.png";
import logoutImg from "../../assets/logout.png";
import { useAuth } from "../../services/authContext";
import { useNavigate } from "react-router-dom";
import ReportForm from "../reportProblem/ReportProblem";

const Navbar = () => {
  const navigate = useNavigate();
  const { logout, userNav, isAuthenticated, checkLogin, userId, userRole } =
    useAuth();

  const [loading, setLoading] = useState(true); // Estado para verificar si checkLogin ha terminado

  useEffect(() => {
    const verifyLoginAndFetchCursos = async () => {
      await checkLogin(); // Verifica el login
      setLoading(false); // Marca que la verificación ha terminado
    };

    verifyLoginAndFetchCursos();
  }, [checkLogin]);

  useEffect(() => {
    if (
      !loading &&
      !isAuthenticated &&
      window.location.pathname !== "/pageAuxiliar" &&
      window.location.pathname !== "/login" &&
      window.location.pathname !== "/register" &&
      window.location.pathname !== "/changepassword"
    ) {
      navigate("/");
    }
  }, [isAuthenticated, loading, navigate]);

  // Función para navegar a "Mis Cursos"
  const navigateToPageAlumnnosMisCursos = () => {
    if (userId) {
      navigate(`/alumnos/miscursos/${userId}`);
      console.log("Navigating to mis cursos with userId:", userId);
    } else {
      console.error("userId is null, cannot navigate");
    }
  };

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Mostrar un indicador de carga mientras se verifica la autenticación
  if (loading) {
    return <p className="loading-message">Verificando autenticación...</p>;
  }

  // Función para abrir el modal de reporte
  const openReportModal = () => {
    setIsReportModalOpen(true);
  };

  // Función para cerrar el modal de reporte
  const closeReportModal = () => {
    setIsReportModalOpen(false);
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
          {userRole === "student" && (
            <li>
              <a onClick={navigateToPageAlumnnosMisCursos}>Mis Cursos</a>
            </li>
          )}
          <li className="user-section">
            <img src={userImg} alt="User" className="user-icon" />
            <h5 className="username">{userNav}</h5>
          </li>
          <li className="logout-section">
            <img src={logoutImg} alt="Logout" className="logout-icon" onClick={logout} />
            <h5 className="logout">Logout</h5>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
