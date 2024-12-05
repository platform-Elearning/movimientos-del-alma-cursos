import React, { useEffect, useState } from "react";
import "./tableAlumnos.css"; // Archivo CSS para estilizar la tabla
//import { getAlumnos } from "../../../api/alumnos"; // Asegúrate de que esta función sea correcta

const AlumnosTable = () => {
  //const [alumnos, setAlumnos] = useState([]);
  //const [error, setError] = useState("");

  /*
  // Función para traer los alumnos desde la API
  const fetchAlumnos = async () => {
    try {
      const response = await getAlumnos(); // Llamada a la API
      setAlumnos(response.data); // Ajusta esto según el formato de tu respuesta
    } catch (err) {
      setError("Error al cargar los alumnos");
    }
  };

  useEffect(() => {
    fetchAlumnos(); // Llama a la función al montar el componente
  }, []);
*/
    const alumnos = [
        {
            user_id: 1,
            email: "alumno1@example.com",
            name: "Juan",
            last_name: "Pérez",
            nationality: "argentina",
            cursos: [
                { curso: "Curso 1", modulos: 5 },
                { curso: "Curso 3", modulos: 2 }
            ]
        },
        {
            user_id: 2,
            email: "alumno2@example.com",
            name: "María",
            last_name: "Gómez",
            nationality: "mexicana",
            cursos: [
                { curso: "Curso 2", modulos: 3 }
            ]
        }
    ];

        
    const handleEdit = (id) => {
    console.log(`Editar alumno con ID: ${id}`);
    };
        
    return (
        <div className="alumnos-table-container">
            <table className="alumnos-table">
                <thead>
                    <tr>
                            <th>ID</th>
                            <th>Email</th>
                            <th>Nombre</th>
                            <th>Apellido</th>
                            <th>Nacionalidad</th>
                            <th>Cursos</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {alumnos.map((alumno) => (
                            <tr key={alumno.user_id}>
                                <td>{alumno.user_id}</td>
                                <td>{alumno.email}</td>
                                <td>{alumno.name}</td>
                                <td>{alumno.last_name}</td>
                                <td>{alumno.nationality}</td>
                                <td>
                                    <ul>
                                        {alumno.cursos.map((curso, index) => (
                                            <li key={index}>
                                                <strong>{curso.curso}</strong> - {curso.modulos} módulos
                                            </li>
                                        ))}
                                    </ul>
                                </td>
                                <td>
                                    <button
                                        className="edit-button"
                                        onClick={() => handleEdit(alumno.user_id)}
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
        