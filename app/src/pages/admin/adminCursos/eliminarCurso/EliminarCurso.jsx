import { useEffect, useState } from "react";
import { deleteCourse, getImpactoCurso } from "../../../../api/cursos";
import ConfirmarBorrado from "../../../../components/confirmarBorrado/ConfirmarBorrado";
import { lineasDeBloqueoCurso, hayBloqueos, motivoDeBorradoDeCurso } from "../../../../utils/cursos";
import { mensajeDeError } from "../../../../utils/errores";

/**
 * Borrar un curso, con confirmación.
 *
 * Lo usan la lista de cursos y la pantalla de edición: el botón tiene que estar
 * donde se mira el curso, no escondido en una sola de las dos.
 *
 * El borrado va de abajo hacia arriba: un curso solo se borra vacío, sin módulos,
 * sin alumnas y sin profesores. Al abrir el diálogo se consulta qué lo impide y se
 * muestra enseguida, en vez de dejar apretar el botón para recién ahí enterarse.
 * El backend lo exige igual, así que esto es solo para explicarlo antes.
 */
const EliminarCurso = ({ curso, onCerrar, onBorrado }) => {
  const [impacto, setImpacto] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [enProceso, setEnProceso] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let vigente = true;
    getImpactoCurso(curso.id)
      .then((i) => vigente && setImpacto(i))
      .catch((err) => vigente && setError(mensajeDeError(err, "calcular qué impide borrar el curso")))
      .finally(() => vigente && setCargando(false));
    return () => {
      vigente = false;
    };
  }, [curso.id]);

  const lineas = impacto ? lineasDeBloqueoCurso(impacto.bloqueos) : [];
  // Sin saber qué impide borrarlo no se deja borrar a ciegas.
  const bloqueado = !cargando && (!impacto || hayBloqueos(impacto.bloqueos));

  const confirmar = async () => {
    setEnProceso(true);
    setError("");
    try {
      await deleteCourse(curso.id);
      onBorrado?.(curso);
    } catch (err) {
      setError(motivoDeBorradoDeCurso(err));
      setEnProceso(false);
    }
  };

  return (
    <ConfirmarBorrado
      titulo={`Eliminar el curso "${curso.name}"`}
      cargando={cargando}
      enProceso={enProceso}
      error={error}
      bloqueado={bloqueado}
      textoConfirmar="Sí, eliminar curso"
      onConfirmar={confirmar}
      onCancelar={onCerrar}
    >
      {lineas.length ? (
        <>
          <p>No se puede eliminar todavía:</p>
          <ul>
            {lineas.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        </>
      ) : (
        impacto && <p>El curso está vacío: no tiene módulos, alumnas ni profesores. Se puede eliminar.</p>
      )}
    </ConfirmarBorrado>
  );
};

export default EliminarCurso;
