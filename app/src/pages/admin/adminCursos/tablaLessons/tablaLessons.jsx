import React, { useState, useEffect, useCallback } from 'react';
import {
  getLessonsByModuleIdAndCourseId,
  updateLesson,
  deleteLesson,
  getImpactoClase,
} from '../../../../api/cursos';
import { useParams } from 'react-router-dom';
import ConfirmarBorrado from '../../../../components/confirmarBorrado/ConfirmarBorrado';
import { lineasDeImpactoClase } from '../../../../utils/cursos';
import { mensajeDeError } from '../../../../utils/errores';
import './tablaLessons.css';
import '../accionesFila.css';

/**
 * Clases de un módulo: ver, editar y eliminar.
 *
 * `version` lo manda quien crea una clase nueva, para que la tabla se recargue
 * sola. Antes se creaba la clase y la lista seguía igual hasta refrescar.
 */
const TablaLessons = ({ version = 0 }) => {
  const [lessons, setLessons] = useState([]);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const { cursoId, moduleId } = useParams();

  const [editando, setEditando] = useState(null);
  const [borrador, setBorrador] = useState({ lesson_number: '', title: '', description: '', url: '' });
  const [guardando, setGuardando] = useState(false);
  const [errorFila, setErrorFila] = useState('');

  const [aBorrar, setABorrar] = useState(null);
  const [impacto, setImpacto] = useState(null);
  const [cargandoImpacto, setCargandoImpacto] = useState(false);
  const [borrando, setBorrando] = useState(false);
  const [errorBorrado, setErrorBorrado] = useState('');

  const cargar = useCallback(async () => {
    try {
      const response = await getLessonsByModuleIdAndCourseId(cursoId, moduleId);
      if (response.success) {
        setLessons([...response.data].sort((a, b) => a.lesson_number - b.lesson_number));
        setError('');
      }
    } catch (err) {
      // Un módulo sin clases todavía no es un error: la API lo informa como 500.
      if (err?.response) setLessons([]);
      else setError('No se pudieron cargar las clases. Revisá tu conexión.');
    }
  }, [cursoId, moduleId]);

  useEffect(() => {
    cargar();
  }, [cargar, version]);

  const empezarEdicion = (l) => {
    setEditando(l.id);
    setBorrador({
      lesson_number: String(l.lesson_number),
      title: l.title,
      description: l.description,
      url: l.url,
    });
    setErrorFila('');
    setAviso('');
  };

  const cambiar = (e) => setBorrador((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const guardar = async () => {
    if (!borrador.title.trim() || !borrador.description.trim() || !borrador.url.trim()) {
      setErrorFila('El título, la descripción y el enlace son obligatorios.');
      return;
    }
    setGuardando(true);
    setErrorFila('');
    try {
      await updateLesson(editando, borrador);
      setEditando(null);
      setAviso('Clase actualizada.');
      await cargar();
    } catch (err) {
      setErrorFila(mensajeDeError(err, 'guardar la clase'));
    } finally {
      setGuardando(false);
    }
  };

  const pedirBorrado = async (l) => {
    setABorrar(l);
    setImpacto(null);
    setErrorBorrado('');
    setAviso('');
    setCargandoImpacto(true);
    try {
      setImpacto(await getImpactoClase(l.id));
    } catch (err) {
      setErrorBorrado(mensajeDeError(err, 'calcular qué se pierde'));
    } finally {
      setCargandoImpacto(false);
    }
  };

  const cerrarBorrado = () => {
    if (borrando) return;
    setABorrar(null);
    setImpacto(null);
    setErrorBorrado('');
  };

  const confirmarBorrado = async () => {
    setBorrando(true);
    setErrorBorrado('');
    try {
      await deleteLesson(aBorrar.id);
      setAviso(`Se eliminó la clase "${aBorrar.title}".`);
      setABorrar(null);
      setImpacto(null);
      await cargar();
    } catch (err) {
      setErrorBorrado(mensajeDeError(err, 'borrar la clase'));
    } finally {
      setBorrando(false);
    }
  };

  const lineas = impacto ? lineasDeImpactoClase(impacto) : [];

  return (
    <div className="admin-lessons-container">
      <h2 className="admin-lessons-title">Lista de Clases</h2>

      {error && (
        <p className="af-error" role="alert">
          {error}
        </p>
      )}
      {aviso && (
        <p className="af-aviso" role="status">
          {aviso}
        </p>
      )}

      <table className="admin-lessons-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Título</th>
            <th>Descripción</th>
            <th>Enlace</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {lessons.map((lesson) =>
            editando === lesson.id ? (
              <tr key={lesson.id}>
                <td>
                  <input
                    className="af-input af-input-numero"
                    name="lesson_number"
                    type="number"
                    min="1"
                    value={borrador.lesson_number}
                    onChange={cambiar}
                    aria-label="Número de clase"
                  />
                </td>
                <td>
                  <input className="af-input" name="title" value={borrador.title} onChange={cambiar} aria-label="Título de la clase" />
                </td>
                <td>
                  <textarea className="af-input" name="description" value={borrador.description} onChange={cambiar} aria-label="Descripción de la clase" />
                </td>
                <td>
                  <input className="af-input" name="url" value={borrador.url} onChange={cambiar} aria-label="Enlace de la clase" placeholder="https://..." />
                  <p className="af-nota">Tiene que empezar con http:// o https://</p>
                  {errorFila && (
                    <p className="af-error" role="alert">
                      {errorFila}
                    </p>
                  )}
                </td>
                <td>
                  <div className="af-acciones">
                    <button type="button" className="af-boton af-guardar" onClick={guardar} disabled={guardando}>
                      {guardando ? 'Guardando…' : 'Guardar'}
                    </button>
                    <button type="button" className="af-boton" onClick={() => setEditando(null)} disabled={guardando}>
                      Cancelar
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              <tr key={lesson.id}>
                <td>{lesson.lesson_number}</td>
                <td>{lesson.title}</td>
                <td>{lesson.description}</td>
                <td>
                  <a href={lesson.url} target="_blank" rel="noopener noreferrer" className="admin-lessons-link">
                    Ver clase
                  </a>
                </td>
                <td>
                  <div className="af-acciones">
                    <button type="button" className="af-boton af-editar" onClick={() => empezarEdicion(lesson)}>
                      Editar
                    </button>
                    <button type="button" className="af-boton af-borrar" onClick={() => pedirBorrado(lesson)}>
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
      {lessons.length === 0 && !error && <p className="af-vacio">Este módulo todavía no tiene clases.</p>}

      {aBorrar && (
        <ConfirmarBorrado
          titulo={`Eliminar la clase ${aBorrar.lesson_number}: "${aBorrar.title}"`}
          cargando={cargandoImpacto}
          enProceso={borrando}
          error={errorBorrado}
          bloqueado={!cargandoImpacto && !impacto}
          textoConfirmar="Sí, eliminar clase"
          onConfirmar={confirmarBorrado}
          onCancelar={cerrarBorrado}
        >
          {lineas.length ? (
            <ul>
              {lineas.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          ) : (
            <p>Esta clase no tiene comentarios.</p>
          )}
          <p>
            Si solo hay que corregir el título o el enlace, usá <strong>Editar</strong>: no pierde nada.
          </p>
        </ConfirmarBorrado>
      )}
    </div>
  );
};

export default TablaLessons;
