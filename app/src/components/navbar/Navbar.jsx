import { useState, useEffect, useCallback, useRef } from "react";
import "./Navbar.css";
import logo from "../../assets/logo2.png";
import userImg from "../../assets/user.png";
import logoutImg from "../../assets/logout.png";
import { useAuth } from "../../services/authContext";
import { useNavigate, useLocation } from "react-router-dom";
import { createReport } from "../../api/createReport"; // Importar la función para enviar reportes
import {
  getNotificationByTeacherId,
  markNotificationAsViewed,
} from "../../api/profesores";

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
  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [loadingNotif, setLoadingNotif] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    const verifyLoginAndFetchCursos = async () => {
      await checkLogin();
      setLoading(false);
    };

    verifyLoginAndFetchCursos();
  }, [checkLogin]);

  const normalizeNotifications = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.notifications)) return data.notifications;
    return [];
  };

  const loadNotifications = useCallback(async () => {
    if (userRole !== "teacher" || !userId) return;
    try {
      setLoadingNotif(true);
      const data = await getNotificationByTeacherId(userId);
      setNotifications(normalizeNotifications(data));
    } catch (error) {
      console.error("Error cargando notificaciones:", error);
    } finally {
      setLoadingNotif(false);
    }
  }, [userId, userRole]);

  useEffect(() => {
    if (!loading && userRole === "teacher" && userId) {
      loadNotifications();
    }
  }, [loading, userRole, userId, loadNotifications]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => n.view_notification === false).length;

  const handleNotificationClick = async (notification) => {
      try {
        await markNotificationAsViewed(notification.id);
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, view_notification: true } : n
          )
        );
      } catch (error) {
        console.error("Error marcando notificación como vista:", error);
      }
    

    const classItem = {
      id: notification.lesson_id,
      lessonNumber: notification.lesson_number || notification.lesson_id,
      lessonTitle: notification.lesson_title || `Clase ${notification.lesson_id}`,
      lessonDescription: notification.lesson_description || "",
      lessonUrl: notification.lesson_url || notification.url || "",
    };

    if (notification.course_id && classItem.id) {
      navigate(
        `/alumnos/${userId}/curso/${notification.course_id}/clase/${classItem.id}`,
        { state: { classItem } }
      );
    }

    setIsNotifOpen(false);
  };

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
          {userRole === "teacher" && (
            <li className="notification-section" ref={notifRef}>
              <button
                className="notification-button"
                onClick={() => {
                  setIsNotifOpen(!isNotifOpen);
                  if (!isNotifOpen) loadNotifications();
                }}
                aria-label="Notificaciones"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount}</span>
                )}
              </button>
              {isNotifOpen && (
                <div className="notification-dropdown">
                  <div className="notification-header">
                    <h4>Notificaciones</h4>
                    {unreadCount > 0 && (
                      <span className="notification-count">
                        {unreadCount} sin leer
                      </span>
                    )}
                  </div>
                  {loadingNotif ? (
                    <p className="notification-loading">Cargando...</p>
                  ) : notifications.length === 0 ? (
                    <p className="notification-empty">No hay notificaciones</p>
                  ) : (
                    <ul className="notification-list">
                      {notifications.map((notification) => (
                        <li
                          key={notification.id}
                          className={`notification-item ${
                            notification.view_notifications ? "viewed" : "unread"
                          }`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="notification-dot"></div>
                          <div className="notification-content">
                            <p className="notification-message">
                              {notification.student_name || notification.studentName || "Un alumno"}:
                              {" "}
                              {notification.comment || notification.message || notification.content || "Nuevo mensaje"}
                            </p>
                            <p className="notification-meta">
                              {notification.course_name || notification.courseName || `Curso ${notification.course_id}`}
                              {" · "}
                              {notification.lesson_title || notification.lessonTitle || `Clase ${notification.lesson_id}`}
                            </p>
                            {notification.created_at && (
                              <p className="notification-time">
                                {new Date(notification.created_at).toLocaleString("es-ES", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </li>
          )}
          <li className="user-section" onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}>
            <img src={userImg} alt="User" className="user-icon" />
            <h5 className="username">{userNav}</h5>
            {isUserMenuOpen && (
              <div className="user-dropdown">
                {userRole === "student" && (
                  <button className="user-dropdown-item" onClick={() => navigate("/changePassword")}>
                    🔒 Cambiar contraseña
                  </button>
                )}

                {userRole === "teacher" && (
                  <div>
                  <button className="user-dropdown-item" onClick={() => navigate("/changePassword")}>
                    Cambiar contraseña
                  </button>

                  <button className="user-dropdown-item" onClick={() => navigate(`/change-description`)}>
                    Cambiar Descripcion
                  </button>
                  </div> 
                  
                )}                


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
