import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthUtils from '../../../utils/authUtils';
import './LibraryManagement.css';

const LibraryManagement = () => {
  const [files, setFiles] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    course_id: '',
    category: 'general',
    file: null
  });
  const [dragOver, setDragOver] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!AuthUtils.checkAndCleanExpiredToken()) {
      navigate('/login');
      return;
    }
    loadLibraryData();
  }, [navigate]);

  const loadLibraryData = async () => {
    try {
      setIsLoading(true);
      
      // Mock data - conectarás con tu API
      setTimeout(() => {
        setCourses([
          { id: 1, name: 'Danza Contemporánea Básica' },
          { id: 2, name: 'Ballet Clásico' },
          { id: 3, name: 'Jazz Dance' }
        ]);
        
        setFiles([
          {
            id: 1,
            title: 'Manual de Técnicas Básicas',
            description: 'Guía completa de posiciones y movimientos fundamentales',
            filename: 'manual_tecnicas_basicas.pdf',
            size: '2.4 MB',
            course_id: 1,
            course_name: 'Danza Contemporánea Básica',
            category: 'manual',
            upload_date: '2024-07-01',
            downloads: 15,
            shared_with_students: true
          },
          {
            id: 2,
            title: 'Ejercicios de Calentamiento',
            description: 'Rutinas de calentamiento recomendadas antes de cada clase',
            filename: 'calentamiento_rutinas.pdf',
            size: '1.8 MB',
            course_id: 1,
            course_name: 'Danza Contemporánea Básica',
            category: 'exercise',
            upload_date: '2024-06-28',
            downloads: 22,
            shared_with_students: true
          },
          {
            id: 3,
            title: 'Historia del Ballet',
            description: 'Evolución histórica del ballet clásico',
            filename: 'historia_ballet.pdf',
            size: '5.2 MB',
            course_id: 2,
            course_name: 'Ballet Clásico',
            category: 'theory',
            upload_date: '2024-06-25',
            downloads: 8,
            shared_with_students: false
          },
          {
            id: 4,
            title: 'Partituras de Jazz',
            description: 'Colección de partituras para clases de jazz',
            filename: 'partituras_jazz.pdf',
            size: '3.1 MB',
            course_id: 3,
            course_name: 'Jazz Dance',
            category: 'music',
            upload_date: '2024-06-20',
            downloads: 12,
            shared_with_students: true
          }
        ]);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error cargando biblioteca:', error);
      setIsLoading(false);
    }
  };

  const filteredFiles = files.filter(file => {
    return selectedCourse === 'all' || file.course_id === parseInt(selectedCourse);
  });

  const getCategoryIcon = (category) => {
    const icons = {
      general: '📄',
      manual: '📚',
      exercise: '🏃‍♀️',
      theory: '🎓',
      music: '🎵',
      video: '🎥'
    };
    return icons[category] || '📄';
  };

  const getCategoryName = (category) => {
    const names = {
      general: 'General',
      manual: 'Manual',
      exercise: 'Ejercicios',
      theory: 'Teoría',
      music: 'Música',
      video: 'Video'
    };
    return names[category] || 'General';
  };

  const handleFileUpload = async () => {
    try {
      if (!uploadData.file || !uploadData.title.trim()) {
        alert('Por favor completa todos los campos requeridos');
        return;
      }

      // Aquí conectarás con tu API para subir el archivo
      const newFile = {
        id: Date.now(),
        title: uploadData.title,
        description: uploadData.description,
        filename: uploadData.file.name,
        size: `${(uploadData.file.size / 1024 / 1024).toFixed(1)} MB`,
        course_id: parseInt(uploadData.course_id) || null,
        course_name: courses.find(c => c.id === parseInt(uploadData.course_id))?.name || 'General',
        category: uploadData.category,
        upload_date: new Date().toISOString().split('T')[0],
        downloads: 0,
        shared_with_students: false
      };

      setFiles(prev => [newFile, ...prev]);
      setUploadData({
        title: '',
        description: '',
        course_id: '',
        category: 'general',
        file: null
      });
      setShowUploadModal(false);
      alert('Archivo subido exitosamente');
    } catch (error) {
      console.error('Error subiendo archivo:', error);
      alert('Error al subir el archivo');
    }
  };

  const handleFileDelete = async (fileId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este archivo?')) return;
    
    try {
      setFiles(prev => prev.filter(file => file.id !== fileId));
      alert('Archivo eliminado exitosamente');
    } catch (error) {
      console.error('Error eliminando archivo:', error);
      alert('Error al eliminar el archivo');
    }
  };

  const toggleShareWithStudents = async (fileId) => {
    try {
      setFiles(prev => prev.map(file => 
        file.id === fileId 
          ? { ...file, shared_with_students: !file.shared_with_students }
          : file
      ));
    } catch (error) {
      console.error('Error cambiando estado de compartir:', error);
      alert('Error al cambiar el estado de compartir');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    const pdfFile = droppedFiles.find(file => file.type === 'application/pdf');
    
    if (pdfFile) {
      setUploadData(prev => ({ ...prev, file: pdfFile }));
      setShowUploadModal(true);
    } else {
      alert('Solo se permiten archivos PDF');
    }
  };

  if (isLoading) {
    return (
      <div className="library-management loading">
        <div className="loading-spinner">Cargando biblioteca...</div>
      </div>
    );
  }

  return (
    <div className="library-management">
      <header className="page-header">
        <button 
          className="back-btn"
          onClick={() => navigate('/profesores/dashboard')}
        >
          ← Volver al Dashboard
        </button>
        <h1>Biblioteca de Archivos</h1>
      </header>

      <div className="library-container">
        {/* Controles superiores */}
        <div className="library-controls">
          <div className="course-filter">
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="course-select"
            >
              <option value="all">Todos los cursos</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>
          
          <button 
            className="btn-primary"
            onClick={() => setShowUploadModal(true)}
          >
            📤 Subir Archivo
          </button>
        </div>

        {/* Zona de arrastrar y soltar */}
        <div 
          className={`drop-zone ${dragOver ? 'drag-over' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => setShowUploadModal(true)}
        >
          <div className="drop-zone-content">
            <span className="drop-icon">📁</span>
            <p>Arrastra archivos PDF aquí o haz clic para subir</p>
            <span className="drop-hint">Solo archivos PDF permitidos</span>
          </div>
        </div>

        {/* Lista de archivos */}
        <div className="files-section">
          <h2>Archivos ({filteredFiles.length})</h2>
          
          {filteredFiles.length === 0 ? (
            <div className="no-files">
              <h3>No hay archivos en la biblioteca</h3>
              <p>Sube tu primer archivo para comenzar</p>
            </div>
          ) : (
            <div className="files-grid">
              {filteredFiles.map(file => (
                <div key={file.id} className="file-card">
                  <div className="file-header">
                    <div className="file-icon">
                      {getCategoryIcon(file.category)}
                    </div>
                    <div className="file-actions">
                      <button
                        className={`share-btn ${file.shared_with_students ? 'shared' : 'not-shared'}`}
                        onClick={() => toggleShareWithStudents(file.id)}
                        title={file.shared_with_students ? 'Compartido con estudiantes' : 'No compartido'}
                      >
                        {file.shared_with_students ? '👥' : '🔒'}
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleFileDelete(file.id)}
                        title="Eliminar archivo"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  
                  <div className="file-content">
                    <h3>{file.title}</h3>
                    <p className="file-description">{file.description}</p>
                    
                    <div className="file-meta">
                      <span className="file-size">📁 {file.size}</span>
                      <span className="file-category">
                        {getCategoryName(file.category)}
                      </span>
                      <span className="file-course">{file.course_name}</span>
                    </div>
                    
                    <div className="file-stats">
                      <span className="upload-date">
                        📅 {new Date(file.upload_date).toLocaleDateString()}
                      </span>
                      <span className="download-count">
                        ⬇️ {file.downloads} descargas
                      </span>
                    </div>
                  </div>
                  
                  <div className="file-footer">
                    <button className="btn-download">
                      ⬇️ Descargar
                    </button>
                    <button className="btn-preview">
                      👁️ Vista previa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de subida */}
      {showUploadModal && (
        <div className="modal-overlay">
          <div className="modal upload-modal">
            <div className="modal-header">
              <h3>Subir Nuevo Archivo</h3>
              <button 
                className="close-btn"
                onClick={() => setShowUploadModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Título del Archivo *</label>
                <input
                  type="text"
                  value={uploadData.title}
                  onChange={(e) => setUploadData({...uploadData, title: e.target.value})}
                  placeholder="Ej: Manual de Técnicas Básicas"
                />
              </div>
              
              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  value={uploadData.description}
                  onChange={(e) => setUploadData({...uploadData, description: e.target.value})}
                  placeholder="Describe el contenido del archivo..."
                  rows="3"
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Curso</label>
                  <select
                    value={uploadData.course_id}
                    onChange={(e) => setUploadData({...uploadData, course_id: e.target.value})}
                  >
                    <option value="">General (sin curso específico)</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>
                        {course.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Categoría</label>
                  <select
                    value={uploadData.category}
                    onChange={(e) => setUploadData({...uploadData, category: e.target.value})}
                  >
                    <option value="general">📄 General</option>
                    <option value="manual">📚 Manual</option>
                    <option value="exercise">🏃‍♀️ Ejercicios</option>
                    <option value="theory">🎓 Teoría</option>
                    <option value="music">🎵 Música</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label>Archivo PDF *</label>
                <div className="file-input-wrapper">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setUploadData({...uploadData, file: e.target.files[0]})}
                    className="file-input"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="file-input-label">
                    {uploadData.file ? uploadData.file.name : 'Seleccionar archivo PDF'}
                  </label>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setShowUploadModal(false)}
              >
                Cancelar
              </button>
              <button 
                className="btn-primary"
                onClick={handleFileUpload}
                disabled={!uploadData.file || !uploadData.title.trim()}
              >
                Subir Archivo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LibraryManagement;
