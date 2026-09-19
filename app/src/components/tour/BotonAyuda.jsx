import { useState, useEffect } from "react";
import { useAuth } from "../../services/authContext";
import Tour from "./Tour";
import { guionPara } from "./guiones";

/**
 * Boton fijo de ayuda. Aparece solo en las vistas de alumna y de profesor, y
 * ofrece el recorrido una vez por rol: despues queda a mano por si lo quieren
 * repetir, pero no vuelve a interrumpir.
 */
const clave = (rol) => `mda_tour_visto_${rol}`;

const BotonAyuda = () => {
  const { userRole } = useAuth();
  const [abierto, setAbierto] = useState(false);
  const guion = guionPara(userRole);
  const rol = userRole || "sin-rol";

  // La primera visita de cada rol abre el recorrido sola. Se espera un momento
  // para que la pantalla haya terminado de cargar sus datos.
  useEffect(() => {
    if (!guion) return;
    let visto = true;
    try {
      visto = localStorage.getItem(clave(rol)) === "1";
    } catch {
      // Si el navegador bloquea localStorage, no insistimos con el recorrido.
    }
    if (visto) return;
    const t = setTimeout(() => setAbierto(true), 1200);
    return () => clearTimeout(t);
  }, [guion, rol]);

  const cerrar = () => {
    setAbierto(false);
    try {
      localStorage.setItem(clave(rol), "1");
    } catch {
      // Sin localStorage el recorrido se va a volver a ofrecer. No es grave.
    }
  };

  if (!guion) return null;

  return (
    <>
      <button
        type="button"
        className="tour-ayuda"
        onClick={() => setAbierto(true)}
        aria-label="Ver cómo usar esta pantalla"
      >
        <strong aria-hidden="true">?</strong>
        <span>¿Cómo uso esto?</span>
      </button>
      {abierto && <Tour pasos={guion} onCerrar={cerrar} />}
    </>
  );
};

export default BotonAyuda;
