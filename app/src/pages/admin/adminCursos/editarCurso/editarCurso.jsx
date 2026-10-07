import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAllCursos, updateCourse } from "../../../../api/cursos";
import CreateModule from "../createModule/agregarModulo";
import ModulesTable from "../tableModules/tableModules";
import EliminarCurso from "../eliminarCurso/EliminarCurso";
import { mensajeDeError } from "../../../../utils/errores";
import "./editarCurso.css";
import "../accionesFila.css";

/**
 * Edición de un curso: sus datos (nombre y descripción), sus módulos, y borrarlo.
 *
 * Antes esta pantalla solo permitía crear módulos y borrar el curso: el nombre
 * y la descripción no se podían cambiar desde el admin, y los módulos no se
 * podían editar ni borrar.
 */
const EditarCurso = () => {
  const { cursoId } = useParams();
  const navigate = useNavigate();

  const [curso, setCurso] = useState(null);
  const [borrador, setBorrador] = useState({ name: "", description: "" });
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");
  const [borrando, setBorrando] = useState(false);
  // Sube cuando se crea un módulo, para que la tabla se recargue sola.
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let vigente = true;
    getAllCursos()
      .then((respuesta) => {
        if (!vigente) return;
        const encontrado = (respuesta?.data || []).find((c) => String(c.id) === String(cursoId));
        if (!encontrado) {
          setError("No se encontró el curso.");
          return;
        }
        setCurso(encontrado);
        setBorrador({ name: encontrado.name, description: encontrado.description });
      })
      .catch((err) => vigente && setError(mensajeDeError(err, "cargar el curso")))
      .finally(() => vigente && setCargando(false));
    return () => {
      vigente = false;
    };
  }, [cursoId]);

  const cambiar = (e) => {
    setBorrador((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setAviso("");
  };

  const sinCambios =
    curso && borrador.name === curso.name && borrador.description === curso.description;

  const guardar = async (e) => {
    e.preventDefault();
    if (!borrador.name.trim() || !borrador.description.trim()) {
      setError("El nombre y la descripción son obligatorios.");
      return;
    }
    setGuardando(true);
    setError("");
    try {
      const respuesta = await updateCourse(cursoId, borrador);
      setCurso(respuesta.data);
      setBorrador({ name: respuesta.data.name, description: respuesta.data.description });
      setAviso("Datos del curso actualizados.");
    } catch (err) {
      setError(mensajeDeError(err, "guardar el curso"));
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="editar-curso-page">
      <div className="course-actions-header">
        <button
          type="button"
          className="delete-course-btn"
          onClick={() => setBorrando(true)}
          disabled={!curso}
        >
          🗑️ Eliminar Curso
        </button>
      </div>

      <form className="af-datos-curso" onSubmit={guardar}>
        <h2>Datos del curso</h2>
        {cargando && <p className="af-vacio">Cargando el curso…</p>}
        {!cargando && curso && (
          <>
            <div className="af-campo">
              <label htmlFor="ec-nombre">Nombre</label>
              <input
                id="ec-nombre"
                className="af-input"
                name="name"
                value={borrador.name}
                onChange={cambiar}
                maxLength={255}
              />
            </div>
            <div className="af-campo">
              <label htmlFor="ec-descripcion">Descripción</label>
              <textarea
                id="ec-descripcion"
                className="af-input"
                name="description"
                rows={3}
                value={borrador.description}
                onChange={cambiar}
              />
            </div>
            <div className="af-pie">
              <button type="submit" className="af-boton af-guardar" disabled={guardando || sinCambios}>
                {guardando ? "Guardando…" : "Guardar cambios"}
              </button>
            </div>
          </>
        )}
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
      </form>

      <CreateModule onCreated={() => setVersion((v) => v + 1)} />
      <ModulesTable version={version} />

      {borrando && curso && (
        <EliminarCurso
          curso={curso}
          onCerrar={() => setBorrando(false)}
          onBorrado={() => navigate("/admin/cursos")}
        />
      )}
    </div>
  );
};

export default EditarCurso;
