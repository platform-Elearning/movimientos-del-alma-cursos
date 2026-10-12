import { useEffect, useState, useCallback } from "react";
import { getMuroDelCurso, elegirCompartirLogros } from "../../api/progreso";
import { fraseDelMuro } from "../../utils/progreso";
import { tiempoRelativo } from "../../utils/fechas";
import "./progreso.css";

/**
 * Los logros recientes de las compañeras del curso. Cada alumna elige si los
 * suyos aparecen: arranca sin compartir, y nadie se ve expuesta sin decidirlo.
 * recargar cambia cuando la alumna gana un logro, para que aparezca al toque.
 */
const MuroDeLogros = ({ cursoId, recargar }) => {
  const [logros, setLogros] = useState([]);
  const [compartir, setCompartir] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  const cargar = useCallback(async () => {
    try {
      const muro = await getMuroDelCurso(cursoId);
      setLogros(muro.logros);
      setCompartir(muro.compartirLogros);
      setError(null);
    } catch {
      setError("No pudimos cargar el muro de logros.");
    } finally {
      setCargando(false);
    }
  }, [cursoId]);

  useEffect(() => {
    cargar();
  }, [cargar, recargar]);

  const cambiarCompartir = async () => {
    setGuardando(true);
    try {
      await elegirCompartirLogros(!compartir);
      setCompartir(!compartir);
      await cargar();
    } catch {
      setError("No pudimos guardar tu elección. Probá de nuevo.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <section className="muro" aria-labelledby="muro-titulo">
      <div className="muro-encabezado">
        <h3 id="muro-titulo">Muro de logros 🎉</h3>
        <label className="muro-compartir">
          <input
            type="checkbox"
            checked={compartir}
            onChange={cambiarCompartir}
            disabled={guardando || cargando}
          />
          Mostrar mis logros a mis compañeras
        </label>
      </div>
      {cargando && <p className="muro-vacio">Cargando…</p>}
      {error && <p className="muro-error">{error}</p>}
      {!cargando && !error && logros.length === 0 && (
        <p className="muro-vacio">
          Todavía no hay logros para mostrar. ¡Completá una clase y estrená el muro!
        </p>
      )}
      {logros.length > 0 && (
        <ul className="muro-lista">
          {logros.map((logro) => (
            <li key={logro.id} className={logro.es_mio ? "muro-item muro-item--mio" : "muro-item"}>
              <span>{fraseDelMuro(logro)}</span>
              <time dateTime={logro.created_at}>{tiempoRelativo(logro.created_at)}</time>
            </li>
          ))}
        </ul>
      )}
      {!compartir && !cargando && (
        <p className="muro-nota">
          Tus logros solo los ves vos hasta que elijas mostrarlos.
        </p>
      )}
    </section>
  );
};

export default MuroDeLogros;
