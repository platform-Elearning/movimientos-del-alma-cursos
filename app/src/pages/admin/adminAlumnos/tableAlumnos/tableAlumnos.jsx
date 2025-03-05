import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getAlumnos } from "../../../../api/alumnos"; // Importa la función para traer los alumnos desde la API
import "./tableAlumnos.css";

const AlumnosTable = () => {
  const navigate = useNavigate();
  const [alumnos, setAlumnos] = useState([]);
  const [error, setError] = useState("");
  const location = useLocation();

  // Función para traer los alumnos desde la API
  const fetchAlumnos = async () => {
    try {
      const response = await getAlumnos(); // Llamada a la API
      console.log("Respuesta de la API:", response); // Verifica la respuesta de la API
      if (response && response.response && Array.isArray(response.response)) {
        setAlumnos(response.response); // Ajusta esto según el formato de tu respuesta
      } else {
        throw new Error("La respuesta de la API no es un array");
      }
    } catch (err) {
      console.error("Error al cargar los alumnos:", err);
      setError("Error al cargar los alumnos");
    }
  };

  useEffect(() => {
    fetchAlumnos(); // Llama a la función al montar el componente
  }, []);



  const handleEdit = (alumno) => {
    navigate(`/admin/editarAlumno/${alumno.user_id}`, {
      state: { user: alumno },
    }); // Redirige a la página de edición del alumno con el estado
    console.log(`Editar alumno con ID: ${alumno.user_id}`);
  };

  return (
    <div className="alumnos-table-container">
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
              <td>{alumno.user_id}</td>
              <td>{alumno.dni}</td>
              <td>{alumno.name}</td>
              <td>{alumno.last_name}</td>
              <td>{alumno.email}</td>
              <td>{alumno.nationality}</td>
              <td>
                {alumno.courses && alumno.courses.length > 0 ? (
                  <ul>
                    {alumno.courses.map((course, index) => (
                      <li key={index}>{course.course}</li>
                    ))}
                  </ul>
                ) : (
                  "N/A"
                )}
              </td>
              <td>
                {alumno.courses && alumno.courses.length > 0 ? (
                  <ul>
                    {alumno.courses.map((course, index) => (
                      <li key={index}>{course.modules}</li>
                    ))}
                  </ul>
                ) : (
                  "N/A"
                )}
              </td>
              <td>
                <button onClick={() => handleEdit(alumno)}>Editar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AlumnosTable;
