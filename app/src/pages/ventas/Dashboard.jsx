import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMetricasContactos } from "../../api/contactos";
import {
  BarrasHorizontales,
  LineaTemporal,
  BarraApilada,
  Metrica,
} from "../../components/graficos/Graficos";
import BackLink from "../../components/backLink/BackLink";
import "./Dashboard.css";

/**
 * Tablero del embudo de contactos.
 *
 * Es la misma pantalla para admin y vendedor: los números son los mismos y
 * duplicar la vista sería duplicar el mantenimiento.
 *
 * El número que abre el tablero es cuántos están esperando respuesta, no cuántos
 * contactos hay: el total no dice nada sobre qué hay que hacer hoy.
 */

const ETIQUETAS = {
  nueva: "Nueva",
  esperando_respuesta: "Esperando respuesta",
  en_conversacion: "En conversación",
  inscripta: "Inscripta",
  perdida: "Perdida",
  meta_ads: "Meta Ads (pauta)",
  google_ads: "Google Ads (pauta)",
  ig: "Instagram",
  fb: "Facebook",
  whatsapp: "WhatsApp",
  web: "Página web",
  referida: "Referida",
  autoregistro: "Se registró sola",
  no_identificado: "No identificado",
  otro: "Otro",
  sin_dato: "Sin dato",
  sin_asignar: "Sin asignar",
  falta_de_tiempo: "Falta de tiempo",
  precio: "Precio",
  otra_academia: "Se fue a otra academia",
  no_era_lo_que_buscaba: "No era lo que buscaba",
  nunca_respondio: "Nunca respondió",
};
const legible = (v) => ETIQUETAS[v] || v || "Sin dato";

const Dashboard = () => {
  const navigate = useNavigate();
  const [m, setM] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getMetricasContactos()
      .then(setM)
      .catch(() => setError("No se pudieron cargar las métricas."))
      .finally(() => setCargando(false));
  }, []);

  if (cargando) return <p className="tablero-estado">Cargando el tablero…</p>;
  if (error) return <p className="tablero-error">{error}</p>;

  const total = (m.porEstado || []).reduce((s, e) => s + e.cantidad, 0);
  const inscriptas = (m.porEstado || []).find((e) => e.status === "inscripta")?.cantidad || 0;
  const conversion = total ? Math.round((inscriptas / total) * 100) : 0;

  // La tasa por origen es lo que responde de dónde vienen las que pagan, no
  // solo de dónde viene más gente: un canal con mucho volumen y poca
  // conversión cuesta plata.
  const origenes = (m.porOrigen || []).map((o) => ({
    etiqueta: legible(o.origin),
    cantidad: o.cantidad,
    tasa: o.cantidad ? Math.round((o.inscriptas / o.cantidad) * 100) : 0,
  }));

  return (
    <div className="tablero">
      <BackLink title="Volver" onClick={() => navigate(-1)} />

      <header className="tablero-header">
        <h1>Embudo de contactos</h1>
        <button type="button" onClick={() => navigate("/ventas/seguimiento")}>
          Ir a la bandeja
        </button>
      </header>

      <div className="tablero-metricas">
        <Metrica
          rotulo="Esperando respuesta"
          valor={m.pendientes}
          detalle="Son los que hay que contactar"
          alerta={m.pendientes > 0}
        />
        <Metrica rotulo="Contactos totales" valor={total} />
        <Metrica rotulo="Inscriptas" valor={inscriptas} />
        <Metrica
          rotulo="Conversión"
          valor={`${conversion}%`}
          detalle="Del total de contactos"
        />
      </div>

      <div className="tablero-grid">
        <BarraApilada
          titulo="En qué estado está cada contacto"
          datos={(m.porEstado || []).map((e) => ({
            etiqueta: legible(e.status),
            cantidad: e.cantidad,
          }))}
        />

        <BarrasHorizontales
          titulo="De dónde llegan"
          datos={origenes}
          campoValor="cantidad"
          campoEtiqueta="etiqueta"
        />

        <BarrasHorizontales
          titulo="Cuánto convierte cada canal"
          datos={origenes}
          campoValor="tasa"
          campoEtiqueta="etiqueta"
          sufijo="%"
        />

        <LineaTemporal
          titulo="Contactos por mes"
          datos={m.porMes || []}
          series={[
            { campo: "ingresados", nombre: "Llegaron", color: "#c08c44" },
            { campo: "inscriptas", nombre: "Se inscribieron", color: "#83711b" },
          ]}
        />

        <BarrasHorizontales
          titulo="Carga por vendedora"
          datos={(m.porVendedor || []).map((v) => ({
            etiqueta: legible(v.vendedor),
            cantidad: v.abiertos,
          }))}
        />

        <BarrasHorizontales
          titulo="Por qué se pierden"
          datos={(m.motivosDePerdida || []).map((x) => ({
            etiqueta: legible(x.motivo),
            cantidad: x.cantidad,
          }))}
        />
      </div>
    </div>
  );
};

export default Dashboard;
