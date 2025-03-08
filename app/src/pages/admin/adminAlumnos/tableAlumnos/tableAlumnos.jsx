import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getAlumnos } from "../../../../api/alumnos";
import "./tableAlumnos.css";

const AlumnosTable = () => {
  const navigate = useNavigate();
  const [alumnos, setAlumnos] = useState([]);
  const [error, setError] = useState("");
  const location = useLocation();
  const tableContainerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Función para traer los alumnos desde la API
  const fetchAlumnos = async () => {
    try {
      const response = await getAlumnos();
      console.log("Respuesta de la API:", response);
      if (response && response.response && Array.isArray(response.response)) {
        setAlumnos(response.response);
      } else {
        throw new Error("La respuesta de la API no es un array");
      }
    } catch (err) {
      console.error("Error al cargar los alumnos:", err);
      setError("Error al cargar los alumnos");
    }
  };

  useEffect(() => {
    fetchAlumnos();
  }, []);

  const handleEdit = (alumno) => {
    navigate(`/admin/editarAlumno/${alumno.user_id}`, {
      state: { user: alumno },
    });
    console.log(`Editar alumno con ID: ${alumno.user_id}`);
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
    <div
      className="alumnos-table-container"
      ref={tableContainerRef}
      onMouseDown={handleMouseDown}
      onMouseLeave={handleMouseLeaveOrUp}
      onMouseUp={handleMouseLeaveOrUp}
      onMouseMove={handleMouseMove}
      style={{ cursor: isDragging ? "grabbing" : "grab" }} // Cambio de cursor
    >
      {error && <p className="error-message">{error}</p>}
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
  );
};

export default AlumnosTable;
