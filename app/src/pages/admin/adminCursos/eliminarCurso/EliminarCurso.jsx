import { useState } from "react";
import { deleteCourse } from "../../../../api/cursos";
import ConfirmarBorrado from "../../../../components/confirmarBorrado/ConfirmarBorrado";
import { motivoDeBorradoDeCurso } from "../../../../utils/cursos";

/**
 * Borrar un curso, con confirmación.
 *
 * Lo usan la lista de cursos y la pantalla de edición: el botón tiene que estar
 * donde se mira el curso, no escondido en una sola de las dos. El backend solo
 * borra un curso sin alumnas ni profesores; si los tiene, el motivo aparece acá
 * mismo, con el número, y no hay que adivinar por qué falló.
 */
const EliminarCurso = ({ curso, onCerrar, onBorrado }) => {
  const [enProceso, setEnProceso] = useState(false);
  const [error, setError] = useState("");

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
      enProceso={enProceso}
      error={error}
      textoConfirmar="Sí, eliminar curso"
      onConfirmar={confirmar}
      onCancelar={onCerrar}
    >
      <p>
        Se borra el curso con <strong>todos sus módulos y clases</strong>, y sus comentarios.
      </p>
      <p>
        Solo se puede borrar un curso <strong>sin alumnas inscriptas ni profesores asignados</strong>. Si
        los tiene, te lo va a decir acá y no se borra nada.
      </p>
    </ConfirmarBorrado>
  );
};

export default EliminarCurso;
