import React, { useEffect, useState, useCallback } from "react";
import "./tableModules.css";
import "../accionesFila.css";
import {
  getModulesByCourseID,
  updateModule,
  deleteCourseModule,
  getImpactoModulo,
} from "../../../../api/cursos";
import { useParams, useNavigate } from "react-router-dom";
import ConfirmarBorrado from "../../../../components/confirmarBorrado/ConfirmarBorrado";
import BotonBorrar from "../../../../components/confirmarBorrado/BotonBorrar";
import { lineasDeImpactoModulo } from "../../../../utils/cursos";
import { mensajeDeError } from "../../../../utils/errores";

/**
 * Módulos de un curso: ver sus clases, editar y eliminar.
 *
 * Editar es el camino normal para corregir un módulo; borrarlo pide confirmar y
 * dice qué se pierde. `version` lo manda quien crea un módulo nuevo, para que la
 * tabla se recargue sola en lugar de quedar desactualizada hasta refrescar.
 */
const ModulesTable = ({ version = 0 }) => {
  const { cursoId } = useParams();
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [aviso, setAviso] = useState("");

  const [editando, setEditando] = useState(null);
  const [borrador, setBorrador] = useState({ module_number: "", name: "", description: "" });
  const [guardando, setGuardando] = useState(false);
  const [errorFila, setErrorFila] = useState("");

  const [aBorrar, setABorrar] = useState(null);
  const [impacto, setImpacto] = useState(null);
  const [cargandoImpacto, setCargandoImpacto] = useState(false);
  const [borrando, setBorrando] = useState(false);
  const [errorBorrado, setErrorBorrado] = useState("");

  const fetchModules = useCallback(async () => {
    try {
      const response = await getModulesByCourseID(cursoId);
      if (response && Array.isArray(response.data)) {
        // El orden de la API no está garantizado y el número ES el orden.
        setModules([...response.data].sort((a, b) => a.module_number - b.module_number));
        setError(null);
      } else {
        throw new Error("La respuesta de la API no es un array válido");
      }
    } catch (err) {
      // Un curso sin módulos todavía no es un error: la API lo informa como 500.
      if (err?.response) setModules([]);
      else setError("Error al cargar los módulos");
    } finally {
      setLoading(false);
    }
  }, [cursoId]);

  useEffect(() => {
    fetchModules();
  }, [fetchModules, version]);

  const empezarEdicion = (m) => {
    setEditando(m.id);
    setBorrador({ module_number: String(m.module_number), name: m.name, description: m.description });
    setErrorFila("");
    setAviso("");
  };

  const cambiar = (e) => setBorrador((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const guardar = async () => {
    if (!borrador.name.trim() || !borrador.description.trim()) {
      setErrorFila("El nombre y la descripción son obligatorios.");
      return;
    }
    setGuardando(true);
    setErrorFila("");
    try {
      await updateModule(editando, borrador);
      setEditando(null);
      setAviso("Módulo actualizado.");
      await fetchModules();
    } catch (err) {
      setErrorFila(mensajeDeError(err, "guardar el módulo"));
    } finally {
      setGuardando(false);
    }
  };

  const pedirBorrado = async (m) => {
    setABorrar(m);
    setImpacto(null);
    setErrorBorrado("");
    setAviso("");
    setCargandoImpacto(true);
    try {
      setImpacto(await getImpactoModulo(m.id));
    } catch (err) {
      setErrorBorrado(mensajeDeError(err, "calcular qué se pierde"));
    } finally {
      setCargandoImpacto(false);
    }
  };

  const cerrarBorrado = () => {
    if (borrando) return;
    setABorrar(null);
    setImpacto(null);
    setErrorBorrado("");
  };

  const confirmarBorrado = async () => {
    setBorrando(true);
    setErrorBorrado("");
    try {
      await deleteCourseModule(aBorrar.id);
      setAviso(`Se eliminó el módulo "${aBorrar.name}".`);
      setABorrar(null);
      setImpacto(null);
      await fetchModules();
    } catch (err) {
      setErrorBorrado(mensajeDeError(err, "borrar el módulo"));
    } finally {
      setBorrando(false);
    }
  };

  if (loading) return <p className="custom-modules-table__loading">Cargando módulos...</p>;
  if (error) return <p className="custom-modules-table__error">Error: {error}</p>;

  const lineas = impacto ? lineasDeImpactoModulo(impacto) : [];

  return (
    <div className="custom-modules-table">
      <h1 className="custom-modules-table__title">Lista de Módulos</h1>

      {aviso && (
        <p className="af-aviso" role="status">
          {aviso}
        </p>
      )}

      <table className="custom-modules-table__table">
        <thead className="custom-modules-table__thead">
          <tr className="custom-modules-table__header-row">
            <th className="custom-modules-table__header">ID</th>
            <th className="custom-modules-table__header">Número de Módulo</th>
            <th className="custom-modules-table__header">Nombre</th>
            <th className="custom-modules-table__header">Descripción</th>
            <th className="custom-modules-table__header">Acciones</th>
          </tr>
        </thead>
        <tbody className="custom-modules-table__tbody">
          {modules.map((module) =>
            editando === module.id ? (
              <tr key={module.id} className="custom-modules-table__row">
                <td className="custom-modules-table__cell">{module.id}</td>
                <td className="custom-modules-table__cell">
                  <input
                    className="af-input af-input-numero"
                    name="module_number"
                    type="number"
                    min="1"
                    value={borrador.module_number}
                    onChange={cambiar}
                    aria-label="Número de módulo"
                  />
                </td>
                <td className="custom-modules-table__cell">
                  <input
                    className="af-input"
                    name="name"
                    value={borrador.name}
                    onChange={cambiar}
                    aria-label="Nombre del módulo"
                  />
                </td>
                <td className="custom-modules-table__cell">
                  <textarea
                    className="af-input"
                    name="description"
                    value={borrador.description}
                    onChange={cambiar}
                    aria-label="Descripción del módulo"
                  />
                  <p className="af-nota">
                    Cambiar el número cambia el orden de los módulos, y el orden decide qué ve cada
                    alumna.
                  </p>
                  {errorFila && (
                    <p className="af-error" role="alert">
                      {errorFila}
                    </p>
                  )}
                </td>
                <td className="custom-modules-table__cell">
                  <div className="af-acciones">
                    <button type="button" className="af-boton af-guardar" onClick={guardar} disabled={guardando}>
                      {guardando ? "Guardando…" : "Guardar"}
                    </button>
                    <button type="button" className="af-boton" onClick={() => setEditando(null)} disabled={guardando}>
                      Cancelar
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              <tr key={module.id} className="custom-modules-table__row">
                <td className="custom-modules-table__cell">{module.id}</td>
                <td className="custom-modules-table__cell">{module.module_number}</td>
                <td className="custom-modules-table__cell">{module.name}</td>
                <td className="custom-modules-table__cell">{module.description}</td>
                <td className="custom-modules-table__cell">
                  <div className="af-acciones">
                    <button
                      type="button"
                      className="af-boton af-ver"
                      onClick={() => navigate(`/admin/editarCurso/${cursoId}/module/${module.id}`)}
                    >
                      Ver clases
                    </button>
                    <button type="button" className="af-boton af-editar" onClick={() => empezarEdicion(module)}>
                      Editar
                    </button>
                    <BotonBorrar
                      etiqueta={`Eliminar el módulo ${module.name}`}
                      onClick={() => pedirBorrado(module)}
                    />
                  </div>
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
      {modules.length === 0 && <p className="af-vacio">Este curso todavía no tiene módulos.</p>}

      {aBorrar && (
        <ConfirmarBorrado
          titulo={`Eliminar el módulo ${aBorrar.module_number}: "${aBorrar.name}"`}
          cargando={cargandoImpacto}
          enProceso={borrando}
          error={errorBorrado}
          // Si no se pudo calcular qué se pierde, no se deja borrar a ciegas.
          bloqueado={!cargandoImpacto && !impacto}
          textoConfirmar="Sí, eliminar módulo"
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
            <p>Este módulo no tiene clases ni alumnas que se vean afectadas.</p>
          )}
          <p>
            Si solo hay que corregir algo, usá <strong>Editar</strong>: no pierde nada.
          </p>
        </ConfirmarBorrado>
      )}
    </div>
  );
};

export default ModulesTable;
