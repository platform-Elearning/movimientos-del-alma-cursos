import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { deleteCourse } from "../../../../api/cursos";
import CreateModule from "../createModule/agregarModulo";
import ModulesTable from "../tableModules/tableModules";
import "./editarCurso.css";

const EditarCurso = () => {
  const { cursoId } = useParams();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteCourse = async () => {
    const confirmDelete = window.confirm(
      "¿Está seguro que desea eliminar este curso?\n\nNOTA: Solo se puede eliminar si no tiene alumnos ni profesores asignados."
    );

    if (!confirmDelete) return;

    setIsDeleting(true);

    try {
      await deleteCourse(cursoId);
      alert("Curso eliminado exitosamente");
      navigate("/admin/cursos");
    } catch (error) {
      console.error("Error al eliminar curso:", error);
      
      if (error.response?.data?.errorMessage) {
        alert(`Error: ${error.response.data.errorMessage}`);
      } else if (error.message) {
        alert(`Error: ${error.message}`);
      } else {
        alert("Error al eliminar el curso. Verifique que no tenga alumnos ni profesores asignados.");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="editar-curso-page">
      <div className="course-actions-header">
        <button
          className="delete-course-btn"
          onClick={handleDeleteCourse}
          disabled={isDeleting}
        >
          {isDeleting ? "Eliminando..." : "🗑️ Eliminar Curso"}
        </button>
      </div>
      <CreateModule />
      <ModulesTable />
    </div>
  );
};

export default EditarCurso;
