import { useCallback, useEffect, useState } from "react";
import { getProgresoDelCurso, marcarClaseCompletada } from "../api/progreso";

/**
 * El progreso de la alumna en un curso y como marcar clases. Lo comparten la
 * pantalla del curso y la de la clase.
 *
 * activo: false para profesor y admin, que miran el curso pero no cursan; ahi
 * no se pide nada y completadas queda en null (las tarjetas no muestran progreso).
 */
export const useProgresoDelCurso = (cursoId, activo) => {
  const [completadas, setCompletadas] = useState(null);
  const [total, setTotal] = useState(0);
  const [ultimaClaseId, setUltimaClaseId] = useState(null);
  const [logrosNuevos, setLogrosNuevos] = useState([]);
  // Sube cada vez que se gana un logro: el muro lo escucha para recargarse.
  const [versionDeLogros, setVersionDeLogros] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!activo || !cursoId) return;
    let vigente = true;
    getProgresoDelCurso(cursoId)
      .then((datos) => {
        if (!vigente) return;
        setCompletadas(new Set(datos.completadas));
        setTotal(datos.total);
        setUltimaClaseId(datos.ultimaClaseId);
      })
      .catch(() => {
        // Sin progreso la alumna igual puede ver sus clases: no se corta nada.
        if (vigente) setCompletadas(new Set());
      });
    return () => {
      vigente = false;
    };
  }, [cursoId, activo]);

  const marcar = useCallback(async (claseId, completada) => {
    setError(null);
    // Optimista: el ✓ aparece al toque, y vuelve atras si el servidor falla.
    const cambiar = (agregar) =>
      setCompletadas((previo) => {
        const nuevo = new Set(previo || []);
        if (agregar) nuevo.add(claseId);
        else nuevo.delete(claseId);
        return nuevo;
      });
    cambiar(completada);
    try {
      const resultado = await marcarClaseCompletada(claseId, completada);
      if (resultado.logrosNuevos?.length) {
        setLogrosNuevos(resultado.logrosNuevos);
        setVersionDeLogros((v) => v + 1);
      }
      return resultado;
    } catch {
      cambiar(!completada);
      setError("No pudimos guardar tu avance. Probá de nuevo.");
      return null;
    }
  }, []);

  const cerrarCelebracion = useCallback(() => setLogrosNuevos([]), []);

  return {
    completadas,
    total,
    ultimaClaseId,
    marcar,
    logrosNuevos,
    cerrarCelebracion,
    versionDeLogros,
    error,
  };
};
