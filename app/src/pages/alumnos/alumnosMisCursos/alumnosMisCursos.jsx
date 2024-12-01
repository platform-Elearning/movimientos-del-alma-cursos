import "./alumnosMisCursos.css";
import { getCursos } from "../../../api/cursos";
import { useState, useEffect } from "react";


const AlumnosMisCursos = () => {

  useEffect(() => {
    // Función para obtener los productos
    const getCursosData = async () => {
      try {
        const cursosData = await getCursos();
        setCursos(cursosData);
      } catch (error) {
        console.error(error);
      }
    }
    

    getCursosData();
  }, []);

  // Declaración del array de datos
  const data2 = [
    { id: 1, name: 'Juan', age: 25, profession: 'Ingeniero' },
    { id: 2, name: 'María', age: 30, profession: 'Doctora' },
    { id: 3, name: 'Carlos', age: 22, profession: 'Estudiante' },
  ];

  // Si planeas usar `useEffect` para algo dinámico, puedes agregar lógica aquí
  useEffect(() => {
    // Aquí podrías agregar lógica como obtener datos desde una API
    console.log("Efecto ejecutado: Datos de cursos disponibles");
  }, []);

  return (
    <div>
      <h3>Mis cursos</h3>
      <table border="1" style={{ width: '100%', textAlign: 'left' }}>
        <tbody>
          {data2.map((row) => ( // Aquí usamos "row" como variable de iteración
            <tr key={row.id}>
              <td>{row.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AlumnosMisCursos;


