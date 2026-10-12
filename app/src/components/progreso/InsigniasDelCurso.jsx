import { insigniasDelCurso } from "../../utils/progreso";
import "./progreso.css";

/** La fila de insignias de una formacion: primer paso, modulos y formacion completa. */
const InsigniasDelCurso = ({ logros, courseId, modulos }) => (
  <ul className="insignias-curso" aria-label="Insignias de esta formación">
    {insigniasDelCurso(logros, courseId, modulos).map((insignia) => (
      <li
        key={insignia.kind}
        className={insignia.ganada ? "insignia-mini insignia-mini--ganada" : "insignia-mini"}
        title={insignia.ganada ? insignia.descripcion : insignia.pista}
      >
        <span className="insignia-mini-emoji" aria-hidden="true">{insignia.emoji}</span>
        <span>
          {insignia.etiqueta}
          <span className="sr-only">{insignia.ganada ? " (ganada)" : " (por ganar)"}</span>
        </span>
      </li>
    ))}
  </ul>
);

export default InsigniasDelCurso;
