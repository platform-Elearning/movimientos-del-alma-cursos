import { useEffect, useMemo } from "react";
import { describirLogro, fraseDeCelebracion } from "../../utils/progreso";
import "./progreso.css";

const COLORES = ["#c08c44", "#ffbb80", "#ffd9a3", "#e8a0bf", "#83711b", "#f6c6d9"];

/**
 * Lo que aparece cuando la alumna gana un logro: confeti, cada logro con su
 * emoji, y una frase. Se cierra con el boton, con Escape o tocando afuera.
 */
const Celebracion = ({ logros, onCerrar, siguiente }) => {
  const abierta = Boolean(logros?.length);

  // Escape la cierra, solo mientras esta abierta: si no, cualquier Escape de la
  // pagina (cerrar otro menu) pasaria por aca.
  useEffect(() => {
    if (!abierta) return undefined;
    const alTeclear = (e) => e.key === "Escape" && onCerrar();
    window.addEventListener("keydown", alTeclear);
    return () => window.removeEventListener("keydown", alTeclear);
  }, [abierta, onCerrar]);

  // Posiciones fijas por apertura: si se recalcularan en cada render el confeti
  // saltaria de lugar.
  const confeti = useMemo(
    () =>
      Array.from({ length: 48 }, (_, i) => ({
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 0.8}s`,
        duration: `${2.4 + Math.random() * 1.6}s`,
        color: COLORES[i % COLORES.length],
        rotate: `${Math.random() * 360}deg`,
      })),
    []
  );

  if (!abierta) return null;
  const modulo = logros.find((l) => l.kind === "modulo_completo");

  return (
    <div className="celebracion-fondo" onClick={onCerrar} role="presentation">
      <div className="celebracion-confeti" aria-hidden="true">
        {confeti.map((p, i) => (
          <span
            key={i}
            style={{
              left: p.left,
              background: p.color,
              animationDelay: p.delay,
              animationDuration: p.duration,
              transform: `rotate(${p.rotate})`,
            }}
          />
        ))}
      </div>
      <div
        className="celebracion-tarjeta"
        role="dialog"
        aria-modal="true"
        aria-labelledby="celebracion-titulo"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="celebracion-titulo">
          {logros.length === 1 ? "¡Ganaste un logro!" : `¡Ganaste ${logros.length} logros!`}
        </h2>
        <ul className="celebracion-logros">
          {logros.map((logro, i) => {
            const { emoji, titulo, detalle } = describirLogro(logro);
            return (
              <li key={`${logro.kind}-${i}`}>
                <span className="celebracion-emoji" aria-hidden="true">{emoji}</span>
                <div>
                  <strong>{titulo}</strong>
                  <p>{detalle}</p>
                </div>
              </li>
            );
          })}
        </ul>
        {modulo && <p className="celebracion-frase">{fraseDeCelebracion(modulo.module_id)}</p>}
        <div className="celebracion-acciones">
          {siguiente && (
            <button type="button" className="boton-dorado" onClick={siguiente.onClick}>
              Siguiente clase →
            </button>
          )}
          <button
            type="button"
            className={siguiente ? "boton-suave" : "boton-dorado"}
            onClick={onCerrar}
            autoFocus
          >
            ¡Seguir bailando!
          </button>
        </div>
      </div>
    </div>
  );
};

export default Celebracion;
