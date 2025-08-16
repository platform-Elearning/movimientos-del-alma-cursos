import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./TeacherDashboard.css";
import Card from "../../../components/card/Card";
import { getCourseByTeacherId } from "../../../api/profesores";
import { useAuth } from "../../../services/authContext";

const TeacherDashboard = () => {
  const [assignedCourses, setAssignedCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { isAuthenticated, userId, userRole } = useAuth();

  useEffect(() => {
    const loadTeacherData = async () => {
      try {
        setIsLoading(true);
        
        // Verificar autenticación
        if (!isAuthenticated || userRole !== 'teacher') {
          navigate('/login');
          return;
        }
        // Obtener cursos asignados al profesor
        const coursesResponse = await getCourseByTeacherId(userId);
        if (coursesResponse && coursesResponse.data) {
          setAssignedCourses(coursesResponse.data);
        }
      } catch (error) {
        setError("Error al cargar los cursos asignados");
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated !== null) { // Solo cargar cuando el auth esté determinado
      loadTeacherData();
    }
  }, [navigate, isAuthenticated, userId, userRole]);

  const handleCourseClick = (courseId) => {
    navigate(`/profesores/curso/${courseId}`);
  };

  if (isLoading) {
    return (
      <div className="teacher-loading">
        <div className="loading-spinner">
          <div className="spinner-ring">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
        <p>Cargando dashboard del profesor...</p>
      </div>
    );
  }

  return (
    <div className="teacher-dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Panel del Profesor</h1>
        <p className="dashboard-subtitle">Gestiona tus cursos y estudiantes</p>
      </div>

      <div className="dashboard-content">
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {assignedCourses.length === 0 ? (
          <div className="no-courses">
            <h3>No tienes cursos asignados</h3>
            <p>Contacta al administrador para que te asigne un curso</p>
          </div>
        ) : (
          <div className="courses-grid">
            {assignedCourses.map((course) => (
              <Card
                key={course.id}
                nombre={course.name}
                description={course.description || "Curso de danza"}
                btnText="Gestionar Curso"
                onClick={() => handleCourseClick(course.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
