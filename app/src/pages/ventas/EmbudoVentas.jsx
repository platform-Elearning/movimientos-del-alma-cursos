import { useState, useEffect } from "react";
import { getMetricasContactos } from "../../api/contactos";
import {
  BarrasHorizontales,
  BarrasComparadas,
  LineaTemporal,
  Embudo,
  Anillo,
  Metrica,
} from "../../components/graficos/Graficos";
import { legible } from "../../utils/etiquetas";
import { mensajeDeError } from "../../utils/errores";
import "./EmbudoVentas.css";

/**
 * El embudo: la misma gente de la bandeja, vista de lejos.
 *
 * La bandeja contesta "a quién le escribo hoy"; esto contesta "cómo viene el
 * mes". Son las dos caras del trabajo de ventas y por eso viven en la misma
 * pantalla, en pestañas.
 *
 * El número que abre no es cuántos contactos hay sino cuántos están esperando
 * respuesta: el total no dice nada sobre qué hay que hacer.
 */

/**
 * Los pasos del embudo, en orden y acumulados.
 *
 * Cada paso incluye a los que ya pasaron de largo: quien se inscribió también
 * fue contactada alguna vez. Sin acumular, el embudo mostraría escalones que
 * suben, que es justo lo contrario de lo que un embudo tiene que mostrar.
 */
const armarEmbudo = (porEstado = [], motivos = []) => {
  const de = (estado) =>
    Number(porEstado.find((e) => e.status === estado)?.cantidad || 0);

  const nuevas = de("nueva");
  const esperando = de("esperando_respuesta");
  const conversando = de("en_conversacion");
  const inscriptas = de("inscripta");
  const perdidas = de("perdida");
  const total = nuevas + esperando + conversando + inscriptas + perdidas;

  // Una perdida por precio contestó y después no siguió; una perdida por
  // "nunca respondió", no. Contarlas todas como que no contestaron movía la
  // caída al escalón equivocado y hacía parecer que el problema era que no
  // contestan, cuando puede ser que contestan y no compran.
  const nuncaRespondieron = Number(
    motivos.find((m) => m.motivo === "nunca_respondio")?.cantidad || 0
  );
  const perdidasQueContestaron = Math.max(0, perdidas - nuncaRespondieron);

  return [
    { etiqueta: "Consultaron", cantidad: total },
    { etiqueta: "Se las contactó", cantidad: total - nuevas },
    {
      etiqueta: "Contestaron",
      cantidad: conversando + inscriptas + perdidasQueContestaron,
    },
    { etiqueta: "Se inscribieron", cantidad: inscriptas },
  ];
};

const EmbudoVentas = () => {
  const [m, setM] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getMetricasContactos()
      .then(setM)
      .catch((err) => setError(mensajeDeError(err, "cargar el embudo")))
      .finally(() => setCargando(false));
  }, []);

  if (cargando) return <p className="embudo-estado">Cargando el embudo…</p>;
  if (error) return <p className="embudo-error">{error}</p>;
  if (!m) return null;

  const total = (m.porEstado || []).reduce((s, e) => s + Number(e.cantidad), 0);
  const inscriptas = Number(
    (m.porEstado || []).find((e) => e.status === "inscripta")?.cantidad || 0
  );
  const perdidas = Number(
    (m.porEstado || []).find((e) => e.status === "perdida")?.cantidad || 0
  );
  const conversion = total ? Math.round((inscriptas / total) * 100) : 0;

  // Volumen y resultado juntos: el canal que trae mucho y convierte poco se ve
  // de una, sin tener que cruzar dos gráficos de memoria.
  const canales = (m.porOrigen || []).map((o) => ({
    etiqueta: legible(o.origin),
    consultas: Number(o.consultas) || 0,
    inscripciones: Number(o.inscripciones) || 0,
    tasa: o.consultas ? Math.round((o.inscripciones / o.consultas) * 100) : 0,
  }));

  return (
    <div className="embudo-vista">
      <div className="embudo-metricas">
        <Metrica
          rotulo="Esperando respuesta"
          valor={m.pendientes}
          detalle="Son los que hay que contactar"
          alerta={m.pendientes > 0}
        />
        <Metrica rotulo="Consultas totales" valor={total} />
        <Metrica rotulo="Se inscribieron" valor={inscriptas} />
        <Metrica rotulo="Conversión" valor={`${conversion}%`} detalle="Del total" />
      </div>

      <div className="embudo-grid">
        <Embudo
          titulo="Dónde se cae la gente"
          pasos={armarEmbudo(m.porEstado, m.motivosDePerdida)}
        />

        <Anillo
          titulo="En qué estado está cada contacto"
          datos={(m.porEstado || []).map((e) => ({
            etiqueta: legible(e.status),
            cantidad: Number(e.cantidad) || 0,
          }))}
        />

        <BarrasComparadas
          titulo="Qué trae cada canal y cuánto convierte"
          datos={canales}
          sufijoTasa="%"
          series={[
            { campo: "consultas", nombre: "Consultas", color: "#c08c44" },
            { campo: "inscripciones", nombre: "Se inscribieron", color: "#83711b" },
          ]}
        />

        <LineaTemporal
          titulo="Consultas e inscripciones por mes"
          datos={m.porMes || []}
          series={[
            { campo: "consultas", nombre: "Llegaron", color: "#c08c44" },
            { campo: "inscriptas", nombre: "Se inscribieron", color: "#83711b" },
          ]}
        />

        {perdidas > 0 && (
          <BarrasHorizontales
            titulo="Por qué se pierden"
            datos={(m.motivosDePerdida || []).map((x) => ({
              etiqueta: legible(x.motivo),
              cantidad: Number(x.cantidad) || 0,
            }))}
          />
        )}

        <BarrasComparadas
          titulo="Carga por vendedora"
          datos={(m.porVendedor || []).map((v) => ({
            etiqueta: legible(v.vendedor),
            abiertos: Number(v.abiertos) || 0,
            inscriptas: Number(v.inscriptas) || 0,
          }))}
          series={[
            { campo: "abiertos", nombre: "Abiertos", color: "#c08c44" },
            { campo: "inscriptas", nombre: "Cerró", color: "#83711b" },
          ]}
        />
      </div>
    </div>
  );
};

export default EmbudoVentas;
