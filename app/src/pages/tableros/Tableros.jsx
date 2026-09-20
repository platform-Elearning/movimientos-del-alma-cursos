import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMetricasContactos } from "../../api/contactos";
import { getFacturacion } from "../../api/pagos";
import { getMetricasInversion } from "../../api/marketing";
import { BarrasHorizontales, LineaTemporal, Metrica } from "../../components/graficos/Graficos";
import BackLink from "../../components/backLink/BackLink";
import { mensajeDeError } from "../../utils/errores";
import "./Tableros.css";

/**
 * El tablero de todo: las cifras que se miran primero y desde dónde entrar al
 * detalle.
 *
 * No repite lo que ya hacen los tableros específicos. Muestra lo que sólo se ve
 * cruzándolos -- cuánta gente entró, cuánta se inscribió y cuánto facturó -- y
 * de ahí manda al que corresponda.
 *
 * Lo que este tablero NO puede mostrar, y conviene saberlo: egresos, reparto
 * entre socios y resultado neto. Eso vive en mda-analytics, que se alimenta de
 * un CSV cargado a mano, porque esta base no tiene gastos de profesores ni
 * distribuciones. Mostrar un "resultado" acá sería inventarlo.
 */

const plata = (monto, moneda) =>
  `${moneda === "USD" ? "US$" : "$"} ${Number(monto).toLocaleString("es-AR", {
    maximumFractionDigits: 0,
  })}`;

const porcentaje = (v) => (v === null || v === undefined ? "—" : `${Math.round(v * 100)}%`);

/**
 * La serie mensual de facturación llega con una fila por mes y moneda. Se pivota
 * a una fila por mes con una columna por moneda, que es lo que el gráfico
 * necesita, y sin sumarlas entre sí.
 */
const pivotarPorMoneda = (filas) => {
  const meses = {};
  for (const f of filas) {
    meses[f.mes] = meses[f.mes] || { mes: f.mes, ARS: 0, USD: 0 };
    meses[f.mes][f.currency] = Number(f.total) || 0;
  }
  return Object.values(meses).sort((a, b) => a.mes.localeCompare(b.mes));
};

const Tableros = () => {
  const navigate = useNavigate();
  const [contactos, setContactos] = useState(null);
  const [fact, setFact] = useState(null);
  const [inversion, setInversion] = useState(null);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // allSettled y no all: si un tablero falla, los otros se muestran igual.
    // Con all, un error en marketing dejaba la pantalla entera en blanco.
    Promise.allSettled([getMetricasContactos(), getFacturacion(), getMetricasInversion()])
      .then(([c, f, i]) => {
        if (c.status === "fulfilled") setContactos(c.value);
        if (f.status === "fulfilled") setFact(f.value);
        if (i.status === "fulfilled") setInversion(i.value);
        if ([c, f, i].every((r) => r.status === "rejected")) {
          setError(mensajeDeError(c.reason, "cargar los tableros"));
        }
      })
      .finally(() => setCargando(false));
  }, []);

  if (cargando) return <p className="tableros-estado">Cargando los tableros…</p>;

  const totalConsultas = contactos
    ? (contactos.porEstado || []).reduce((s, e) => s + Number(e.cantidad), 0)
    : 0;
  const inscriptas = contactos
    ? Number((contactos.porEstado || []).find((e) => e.status === "inscripta")?.cantidad || 0)
    : 0;
  const conversion = totalConsultas ? inscriptas / totalConsultas : null;

  const facturadoARS = fact
    ? (fact.porMes || []).filter((m) => m.currency === "ARS").reduce((s, m) => s + Number(m.total), 0)
    : 0;
  const facturadoUSD = fact
    ? (fact.porMes || []).filter((m) => m.currency === "USD").reduce((s, m) => s + Number(m.total), 0)
    : 0;

  const cobertura = inversion?.atribucion?.cobertura ?? null;

  return (
    <div className="tableros">
      <BackLink />
      <header className="tableros-header">
        <h2>Tableros</h2>
        <p>Las cifras de arriba de todo, y desde acá al detalle de cada una.</p>
      </header>

      {error && <p className="tableros-error">{error}</p>}

      <div className="tableros-metricas">
        <Metrica rotulo="Consultas" valor={totalConsultas} />
        <Metrica rotulo="Se inscribieron" valor={inscriptas} />
        <Metrica rotulo="Conversión" valor={porcentaje(conversion)} />
        <Metrica
          rotulo="Esperando respuesta"
          valor={contactos?.pendientes ?? 0}
          detalle="Hay que escribirles"
          alerta={(contactos?.pendientes ?? 0) > 0}
        />
      </div>

      <div className="tableros-metricas">
        <Metrica rotulo="Facturado en pesos" valor={plata(facturadoARS, "ARS")} />
        <Metrica rotulo="Facturado en dólares" valor={plata(facturadoUSD, "USD")} />
        <Metrica
          rotulo="Con origen conocido"
          valor={porcentaje(cobertura)}
          detalle="Sobre esto se calculan los costos"
          alerta={cobertura !== null && cobertura < 0.6}
        />
      </div>

      <div className="tableros-graficos">
        {contactos && (
          <LineaTemporal
            titulo="Consultas e inscripciones por mes"
            datos={contactos.porMes || []}
            series={[
              { campo: "ingresados", nombre: "Llegaron", color: "#c08c44" },
              { campo: "inscriptas", nombre: "Se inscribieron", color: "#83711b" },
            ]}
          />
        )}
        {fact && (
          <LineaTemporal
            titulo="Facturación mensual"
            datos={pivotarPorMoneda(fact.porMes || [])}
            series={[
              { campo: "ARS", nombre: "Pesos", color: "#c08c44" },
              { campo: "USD", nombre: "Dólares", color: "#83711b" },
            ]}
          />
        )}
      </div>

      {fact && (
        <BarrasHorizontales
          titulo="Facturación por formación (pesos)"
          datos={(fact.porCurso || [])
            .filter((c) => c.currency === "ARS")
            .map((c) => ({ etiqueta: c.curso, total: Number(c.total) }))}
          campoValor="total"
        />
      )}

      <h3>Entrar al detalle</h3>
      <div className="tableros-accesos">
        {[
          ["Embudo de ventas", "Estados, orígenes y motivos de pérdida", "/admin/tablero"],
          ["Seguimiento", "A quién hay que escribirle hoy", "/admin/seguimiento"],
          ["Pagos", "Ficha por alumna y cierre del mes", "/admin/pagos"],
          ["Marketing", "Conversiones, inversión y planilla", "/admin/marketing"],
        ].map(([titulo, detalle, ruta]) => (
          <button key={ruta} type="button" className="tableros-acceso" onClick={() => navigate(ruta)}>
            <strong>{titulo}</strong>
            <span>{detalle}</span>
          </button>
        ))}
      </div>

      <p className="tableros-nota">
        Los egresos, el reparto entre socios y el resultado neto no salen de acá:
        viven en <code>mda-analytics</code>, que se carga aparte. Esta base no
        tiene gastos de profesores ni distribuciones, y un «resultado» calculado
        sin eso sería inventado.
      </p>
    </div>
  );
};

export default Tableros;
