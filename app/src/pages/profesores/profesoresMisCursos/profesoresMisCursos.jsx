import "./profesoresMisCursos.css";
import { getCursos } from "../../../api/cursos";
import { useState, useEffect } from "react";


const ProfesoresMisCursos = () => {

    const [cursos, setCursos] = useState([]);

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

    return (
        <div>
            <h1>misCursos</h1>
            <div>
                {cursos.map((curso) => (
                    <div key={curso.id}>
                        <h2>{curso.nombre}</h2>
                        <p>{curso.descripcion}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default ProfesoresMisCursos;