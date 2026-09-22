import { useNavigate, useLocation } from "react-router-dom";
import BandejaSeguimiento from "./BandejaSeguimiento";
import EmbudoVentas from "./EmbudoVentas";
import Contactos from "./Contactos";
import BackLink from "../../components/backLink/BackLink";
import "./Ventas.css";

/**
 * Ventas: la bandeja y el embudo, en una sola pantalla.
 *
 * Son el mismo trabajo a dos distancias. La bandeja contesta "a quién le
 * escribo ahora" y el embudo "cómo viene el mes"; en pantallas separadas había
 * que salir de una para mirar la otra, y en la práctica el embudo no se miraba.
 *
 * La pestaña sale de la URL y no de un estado interno. Con estado interno
 * inicializado por prop, entrar a /tablero estando en /seguimiento no cambiaba
 * nada: React conserva el componente montado y useState no se vuelve a evaluar.
 * Con la ruta como fuente de verdad, además, el botón atrás del navegador
 * funciona y se puede compartir el link de una pestaña.
 */

const PESTANAS = [
  ["bandeja", "Seguimiento", "seguimiento"],
  ["contactos", "Todos los contactos", "contactos"],
  ["embudo", "Embudo", "tablero"],
];

const Ventas = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // /admin o /ventas: la pantalla es la misma y se conserva la sección por la
  // que se entró, que es la que tiene sentido en el "volver".
  const seccion = pathname.startsWith("/admin") ? "/admin" : "/ventas";
  const vista = pathname.endsWith("/tablero")
    ? "embudo"
    : pathname.endsWith("/contactos")
      ? "contactos"
      : "bandeja";

  return (
    <div className="ventas">
      <BackLink title="Volver" onClick={() => navigate(-1)} />

      <header className="ventas-header">
        <h1>Ventas</h1>
        <div className="ventas-tabs">
          {PESTANAS.map(([clave, rotulo, ruta]) => (
            <button
              key={clave}
              type="button"
              className={vista === clave ? "activa" : ""}
              // replace: cambiar de pestaña no es un paso atrás, y sin esto
              // "volver" recorrería todas las pestañas que se miraron.
              onClick={() => navigate(`${seccion}/${ruta}`, { replace: true })}
            >
              {rotulo}
            </button>
          ))}
        </div>
      </header>

      {/* Se monta una sola: cada vista pide sus datos al montarse, y tener las
          dos vivas duplicaría las consultas en cada cambio de pestaña. */}
      {vista === "bandeja" && <BandejaSeguimiento />}
      {vista === "contactos" && <Contactos />}
      {vista === "embudo" && <EmbudoVentas />}
    </div>
  );
};

export default Ventas;
