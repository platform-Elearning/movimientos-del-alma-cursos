import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCoursesByStudentId, getAllCoursesPublic } from "../../../api/cursos";
import "./alumnosMisCursos.css";
import Card from "../../../components/card/Card";
import { getResumenDeProgreso } from "../../../api/progreso";
import { useAuth } from "../../../services/authContext";
import { fraseDeRacha } from "../../../utils/progreso";

const AlumnosMisCursos = () => {
  const { alumnoId } = useParams(); 
  const navigate = useNavigate();
  const [cursos, setCursos] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resumen, setResumen] = useState(null);
  const { userRole } = useAuth();

  useEffect(() => {
    // Solo la alumna tiene progreso. Si falla, la pantalla sigue sin él.
    if (userRole !== "student") return;
    getResumenDeProgreso()
      .then(setResumen)
      .catch(() => setResumen(null));
  }, [userRole, alumnoId]);

  const fetchCursos = async () => {
    try {
      // Fetch student's enrolled courses
      const cursosData = await getCoursesByStudentId(alumnoId);
      
      // Fetch all available courses
      const allCoursesData = await getAllCoursesPublic();

      //console.log('Enrolled courses data:', cursosData);
      //console.log('All courses data:', allCoursesData);

      if (cursosData.success && Array.isArray(cursosData.data)) {
        setCursos(cursosData.data);
        // Store enrolled course IDs for comparison
        const enrolledIds = cursosData.data.map(curso => curso.course_id);
        setEnrolledCourseIds(enrolledIds);
      } else {
        console.error("Enrolled courses format error:", cursosData);
      }

      if (allCoursesData && allCoursesData.data && Array.isArray(allCoursesData.data)) {
        setAllCourses(allCoursesData.data);
      } else if (allCoursesData && Array.isArray(allCoursesData)) {
        // Handle case where data is directly in the response
        setAllCourses(allCoursesData);
      } else {
        console.error("All courses format error:", allCoursesData);
        setError("Error al obtener los cursos disponibles");
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      setError("Error al obtener los cursos: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCursos();
  }, [alumnoId]); // Llamar a fetchCursos cuando cambie el id del alumno

  const goToCourse = (courseId) => {
    navigate(`/alumnos/${alumnoId}/curso/${courseId}`);
  };

  const handleLockedCourseClick = () => {
    // Redirect to WhatsApp
    const whatsappNumber = "5493513592115"; // +54 9 3513 59-2115
    const message = encodeURIComponent("Hola, me gustaría obtener más información sobre los cursos disponibles.");
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, "_blank");
  };

  const progresoDe = (cursoId) => resumen?.cursos.find((c) => c.course_id === cursoId);
  const ultima = resumen?.ultimaClase;
  const racha = fraseDeRacha(resumen?.racha);

  const continuar = () =>
    navigate(`/alumnos/${alumnoId}/curso/${ultima.course_id}/clase/${ultima.lesson_id}`);

  if (loading) return <p className="loading-message">Cargando cursos...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="cursos-container">
      <div className="title-container" >
        <h2 className="cursos-title">Mis Formaciones</h2>
      </div>
      {(ultima || racha) && (
        <div className="continuar-contenedor">
          {racha && <p className="racha">{racha}</p>}
          {ultima && (
            <div className="continuar-tarjeta">
              <div className="continuar-texto">
                <span className="continuar-etiqueta">Continuar donde lo dejaste</span>
                <h3>{ultima.title}</h3>
                <p>
                  {ultima.course_name} · {ultima.module_name}
                </p>
              </div>
              <button type="button" className="boton-dorado" onClick={continuar}>
                {ultima.completada ? "Volver a verla ▶" : "Seguir ▶"}
              </button>
            </div>
          )}
        </div>
      )}
      <div className="card-container">
        {allCourses.map((curso) => {
          const isEnrolled = enrolledCourseIds.includes(curso.id);
          return (
            <div
              key={curso.id}
              className={`course-card-wrapper ${!isEnrolled ? 'locked' : ''}`}
            >
              {!isEnrolled && (
                <div className="lock-overlay" onClick={handleLockedCourseClick}>
                  <div className="lock-icon">🔒</div>
                  <p className="lock-text">Desbloquea este curso</p>
                </div>
              )}
              <Card
                onClick={isEnrolled ? () => goToCourse(curso.id) : () => {}}
                nombre={curso.name}
                description={curso.description}
                btnText={isEnrolled ? "IR AL MATERIAL" : ""}
                progreso={isEnrolled ? progresoDe(curso.id) : undefined}
              />

            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AlumnosMisCursos;
