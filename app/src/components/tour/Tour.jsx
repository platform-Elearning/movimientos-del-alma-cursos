import { useState, useEffect, useCallback, useRef } from "react";
import "./Tour.css";

/**
 * Recorrido guiado sobre la pantalla real.
 *
 * Los pasos son datos (ver guiones.js): cada uno apunta a un selector. Los pasos
 * cuyo elemento no esta en pantalla se descartan al abrir, asi el mismo guion
 * sirve en varias vistas y nunca queda un paso senalando el vacio -- que es como
 * se rompen estos recorridos.
 */
const MARGEN = 12;

const Tour = ({ pasos, onCerrar }) => {
  const [indice, setIndice] = useState(0);
  const [visibles, setVisibles] = useState([]);
  const [caja, setCaja] = useState(null);
  const globoRef = useRef(null);

  // Solo los pasos que existen en esta pantalla. Se reintenta unas veces porque
  // al abrir el recorrido la pantalla puede estar todavia cargando sus datos: si
  // se filtrara una sola vez, quedarian afuera pasos que si corresponden.
  useEffect(() => {
    let intentos = 0;
    let cancelado = false;
    let timer;
    const buscar = () => {
      if (cancelado) return;
      const encontrados = pasos.filter((p) => document.querySelector(p.selector));
      setVisibles(encontrados);
      if (encontrados.length < pasos.length && intentos++ < 8) {
        timer = setTimeout(buscar, 300);
      }
    };
    buscar();
    return () => {
      cancelado = true;
      clearTimeout(timer);
    };
  }, [pasos]);

  const paso = visibles[indice];

  const medir = useCallback(() => {
    if (!paso) return;
    const el = document.querySelector(paso.selector);
    if (!el) {
      setCaja(null);
      return;
    }
    const r = el.getBoundingClientRect();
    setCaja({ top: r.top, left: r.left, width: r.width, height: r.height });
  }, [paso]);

  useEffect(() => {
    if (!paso) return;
    const el = document.querySelector(paso.selector);
    if (el) {
      const quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      el.scrollIntoView({ behavior: quieto ? "auto" : "smooth", block: "center" });
    }
    // El scroll suave tarda: se mide despues, y en cada resize o scroll posterior.
    const t = setTimeout(medir, 320);
    window.addEventListener("resize", medir);
    window.addEventListener("scroll", medir, true);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", medir);
      window.removeEventListener("scroll", medir, true);
    };
  }, [paso, medir]);

  useEffect(() => {
    if (globoRef.current) globoRef.current.focus();
  }, [indice, visibles.length]);

  const siguiente = useCallback(() => {
    setIndice((i) => (i + 1 < visibles.length ? i + 1 : i));
  }, [visibles.length]);

  const anterior = useCallback(() => setIndice((i) => Math.max(0, i - 1)), []);

  useEffect(() => {
    const teclas = (e) => {
      if (e.key === "Escape") onCerrar();
      else if (e.key === "ArrowRight") siguiente();
      else if (e.key === "ArrowLeft") anterior();
    };
    document.addEventListener("keydown", teclas);
    return () => document.removeEventListener("keydown", teclas);
  }, [onCerrar, siguiente, anterior]);

  if (!visibles.length) return null;

  const ultimo = indice === visibles.length - 1;

  // El globo va debajo del elemento salvo que no entre; ahi va arriba.
  let estiloGlobo = { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
  if (caja) {
    const abajo = caja.top + caja.height + MARGEN;
    const cabeAbajo = abajo + 190 < window.innerHeight;
    estiloGlobo = {
      top: cabeAbajo ? abajo : Math.max(MARGEN, caja.top - 190 - MARGEN),
      left: Math.min(
        Math.max(MARGEN, caja.left + caja.width / 2 - 170),
        window.innerWidth - 340 - MARGEN
      ),
    };
  }

  return (
    <div className="tour-capa" role="dialog" aria-modal="true" aria-label="Recorrido guiado">
      <div className="tour-fondo" onClick={onCerrar} />
      {caja && (
        <div
          className="tour-foco"
          style={{
            top: caja.top - 6,
            left: caja.left - 6,
            width: caja.width + 12,
            height: caja.height + 12,
          }}
        />
      )}
      <div className="tour-globo" style={estiloGlobo} ref={globoRef} tabIndex={-1}>
        <p className="tour-contador">
          Paso {indice + 1} de {visibles.length}
        </p>
        <h2 className="tour-titulo">{paso.titulo}</h2>
        <p className="tour-texto">{paso.texto}</p>
        <div className="tour-acciones">
          <button type="button" className="tour-saltar" onClick={onCerrar}>
            {ultimo ? "Cerrar" : "Saltar"}
          </button>
          <div className="tour-navegacion">
            {indice > 0 && (
              <button type="button" className="tour-btn" onClick={anterior}>
                Anterior
              </button>
            )}
            {!ultimo ? (
              <button type="button" className="tour-btn tour-btn-principal" onClick={siguiente}>
                Siguiente
              </button>
            ) : (
              <button type="button" className="tour-btn tour-btn-principal" onClick={onCerrar}>
                Listo
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tour;
