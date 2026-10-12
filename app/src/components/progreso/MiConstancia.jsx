import { LOGROS, fraseDeRacha, tieneConstancia } from "../../utils/progreso";
import "./progreso.css";

/**
 * Lo que es de la alumna y no de una formacion: su racha y la insignia de
 * constancia. Las insignias de cada formacion van debajo de su tarjeta.
 */
const MiConstancia = ({ logros = [], racha }) => {
  const ganada = tieneConstancia(logros);
  const frase = fraseDeRacha(racha);
  const info = LOGROS.constancia;

  return (
    <section className="mi-constancia" aria-labelledby="mi-constancia-titulo">
      <h3 id="mi-constancia-titulo">Tu constancia</h3>
      <div className="mi-constancia-fila">
        <div
          className={ganada ? "insignia insignia--ganada" : "insignia"}
          aria-label={`${info.titulo}: ${ganada ? "ganada" : "por ganar"}`}
        >
          <span className="insignia-emoji" aria-hidden="true">{info.emoji}</span>
          <strong>{info.titulo}</strong>
          <p>{ganada ? info.descripcion : info.pista}</p>
        </div>
        <p className="mi-constancia-racha">
          {frase || "Cada día que bailás suma a tu racha. ¡Empezá hoy! ✨"}
        </p>
      </div>
      <p className="mi-constancia-nota">
        Las insignias de cada formación están debajo de su tarjeta.
      </p>
    </section>
  );
};

export default MiConstancia;
