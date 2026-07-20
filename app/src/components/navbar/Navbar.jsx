import React, { useState, useEffect } from "react";
import "./Navbar.css";
import logo from "../../assets/logo2.png";
import userImg from "../../assets/user.png";
import logoutImg from "../../assets/logout.png";
import { useAuth } from "../../services/authContext";
import { useNavigate, useLocation } from "react-router-dom";
import { createReport } from "../../api/createReport"; // Importar la función para enviar reportes

const PUBLIC_ROUTES = new Set([
  "/",
  "/login",
  "/register",
  "/pageAuxiliar",
  "/OlvideContraseña",
  "/OlvideContrase%C3%B1a",
  "/verify-code",
  "/reset-password",
]);

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, userNav, isAuthenticated, checkLogin, userId, userRole } =
    useAuth();

  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportText, setReportText] = useState("");
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    const verifyLoginAndFetchCursos = async () => {
      await checkLogin();
      setLoading(false);
    };

    verifyLoginAndFetchCursos();
  }, [checkLogin]);

  useEffect(() => {
    const decoded = decodeURIComponent(location.pathname);
    const isPublic = PUBLIC_ROUTES.has(location.pathname) || PUBLIC_ROUTES.has(decoded);
    if (!loading && !isAuthenticated && !isPublic) {
      navigate("/");
    }
  }, [isAuthenticated, loading, navigate, location.pathname]);

  const navigateToPageAlumnnosMisCursos = () => {
    if (userId) {
      navigate(`/alumnos/miscursos/${userId}`);
    } else {
      console.error("userId is null, cannot navigate");
    }
  };
    const navigateToPageAlumnnosMisCertificaciones = () => {
    if (userId) {
      navigate(`/alumnos/miscertificaciones/${userId}`);
    } else {
      console.error("userId is null, cannot navigate");
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const openReportModal = () => {
    setIsReportModalOpen(true);
  };

  const closeReportModal = () => {
    setIsReportModalOpen(false);
    setReportText("");
  };

  const submitReport = async () => {
    if (!reportText.trim()) {
      alert("Por favor, escribe un reporte antes de enviarlo.");
      return;
    }

    try {
      console.log("Enviando datos al servidor:", {
        user_id: userId,
        description: reportText, 
      });

      await createReport({
        user_id: userId, 
        description: reportText, 
      });

      alert("Reporte enviado con éxito.");
      closeReportModal();
    } catch (error) {
      console.error("Error al enviar el reporte:", error);
      console.error("Detalles del error:", error.response?.data);
      alert(
        error.response?.data?.error ||
          "Hubo un error al enviar el reporte. Por favor, inténtalo de nuevo."
      );
    }
  };

  if (loading) {
    return <p className="loading-message">Verificando autenticación...</p>;
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <a
            href="https://mda-ifi.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src={logo} alt="Logo" />
          </a>
        </div>
        <button className="menu-toggle" onClick={toggleMenu}>
          ☰
        </button>
        <ul className={`navbar-links ${isMenuOpen ? "open" : ""}`}>
          {userRole === "student" && (
            <li>
              <a className="alumno-a" onClick={navigateToPageAlumnnosMisCursos}>Mis Formaciones</a>
              <a className="alumno-a" onClick={navigateToPageAlumnnosMisCertificaciones}>Mis Certificaciones</a>

            </li>
          )}
          <li>
            <button className="report-button" onClick={openReportModal}>
              Reportar Problema
            </button>
          </li>
          <li className="user-section" onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}>
            <img src={userImg} alt="User" className="user-icon" />
            <h5 className="username">{userNav}</h5>
            {isUserMenuOpen && (
              <div className="user-dropdown">
                <button className="user-dropdown-item" onClick={() => navigate("/changePassword")}>
                  🔒 Cambiar contraseña
                </button>
              </div>
            )}
          </li>
          <li className="logout-section">
            <img
              src={logoutImg}
              alt="Logout"
              className="logout-icon"
              onClick={logout}
            />
            <h5 className="logout">Logout</h5>
          </li>
        </ul>
      </div>

      {isReportModalOpen && (
        <div className="report-modal">
          <div className="report-modal-content">
            <h3>Reportar Problema o Sugerencia</h3>
            <textarea
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              placeholder="Escribe tu reporte aquí..."
            />
            <div className="report-modal-actions">
              <button onClick={submitReport}>Enviar</button>
              <button onClick={closeReportModal}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
