import { porcentaje, fraseDeAvance } from "../../utils/progreso";
import "./progreso.css";

/**
 * "Llevás 7 de 12 clases 💃" con su barra. compacta: sin frase, para tarjetas
 * chicas. oscura: sobre fondo oscuro, donde la pista clara de siempre se veia
 * como una barra llena aunque fuera 0%.
 */
const BarraDeProgreso = ({ completadas, total, compacta = false, oscura = false }) => {
  const valor = porcentaje(completadas, total);
  const clases = ["progreso", compacta && "progreso--compacta", oscura && "progreso--oscura"];
  return (
    <div className={clases.filter(Boolean).join(" ")}>
      {!compacta && <p className="progreso-frase">{fraseDeAvance(completadas, total)}</p>}
      <div
        className="progreso-pista"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={valor}
        aria-label={`${completadas} de ${total} clases completadas`}
      >
        <div className="progreso-relleno" style={{ width: `${valor}%` }} />
      </div>
      {compacta && (
        <p className="progreso-cifra">
          {completadas} de {total} clases · {valor}%
        </p>
      )}
    </div>
  );
};

export default BarraDeProgreso;
