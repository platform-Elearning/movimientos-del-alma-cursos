import React, { useState, useEffect } from 'react';
import { getLessonsByCourseAndModule } from '../../../../api/cursos';
import { useParams } from 'react-router-dom';
import './tablaLessons.css';

const TablaLessons = () => {
  const [lessons, setLessons] = useState([]);
  const { cursoId, moduleId } = useParams();

  useEffect(() => {
    const getLessons = async () => {
      const response = await getLessonsByCourseAndModule(cursoId, moduleId );
      if (response.success) {
        setLessons(response.data);
      }
    };
    getLessons();
  }, []);

  return (
    <div className="admin-lessons-container">
      <h2 className="admin-lessons-title">Lista de Clases</h2>
      <table className="admin-lessons-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Título</th>
            <th>Descripción</th>
            <th>Enlace</th>
          </tr>
        </thead>
        <tbody>
          {lessons.map((lesson) => (
            <tr key={lesson.id}>
              <td>{lesson.lesson_number}</td>
              <td>{lesson.title}</td>
              <td>{lesson.description}</td>
              <td>
                <a href={lesson.url} target="_blank" rel="noopener noreferrer" className="admin-lessons-link">
                  Ver clase
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TablaLessons;
