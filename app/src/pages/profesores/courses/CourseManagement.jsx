import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./CourseManagement.css";
import BackLink from "../../../components/backLink/BackLink";
import Card from "../../../components/card/Card";
import { useAuth } from "../../../services/authContext";
import { getCourseDetails } from "../../../api/profesores";

const CourseManagement = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [courseData, setCourseData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { isAuthenticated, userId, userRole } = useAuth();

  useEffect(() => {
    const loadCourseData = async () => {
      try {
        setIsLoading(true);
        
        // Verificar autenticación
        if (!isAuthenticated || userRole !== 'teacher') {
          navigate('/login');
          return;
        }

        console.log("Cargando datos del curso:", courseId, "para profesor:", userId);

        // ✅ CORREGIDO: Pasar teacherId como segundo parámetro
        const response = await getCourseDetails(courseId, userId);
        if (response && response.data) {
          setCourseData(response.data);
        }

      } catch (error) {
        console.error("Error al cargar datos del curso:", error);
        setError("Error al cargar los datos del curso");
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated !== null && courseId && userId) {
      loadCourseData();
    }
  }, [courseId, navigate, isAuthenticated, userRole, userId]);

  const handleCompleteViewClick = () => {
    navigate(`/profesores/curso/${courseId}/completo`);
  };

  const handleStudentsClick = () => {
    navigate(`/profesores/curso/${courseId}/estudiantes`);
  };

  const handleBackClick = () => {
    navigate('/profesores/dashboard');
  };

  if (isLoading) {
    return (
      <div className="course-loading">
        <div className="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <p>Cargando curso...</p>
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="course-management">
        <BackLink title="Volver al Dashboard" onClick={handleBackClick} />
        <div className="error-message">
          {error || "No se pudo cargar la información del curso"}
        </div>
      </div>
    );
  }

  return (
    <div className="course-management">
      <BackLink title="Volver al Dashboard" onClick={handleBackClick} />
      
      <div className="course-header">
        <h1 className="course-title">{courseData.name}</h1>
        <p className="course-description">{courseData.description}</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="course-actions">
        <Card
          nombre="Vista Completa del Curso"
          description="Ve todos los módulos, lecciones y detalles completos del curso. Esta vista incluye toda la información necesaria para gestionar el curso."
          btnText="Ver Vista Completa"
          onClick={handleCompleteViewClick}
        />
        
        <Card
          nombre="Estudiantes del Curso"
          description="Ve el progreso y gestiona a todos los estudiantes inscritos en este curso"
          btnText="Ver Estudiantes"
          onClick={handleStudentsClick}
        />
      </div>
    </div>
  );
};

export default CourseManagement;