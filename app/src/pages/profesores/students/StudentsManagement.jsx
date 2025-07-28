import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AuthUtils from '../../../utils/authUtils';
import { getStudentByCourseId } from '../../../api/profesores';
import './StudentsManagement.css';

const StudentsManagement = () => {
  const { courseId } = useParams(); // Obtener courseId de la URL
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showStudentDetails, setShowStudentDetails] = useState(false);
  const [error, setError] = useState('');
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

  const loadStudentsData = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      console.log('🔍 Cargando estudiantes para el curso:', courseId);
      console.log('🔍 Tipo de courseId:', typeof courseId);
      console.log('🔍 URL que se va a llamar:', `/users/getStudentsByCourseId?course_id=${courseId}`);
      
      // Llamar a la API real para obtener estudiantes del curso
      const response = await getStudentByCourseId(courseId);
      
      console.log('📋 Respuesta completa de la API:', response);
      
      if (response && response.success && response.data) {
        // Mapear los datos de la API al formato esperado por el componente
        const mappedStudents = response.data.map(student => ({
          id: student.id || student.user_id,
          name: student.name || `${student.first_name || ''} ${student.last_name || ''}`.trim(),
          email: student.email,
          identification_number: student.identification_number || student.dni || 'N/A',
          enrollment_date: student.enrollment_date || student.created_at,
          course_name: student.course_name || 'Curso actual',
          // Por ahora usamos valores por defecto para el progreso hasta que tengamos la API
          progress: student.progress || Math.floor(Math.random() * 100), // Temporal
          last_activity: student.last_activity || new Date().toISOString(),
          completed_lessons: student.completed_lessons || Math.floor(Math.random() * 20),
          total_lessons: student.total_lessons || 20,
          status: student.status || 'active'
        }));
        
        setStudents(mappedStudents);
        console.log('✅ Estudiantes cargados:', mappedStudents);
      } else {
        setStudents([]);
        console.log('⚠️ No se encontraron estudiantes para este curso');
        console.log('📋 Respuesta recibida:', response);
        
        // Si no hay estudiantes, mostrar mensaje informativo
        setError('No hay estudiantes inscritos en este curso aún.');
      }
    } catch (error) {
      console.error('❌ Error cargando estudiantes:', error);
      console.error('❌ Error details:', error.response?.data || error.message);
      
      // Mejorar el mensaje de error para diferentes casos
      let errorMessage = 'Error al cargar los estudiantes del curso';
      
      if (error.response?.status === 400) {
        errorMessage = 'Error 400: El servidor no pudo procesar la petición. Contacta al administrador para verificar la configuración del curso.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Error 404: No se encontró el endpoint para obtener estudiantes. Contacta al administrador técnico.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Error 500: Error interno del servidor. Contacta al administrador técnico.';
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
          <button 
            className="back-btn"
            onClick={() => navigate(-1)}
          >
            ← Volver
          </button>
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
          
          {/* Información adicional para debugging */}
          <details style={{ marginTop: '1rem', textAlign: 'left' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>Información técnica</summary>
            <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
              <p><strong>Curso ID:</strong> {courseId}</p>
              <p><strong>URL esperada:</strong> /users/getStudentsByCourseId?course_id={courseId}</p>
              <p><strong>¿El curso existe?</strong> Verificar en el panel de administración</p>
              <p><strong>¿Hay estudiantes inscritos?</strong> Verificar las inscripciones</p>
            </div>
          </details>
        </div>
      </div>
    );
  }

  return (
    <div className="students-management">
      <header className="page-header">
        <button 
          className="back-btn"
          onClick={() => navigate(-1)} // Volver a la página anterior
        >
          ← Volver
        </button>
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

        {/* Lista de estudiantes */}
        <div className="students-list">
          {filteredStudents.length === 0 ? (
            <div className="no-students">
              <h3>No se encontraron estudiantes</h3>
              <p>Intenta ajustar los filtros de búsqueda</p>
            </div>
          ) : (
            filteredStudents.map(student => (
              <div key={student.id} className="student-card">
                <div className="student-avatar">
                  <img 
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=4CAF50&color=fff&size=60`}
                    alt={student.name}
                  />
                </div>
                
                <div className="student-info">
                  <div className="student-main-info">
                    <h3>{student.name}</h3>
                    <p className="student-email">{student.email}</p>
                    <p className="student-id">ID: {student.identification_number}</p>
                  </div>
                  
                  <div className="student-course-info">
                    <p className="course-name">{student.course_name}</p>
                    <p className="enrollment-date">
                      Inscrito: {new Date(student.enrollment_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="student-progress">
                  <div className="progress-info">
                    <span className="progress-text">{student.progress}% completado</span>
                    <span className="lessons-info">
                      {student.completed_lessons}/{student.total_lessons} lecciones
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{
                        width: `${student.progress}%`,
                        backgroundColor: getProgressColor(student.progress)
                      }}
                    />
                  </div>
                  <p className="last-activity">
                    Última actividad: {new Date(student.last_activity).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="student-status">
                  {getStatusBadge(student.status)}
                </div>
                
                <div className="student-actions">
                  <button 
                    className="btn-primary"
                    onClick={() => handleViewProgress(student)}
                    title="Ver progreso detallado"
                  >
                    📊 Progreso
                  </button>
                  <button 
                    className="btn-secondary"
                    onClick={() => handleSendMessage(student)}
                    title="Enviar mensaje"
                  >
                    💬 Mensaje
                  </button>
                </div>
              </div>
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
                    <span className="detail-label">Lecciones completadas:</span>
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
              
              {/* Aquí puedes agregar más detalles como historial de lecciones */}
              <div className="lessons-progress">
                <h4>Progreso por Lecciones</h4>
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
