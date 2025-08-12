import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AuthUtils from '../../../utils/authUtils';
import { getStudentByCourseId } from '../../../api/profesores';
import { getModulesByCourseID } from '../../../api/cursos';
import BackLink from '../../../components/backLink/BackLink';
import CardModuleTeacher from '../../../components/cardModuleTeacher/CardModuleTeacher';
import './StudentsManagement.css';

const StudentsManagement = () => {
  const { courseId } = useParams();
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showStudentDetails, setShowStudentDetails] = useState(false);
  const [error, setError] = useState('');
  const [totalModules, setTotalModules] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!AuthUtils.checkAndCleanExpiredToken()) {
      navigate('/login');
      return;
    }
    
    if (!courseId) {
      setError('ID del curso no encontrado');
      setIsLoading(false);
      return;
    }
    
    loadStudentsData();
  }, [navigate, courseId]);

  // Obtener total de módulos del curso
  const getCourseModules = async () => {
    try {
      const response = await getModulesByCourseID(courseId);
      if (response && response.data && Array.isArray(response.data)) {
        setTotalModules(response.data.length);
        return response.data.length;
      } else {
        setTotalModules(0);
        return 0;
      }
    } catch (error) {
      console.error('Error obteniendo módulos:', error);
      setTotalModules(0);
      return 0;
    }
  };

  const loadStudentsData = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Primero obtener módulos del curso
      const moduleCount = await getCourseModules();
      
      console.log('🔍 Cargando estudiantes para el curso:', courseId);
      
      const response = await getStudentByCourseId(courseId);
      
      if (response && response.success && response.data) {
        const mappedStudents = response.data.map(student => {
          const modulesOwned = student.modules_covered || 0;
          
          // Calcular progreso basado en módulos reales del curso
          const progressPercentage = moduleCount > 0 
            ? Math.round((modulesOwned / moduleCount) * 100)
            : 0;
          
          return {
            id: student.id || student.user_id,
            name: student.name || `${student.first_name || ''} ${student.last_name || ''}`.trim(),
            email: student.email,
            identification_number: student.identification_number || student.dni || 'N/A',
            enrollment_date: student.enrollment_date || student.created_at,
            course_name: student.course_name || 'Curso actual',
            progress: progressPercentage,
            last_activity: student.last_activity || new Date().toISOString(),
            completed_lessons: modulesOwned,
            total_lessons: moduleCount,
            status: student.status || 'active'
          };
        });
        
        setStudents(mappedStudents);
        console.log('✅ Estudiantes cargados con progreso real:', mappedStudents);
      } else {
        setStudents([]);
        setError('No hay estudiantes inscritos en este curso aún.');
      }
    } catch (error) {
      console.error('❌ Error cargando estudiantes:', error);
      
      let errorMessage = 'Error al cargar los estudiantes del curso';
      
      if (error.response?.status === 400) {
        errorMessage = 'Error 400: El servidor no pudo procesar la petición.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Error 404: No se encontraron estudiantes para este curso.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Error 500: Error interno del servidor.';
      } else if (error.message === 'Network Error') {
        errorMessage = 'Error de conexión: No se pudo conectar con el servidor.';
      }
      
      setError(`${errorMessage}: ${error.response?.data?.message || error.message}`);
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.identification_number.includes(searchTerm);
    return matchesSearch;
  });

  const getProgressColor = (progress) => {
    if (progress >= 80) return '#4CAF50';
    if (progress >= 60) return '#FF9800';
    if (progress >= 40) return '#FFC107';
    return '#f44336';
  };

  const getStatusBadge = (status) => {
    return status === 'active' ? 
      <span className="status-badge active">Activo</span> :
      <span className="status-badge inactive">Inactivo</span>;
  };

  const handleSendMessage = (student) => {
    navigate(`/profesores/mensajes?student=${student.id}`);
  };

  const handleViewProgress = (student) => {
    setSelectedStudent(student);
    setShowStudentDetails(true);
  };

  if (isLoading) {
    return (
      <div className="students-management loading">
        <div className="loading-spinner">Cargando estudiantes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="students-management">
        <header className="page-header">
          <BackLink 
            title="Volver"
            onClick={() => navigate(-1)}
          />
          <h1>Gestión de Estudiantes</h1>
        </header>
        <div className="error-message">
          <h3>Error</h3>
          <p>{error}</p>
          <button 
            className="btn-primary"
            onClick={loadStudentsData}
          >
            Reintentar
          </button>
          
          <details style={{ marginTop: '1rem', textAlign: 'left' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>Información técnica</summary>
            <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
              <p><strong>Curso ID:</strong> {courseId}</p>
              <p><strong>Módulos detectados:</strong> {totalModules}</p>
              <p><strong>Estudiantes encontrados:</strong> {students.length}</p>
            </div>
          </details>
        </div>
      </div>
    );
  }

  return (
    <div className="students-management">
      <header className="page-header">
        <BackLink 
          title="Volver"
          onClick={() => navigate(-1)}
        />
        <h1>Gestión de Estudiantes</h1>
      </header>

      <div className="students-container">
        {/* Filtros y búsqueda */}
        <div className="filters-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="Buscar por nombre, email o identificación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="stats-section">
          <div className="stat-item">
            <span className="stat-number">{filteredStudents.length}</span>
            <span className="stat-label">Estudiantes Totales</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">
              {filteredStudents.filter(s => s.status === 'active').length}
            </span>
            <span className="stat-label">Activos</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">
              {Math.round(filteredStudents.reduce((acc, s) => acc + s.progress, 0) / filteredStudents.length) || 0}%
            </span>
            <span className="stat-label">Progreso Promedio</span>
          </div>
        </div>

        {/* Lista de estudiantes usando el nuevo componente */}
        <div className="students-list">
          {filteredStudents.length === 0 ? (
            <div className="no-students">
              <h3>No se encontraron estudiantes</h3>
              <p>Intenta ajustar los filtros de búsqueda</p>
            </div>
          ) : (
            filteredStudents.map(student => (
              <CardModuleTeacher
                key={student.id}
                student={student}
                onViewProgress={handleViewProgress}
                onSendMessage={handleSendMessage}
                getProgressColor={getProgressColor}
                getStatusBadge={getStatusBadge}
              />
            ))
          )}
        </div>
      </div>

      {/* Modal de detalles del estudiante */}
      {showStudentDetails && selectedStudent && (
        <div className="modal-overlay">
          <div className="modal student-details-modal">
            <div className="modal-header">
              <h3>Progreso de {selectedStudent.name}</h3>
              <button 
                className="close-btn"
                onClick={() => setShowStudentDetails(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="student-overview">
                <div className="overview-stat">
                  <span className="stat-label">Progreso General</span>
                  <div className="large-progress">
                    <div className="large-progress-circle">
                      <span className="progress-percentage">{selectedStudent.progress}%</span>
                    </div>
                  </div>
                </div>
                
                <div className="overview-details">
                  <div className="detail-item">
                    <span className="detail-label">Curso:</span>
                    <span className="detail-value">{selectedStudent.course_name}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Módulos completados:</span>
                    <span className="detail-value">
                      {selectedStudent.completed_lessons} de {selectedStudent.total_lessons}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Fecha de inscripción:</span>
                    <span className="detail-value">
                      {new Date(selectedStudent.enrollment_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Última actividad:</span>
                    <span className="detail-value">
                      {new Date(selectedStudent.last_activity).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="lessons-progress">
                <h4>Progreso por Módulos</h4>
                <div className="lessons-grid">
                  {Array.from({ length: selectedStudent.total_lessons }, (_, index) => (
                    <div 
                      key={index}
                      className={`lesson-status ${index < selectedStudent.completed_lessons ? 'completed' : 'pending'}`}
                    >
                      <span className="lesson-number">{index + 1}</span>
                      <span className="lesson-status-icon">
                        {index < selectedStudent.completed_lessons ? '✅' : '⏳'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn-primary"
                onClick={() => handleSendMessage(selectedStudent)}
              >
                💬 Enviar Mensaje
              </button>
              <button 
                className="btn-secondary"
                onClick={() => setShowStudentDetails(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsManagement;