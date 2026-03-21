import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getAlumnos } from "../../../../api/alumnos";
import "./tableAlumnos.css";

const AlumnosTable = () => {
  const navigate = useNavigate();
  const [alumnos, setAlumnos] = useState([]);
  const [error, setError] = useState("");
  const tableContainerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Función para traer los alumnos desde la API
  const fetchAlumnos = async (page = 1) => {
    try {
      setIsLoading(true);
      setError("");
      const response = await getAlumnos(page, 25);
      if (response && response.success && response.data && Array.isArray(response.data)) {
        setAlumnos(response.data);
        setPagination(response.pagination);
        setCurrentPage(page);
      } else {
        throw new Error("La respuesta de la API no es válida");
      }
    } catch (err) {
      setError("Error al cargar los alumnos");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlumnos(currentPage);
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination?.totalPages) {
      fetchAlumnos(newPage);
    }
  };

  const handleEdit = (alumno) => {
    navigate(`/admin/editarAlumno/${alumno.user_id}`, {
      state: { user: alumno },
    });
  };

  // 🖱️ Funciones para el desplazamiento con el mouse
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - tableContainerRef.current.offsetLeft);
    setScrollLeft(tableContainerRef.current.scrollLeft);
  };

  const handleMouseLeaveOrUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - tableContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Ajusta la sensibilidad del desplazamiento
    tableContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <div className="alumnos-table-wrapper">
      {error && <p className="error-message">{error}</p>}
      {isLoading && <p className="loading-message">Cargando alumnos...</p>}
      <div
        className="alumnos-table-container"
        ref={tableContainerRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeaveOrUp}
        onMouseUp={handleMouseLeaveOrUp}
        onMouseMove={handleMouseMove}
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
      >
        <table className="alumnos-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Número Identificador</th>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Email</th>
            <th>Nacionalidad</th>
            <th>Cursos</th>
            <th>Módulos</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {alumnos.map((alumno, index) => (
            <tr key={index}>
              <td data-label="ID">{alumno.user_id}</td>
              <td data-label="Número Identificador">{alumno.dni}</td>
              <td data-label="Nombre">{alumno.name}</td>
              <td data-label="Apellido">{alumno.last_name}</td>
              <td data-label="Email">{alumno.email}</td>
              <td data-label="Nacionalidad">{alumno.nationality}</td>
              <td data-label="Cursos">
                {alumno.courses?.length ? (
                  <ul>
                    {alumno.courses.map((course, i) => (
                      <li key={i}>{course.course}</li>
                    ))}
                  </ul>
                ) : (
                  "N/A"
                )}
              </td>
              <td data-label="Módulos">
                {alumno.courses?.length ? (
                  <ul>
                    {alumno.courses.map((course, i) => (
                      <li key={i}>{course.modules}</li>
                    ))}
                  </ul>
                ) : (
                  "N/A"
                )}
              </td>
              <td data-label="Acciones">
                <button
                  className="edit-button"
                  onClick={() => handleEdit(alumno)}
                >
                  Editar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    
    {pagination && (
      <div className="pagination-controls">
        <div className="pagination-info">
          <span>Mostrando {alumnos.length} de {pagination.totalStudents} alumnos</span>
          <span>Página {pagination.currentPage} de {pagination.totalPages}</span>
        </div>
        <div className="pagination-buttons">
          <button
            onClick={() => handlePageChange(1)}
            disabled={!pagination.hasPreviousPage || isLoading}
            className="pagination-btn"
          >
            ««
          </button>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={!pagination.hasPreviousPage || isLoading}
            className="pagination-btn"
          >
            ‹ Anterior
          </button>
          <span className="page-number">Página {currentPage}</span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!pagination.hasNextPage || isLoading}
            className="pagination-btn"
          >
            Siguiente ›
          </button>
          <button
            onClick={() => handlePageChange(pagination.totalPages)}
            disabled={!pagination.hasNextPage || isLoading}
            className="pagination-btn"
          >
            »»
          </button>
        </div>
      </div>
    )}
  </div>
  );
};

export default AlumnosTable;
