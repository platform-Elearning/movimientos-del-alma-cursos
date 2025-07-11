import "./panelAdmin.css";
import { useAuth } from "../../../services/authContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import emojiAlumno from "../../../assets/emoji-alumnos.png";
import emojiProfesor from "../../../assets/emoji-profesores.png";
import emojiCurso from "../../../assets/emoji-cursos.png";
import ReportsList from "../../../components/reportProblem/ReportProblem";

const PanelAdmin = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/"); // Redirige si no está autenticado
    }
    /*
        const fetchCursos = async () => {
          try {
            const cursosData = await getCursos();
            setCursos(cursosData);
          } catch (error) {
            console.error("Error al obtener los cursos:", error);
          }
        };
    
        if (isAuthenticated) {
          fetchCursos();
        }
          */
  }, [isAuthenticated, navigate]);

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <div className="navigation-buttons-container">
      <section className="btnContainer">
        <img src={emojiAlumno} alt="alumnoLogo" />
        <button
          className="navigation-button"
          onClick={() => handleNavigate("/admin/alumnos")}
        >
          Alumnos
        </button>
      </section>
      <section className="btnContainer">
        <img src={emojiProfesor} alt="profesorLogo" />
        <button
          className="navigation-button"
          onClick={() => handleNavigate("/admin/profesores")}
        >
          Profesores
        </button>
      </section>
      <section className="btnContainer">
        <img src={emojiCurso} alt="cursoLogo" />
        <button
          className="navigation-button"
          onClick={() => handleNavigate("/admin/cursos")}
        >
          Cursos
        </button>
      </section>
      <section>
        <ReportsList></ReportsList>
      </section>
    </div>
  );
};

export default PanelAdmin;
