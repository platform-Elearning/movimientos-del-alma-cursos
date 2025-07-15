import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./tableProfesor.css";
import { getProfesores } from "../../../../api/profesores";

const ProfesoresTable = () => {
  const navigate = useNavigate();
  const [profesores, setProfesores] = useState([]);
  const [error, setError] = useState("");
  const tableContainerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Función para traer los profesores desde la API
  const fetchProfesores = async () => {
    try {
      const response = await getProfesores();
      console.log("Respuesta de la API:", response);
      if (response && response.data && Array.isArray(response.data)) {
        setProfesores(response.data);
      } else {
        throw new Error("La respuesta de la API no es un array");
      }
    } catch (err) {
      console.error("Error al cargar los profesores:", err);
      setError("Error al cargar los profesores");
    }
  };

  useEffect(() => {
    fetchProfesores();
  }, []);

  const handleEdit = (profesor) => {
    navigate(`/admin/editarProfesor/${profesor.id}`, {
      state: { user: profesor },
    });
    console.log(`Editar profesor con ID: ${profesor.id}`);
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
      className="profesores-table-container"
      ref={tableContainerRef}
      onMouseDown={handleMouseDown}
      onMouseLeave={handleMouseLeaveOrUp}
      onMouseUp={handleMouseLeaveOrUp}
      onMouseMove={handleMouseMove}
      style={{ cursor: isDragging ? "grabbing" : "grab" }} // Cambio de cursor
    >
      {error && <p className="error-message">{error}</p>}
      <table className="profesores-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Número Identificador</th>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Email</th>
            <th>Curso Asignado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {profesores.map((profesor, index) => (
            <tr key={index}>
              <td data-label="ID">{profesor.id}</td>
              <td data-label="Número Identificador">
                {profesor.identification_number}
              </td>
              <td data-label="Nombre">{profesor.name}</td>
              <td data-label="Apellido">{profesor.lastname}</td>
              <td data-label="Email">{profesor.email}</td>
              <td data-label="Curso Asignado"></td>
              <td data-label="Acciones">
                <button
                  className="edit-button"
                  onClick={() => handleEdit(profesor)}
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

export default ProfesoresTable;
