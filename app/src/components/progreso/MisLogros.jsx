import { LOGROS, ORDEN_DE_LOGROS, describirLogro, fraseDeRacha } from "../../utils/progreso";
import "./progreso.css";

/**
 * Las insignias de la alumna en camino al certificado: las ganadas a color, y
 * las que faltan en gris con la pista de como ganarlas, para que sepa que viene.
 */
const MisLogros = ({ logros = [], racha }) => {
  const porTipo = ORDEN_DE_LOGROS.map((kind) => ({
    kind,
    ganados: logros.filter((l) => l.kind === kind),
  }));
  const frase = fraseDeRacha(racha);

  return (
    <section className="mis-logros" aria-labelledby="mis-logros-titulo">
      <h3 id="mis-logros-titulo">Mis logros</h3>
      {frase && <p className="racha racha--centrada">{frase}</p>}
      <ul className="mis-logros-grilla">
        {porTipo.map(({ kind, ganados }) => {
          const info = LOGROS[kind];
          const ganado = ganados.length > 0;
          // El detalle del ultimo ganado: "Terminaste el módulo Ondas".
          const detalle = ganado ? describirLogro(ganados[ganados.length - 1]).detalle : info.pista;
          return (
            <li
              key={kind}
              className={ganado ? "insignia insignia--ganada" : "insignia"}
              aria-label={`${info.titulo}: ${ganado ? "ganado" : "por ganar"}`}
            >
              <span className="insignia-emoji" aria-hidden="true">{info.emoji}</span>
              <strong>{info.titulo}</strong>
              {ganados.length > 1 && <span className="insignia-veces">×{ganados.length}</span>}
              <p>{detalle}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default MisLogros;
