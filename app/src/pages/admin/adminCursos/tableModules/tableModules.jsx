import React, { useEffect, useState } from "react";
import "./tableModules.css";
import { getModulesByCourseID } from "../../../../api/cursos";
import { useParams } from "react-router-dom";

const ModulesTable = () => {
  const { cursoId } = useParams();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchModules = async () => {
    try {
      const response = await getModulesByCourseID(cursoId); 
      console.log(response);
      if (response && Array.isArray(response.message)) {
        setModules(response.message);
        setLoading(false);
      } else {
        throw new Error("La respuesta de la API no es un array válido");
      }
    } catch (err) {
      console.error("Error al cargar los cursos:", err);
      setError("Error al cargar los cursos");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, []);

  if (loading) return <p className="custom-modules-table__loading">Cargando módulos...</p>;
  if (error) return <p className="custom-modules-table__error">Error: {error}</p>;

  return (
    <div className="custom-modules-table">
      <h1 className="custom-modules-table__title">Lista de Módulos</h1>
      <table className="custom-modules-table__table">
        <thead className="custom-modules-table__thead">
          <tr className="custom-modules-table__header-row">
            <th className="custom-modules-table__header">ID</th>
            <th className="custom-modules-table__header">Número de Módulo</th>
            <th className="custom-modules-table__header">Nombre</th>
            <th className="custom-modules-table__header">Descripción</th>
          </tr>
        </thead>
        <tbody className="custom-modules-table__tbody">
          {modules.map((module) => (
            <tr key={module.id} className="custom-modules-table__row">
              <td className="custom-modules-table__cell">{module.id}</td>
              <td className="custom-modules-table__cell">{module.module_number}</td>
              <td className="custom-modules-table__cell">{module.name}</td>
              <td className="custom-modules-table__cell">{module.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ModulesTable;
