import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BandejaSeguimiento from "./BandejaSeguimiento";
import EmbudoVentas from "./EmbudoVentas";
import BackLink from "../../components/backLink/BackLink";
import "./Ventas.css";

/**
 * Ventas: la bandeja y el embudo, en una sola pantalla.
 *
 * Son el mismo trabajo a dos distancias. La bandeja contesta "a quién le
 * escribo ahora" y el embudo "cómo viene el mes"; tenerlas en pantallas
 * separadas obligaba a salir de una para mirar la otra, y en la práctica el
 * embudo no se miraba nunca.
 *
 * Abre en la vista que corresponda según por dónde se entró, así los accesos
 * directos que ya existían siguen llevando a donde llevaban.
 */
const Ventas = ({ inicial = "bandeja" }) => {
  const navigate = useNavigate();
  const [vista, setVista] = useState(inicial);

  return (
    <div className="ventas">
      <BackLink title="Volver" onClick={() => navigate(-1)} />

      <header className="ventas-header">
        <h1>Ventas</h1>
        <div className="ventas-tabs">
          {[
            ["bandeja", "Seguimiento"],
            ["embudo", "Embudo"],
          ].map(([clave, rotulo]) => (
            <button
              key={clave}
              type="button"
              className={vista === clave ? "activa" : ""}
              onClick={() => setVista(clave)}
            >
              {rotulo}
            </button>
          ))}
        </div>
      </header>

      {/* Se monta una sola: la bandeja pide la cola al montarse y el embudo las
          métricas, y tener las dos vivas duplicaría las consultas cada vez que
          se cambia de pestaña. */}
      {vista === "bandeja" ? <BandejaSeguimiento /> : <EmbudoVentas />}
    </div>
  );
};

export default Ventas;
