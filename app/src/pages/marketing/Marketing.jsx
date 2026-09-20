import { useState, useEffect, useCallback } from "react";
import {
  getOpcionesMarketing,
  getGastos,
  registrarGasto,
  eliminarGasto,
  getMetricasInversion,
  getPlanilla,
} from "../../api/marketing";
import {
  BarrasHorizontales,
  LineaTemporal,
  Metrica,
} from "../../components/graficos/Graficos";
import BackLink from "../../components/backLink/BackLink";
import { mensajeDeError } from "../../utils/errores";
import "./Marketing.css";

/**
 * Marketing: conversiones, inversión y la planilla.
 *
 * Tres vistas de lo mismo, en el orden en que se miran: primero cuánta gente
 * entró y cuánta se inscribió, después qué costó traerla, y por último el
 * detalle fila por fila para cuando hay que buscar un caso puntual.
 *
 * Lo que esta pantalla nunca hace es mostrar un costo por inscripción a secas.
 * Siempre va con la cobertura de atribución al lado, porque el número calculado
 * es MÁS ALTO que el real: entre las consultas sin origen identificado hay
 * inscripciones de la pauta que no se están contando.
 */

const ETIQUETAS = {
  meta_ads: "Meta Ads",
  google_ads: "Google Ads",
  otro: "Otro",
  ig: "Instagram",
  fb: "Facebook",
  whatsapp: "WhatsApp",
  web: "Página web",
  referida: "Referida",
  autoregistro: "Se registró sola",
  no_identificado: "No identificado",
  sin_cargar: "Sin cargar",
  nueva: "Nueva",
  esperando_respuesta: "Esperando respuesta",
  en_conversacion: "En conversación",
  inscripta: "Inscripta",
  perdida: "Perdida",
};
const legible = (v) => ETIQUETAS[v] || v || "—";

const plata = (monto, moneda) =>
  `${moneda === "USD" ? "US$" : "$"} ${Number(monto).toLocaleString("es-AR", {
    maximumFractionDigits: 0,
  })}`;

const porcentaje = (v) => (v === null || v === undefined ? "—" : `${Math.round(v * 100)}%`);

const soloFecha = (f) => (f ? String(f).slice(0, 10) : "");

const mesDeHoy = () => new Date().toISOString().slice(0, 7);

const GASTO_VACIO = {
  platform: "meta_ads",
  campaign: "",
  period: mesDeHoy(),
  amount: "",
  currency: "ARS",
  notes: "",
};

const Marketing = () => {
  const [vista, setVista] = useState("conversiones");
  const [opciones, setOpciones] = useState({ plataformas: [], monedas: [] });
  const [gasto, setGasto] = useState(GASTO_VACIO);
  const [gastos, setGastos] = useState([]);
  const [metricas, setMetricas] = useState(null);
  const [planilla, setPlanilla] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    getOpcionesMarketing()
      .then((o) => setOpciones((previas) => ({ ...previas, ...o })))
      .catch(() => setError("No se pudieron cargar las opciones."));
  }, []);

  const cargar = useCallback(async () => {
    setCargando(true);
    // allSettled y no all: con all, una sola llamada caida dejaba la pantalla
    // entera vacia aunque las otras dos hubieran respondido bien.
    const [g, m, p] = await Promise.allSettled([
      getGastos(),
      getMetricasInversion(),
      getPlanilla(),
    ]);
    if (g.status === "fulfilled") setGastos(g.value);
    if (m.status === "fulfilled") setMetricas(m.value);
    if (p.status === "fulfilled") setPlanilla(p.value);

    const fallaron = [
      ["los gastos", g],
      ["las métricas", m],
      ["la planilla", p],
    ].filter(([, r]) => r.status === "rejected");

    if (fallaron.length === 3) {
      // Las tres juntas casi siempre son una sola causa: el servidor.
      setError(mensajeDeError(fallaron[0][1].reason, "cargar marketing"));
    } else if (fallaron.length) {
      setError(
        `No se pudo cargar ${fallaron.map(([n]) => n).join(" ni ")}. ` +
          "Lo demás se muestra igual."
      );
    } else {
      setError("");
    }
    setCargando(false);
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const cambiar = (e) => {
    const { name, value } = e.target;
    setGasto((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const guardar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError("");
    setAviso(null);
    try {
      // El input de mes da "2026-09"; la base guarda el primer día del mes.
      const { yaHabia } = await registrarGasto({ ...gasto, period: `${gasto.period}-01` });
      setAviso(yaHabia || null);
      setGasto({ ...GASTO_VACIO, period: gasto.period });
      await cargar();
    } catch (err) {
      setError(mensajeDeError(err, "cargar el gasto"));
    } finally {
      setGuardando(false);
    }
  };

  const borrar = async (id) => {
    try {
      await eliminarGasto(id);
      await cargar();
    } catch (err) {
      setError(mensajeDeError(err, "borrar el gasto"));
    }
  };

  const cobertura = metricas?.atribucion?.cobertura;
  const totalConsultas = metricas?.atribucion?.total ?? 0;
  const inscriptas = (metricas?.porOrigen || []).reduce(
    (s, o) => s + (Number(o.inscripciones) || 0),
    0
  );
  const conversion = totalConsultas ? inscriptas / totalConsultas : null;

  /** Conversión por canal: cuál trae gente que además se inscribe. */
  const conversionPorOrigen = (metricas?.porOrigen || [])
    .map((o) => ({
      etiqueta: legible(o.origin),
      consultas: o.consultas,
      inscripciones: o.inscripciones,
      tasa: o.consultas ? Math.round((o.inscripciones / o.consultas) * 100) : 0,
    }))
    .sort((a, b) => b.consultas - a.consultas);

  return (
    <div className="marketing">
      <BackLink />
      <header className="marketing-header">
        <h2>Marketing</h2>
        <div className="marketing-tabs">
          {[
            ["conversiones", "Conversiones"],
            ["inversion", "Inversión"],
            ["planilla", "Planilla"],
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

      {error && <p className="marketing-error">{error}</p>}
      {cargando && <p className="marketing-vacio">Cargando…</p>}

      {metricas && !cargando && vista === "conversiones" && (
        <>
          <div className="marketing-metricas">
            <Metrica rotulo="Consultas" valor={totalConsultas} />
            <Metrica rotulo="Se inscribieron" valor={inscriptas} />
            <Metrica
              rotulo="Conversión"
              valor={porcentaje(conversion)}
              detalle="Del total de consultas"
            />
            <Metrica
              rotulo="Con origen conocido"
              valor={porcentaje(cobertura)}
              detalle={`${metricas.atribucion.sin_identificar} sin identificar`}
              alerta={cobertura !== null && cobertura < 0.6}
            />
          </div>

          <div className="marketing-graficos">
            <LineaTemporal
              titulo="Consultas e inscripciones por mes"
              datos={metricas.porMes || []}
              series={[
                { campo: "consultas", nombre: "Consultas", color: "#c08c44" },
                { campo: "inscriptas", nombre: "Se inscribieron", color: "#83711b" },
              ]}
            />
            {/* La cobertura va en su propio gráfico y no mezclada con las
                consultas: es un porcentaje, no una cantidad, y compartir eje
                las haría ilegibles a las dos. */}
            <LineaTemporal
              titulo="De cuántas sabemos el origen"
              datos={(metricas.porMes || []).map((m) => ({
                ...m,
                cobertura_pct: Math.round((m.cobertura || 0) * 100),
                conversion_pct: Math.round((m.conversion || 0) * 100),
              }))}
              series={[
                { campo: "cobertura_pct", nombre: "Cobertura %", color: "#c08c44" },
                { campo: "conversion_pct", nombre: "Conversión %", color: "#83711b" },
              ]}
            />
          </div>

          <BarrasHorizontales
            titulo="De dónde llegaron las consultas"
            datos={conversionPorOrigen}
            campoValor="consultas"
          />

          <h3>Cuál canal convierte mejor</h3>
          <div className="marketing-tabla-scroll">
            <table className="marketing-tabla">
              <thead>
                <tr>
                  <th>Canal</th>
                  <th>Consultas</th>
                  <th>Inscriptas</th>
                  <th>Conversión</th>
                </tr>
              </thead>
              <tbody>
                {conversionPorOrigen.map((o) => (
                  <tr key={o.etiqueta}>
                    <td>{o.etiqueta}</td>
                    <td className="num">{o.consultas}</td>
                    <td className="num">{o.inscripciones}</td>
                    <td className="num">
                      <span className="barra">
                        <span style={{ width: `${o.tasa}%` }} />
                      </span>
                      {o.tasa}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {metricas && !cargando && vista === "inversion" && (
        <>
          <p className="marketing-ayuda">
            El gasto sale de Meta y de Google, así que hay que cargarlo a mano. Es
            lo único que falta para saber cuánto cuesta cada inscripción.
          </p>

          <form className="marketing-form" onSubmit={guardar}>
            <div className="marketing-form-grid">
              <div className="campo">
                <label htmlFor="mk-plataforma">Plataforma</label>
                <select id="mk-plataforma" name="platform" value={gasto.platform} onChange={cambiar}>
                  {(opciones.plataformas || []).map((p) => (
                    <option key={p} value={p}>
                      {legible(p)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="campo">
                <label htmlFor="mk-mes">Mes</label>
                <input id="mk-mes" name="period" type="month" value={gasto.period} onChange={cambiar} required />
              </div>

              <div className="campo">
                <label htmlFor="mk-monto">Gastado</label>
                <input
                  id="mk-monto"
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={gasto.amount}
                  onChange={cambiar}
                  required
                />
              </div>

              <div className="campo">
                <label htmlFor="mk-moneda">Moneda</label>
                <select id="mk-moneda" name="currency" value={gasto.currency} onChange={cambiar}>
                  {(opciones.monedas || []).map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div className="campo">
                <label htmlFor="mk-campana">Campaña (opcional)</label>
                <input
                  id="mk-campana"
                  name="campaign"
                  value={gasto.campaign}
                  onChange={cambiar}
                  placeholder="Profesorados — septiembre"
                />
              </div>
            </div>

            <div className="marketing-form-acciones">
              <button type="submit" className="btn-principal" disabled={guardando}>
                {guardando ? "Guardando…" : "Cargar gasto"}
              </button>
            </div>

            {aviso && (
              <div className="marketing-aviso">
                <strong>Ojo: ya había gasto cargado para esa plataforma y ese mes.</strong>
                <ul>
                  {aviso.map((a) => (
                    <li key={a.id}>
                      {plata(a.amount, a.currency)}
                      {a.campaign ? ` · ${a.campaign}` : ""}
                    </li>
                  ))}
                </ul>
                <p>
                  Se cargó igual. Si es el mismo gasto cargado dos veces, borrá uno:
                  duplicarlo hace que el costo por inscripción se vea peor de lo que es.
                </p>
              </div>
            )}
          </form>

          <h3>Qué costó cada consulta</h3>

          {metricas.porPlataforma.length === 0 ? (
            <p className="marketing-vacio">
              Todavía no hay gasto cargado, así que no hay costos que calcular.
            </p>
          ) : (
            <div className="marketing-tarjetas">
              {metricas.porPlataforma.map((p) => (
                <div key={`${p.platform}-${p.currency}`} className="marketing-tarjeta">
                  <span className="plataforma">{legible(p.platform)}</span>
                  <span className="gasto">{plata(p.gasto, p.currency)}</span>
                  <dl>
                    <div>
                      <dt>Consultas</dt>
                      <dd>{p.consultas}</dd>
                    </div>
                    <div>
                      <dt>Inscripciones</dt>
                      <dd>{p.inscripciones}</dd>
                    </div>
                    <div>
                      <dt>Por consulta</dt>
                      <dd>
                        {p.costo_por_consulta === null ? "—" : plata(p.costo_por_consulta, p.currency)}
                      </dd>
                    </div>
                    <div>
                      <dt>Por inscripción</dt>
                      <dd>
                        {p.costo_por_inscripcion === null
                          ? "—"
                          : plata(p.costo_por_inscripcion, p.currency)}
                      </dd>
                    </div>
                  </dl>
                </div>
              ))}
            </div>
          )}

          <div className={`marketing-cobertura ${cobertura !== null && cobertura < 0.6 ? "floja" : ""}`}>
            <strong>Sabemos de dónde vinieron {porcentaje(cobertura)} de las consultas</strong>
            <span>
              {metricas.atribucion.identificadas} de {metricas.atribucion.total} ·{" "}
              {metricas.atribucion.sin_identificar} sin identificar
            </span>
            <p>
              Los costos de arriba se calculan sólo sobre las consultas con origen
              conocido, así que el costo real por inscripción es <em>más bajo</em> que
              el que se muestra: entre las que no se identificaron hay inscripciones de
              la pauta que no se están contando.
            </p>
          </div>

          <h3>Gastos cargados</h3>
          {gastos.length === 0 ? (
            <p className="marketing-vacio">Todavía no cargaste ningún gasto.</p>
          ) : (
            <div className="marketing-tabla-scroll">
              <table className="marketing-tabla">
                <thead>
                  <tr>
                    <th>Mes</th>
                    <th>Plataforma</th>
                    <th>Campaña</th>
                    <th>Gastado</th>
                    <th>Cargó</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {gastos.map((g) => (
                    <tr key={g.id}>
                      <td>{String(g.period).slice(0, 7)}</td>
                      <td>{legible(g.platform)}</td>
                      <td>{g.campaign || "—"}</td>
                      <td className="num">{plata(g.amount, g.currency)}</td>
                      <td>{g.cargado_por || "—"}</td>
                      <td>
                        <button type="button" className="marketing-borrar" onClick={() => borrar(g.id)}>
                          Borrar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {!cargando && vista === "planilla" && (
        <>
          <p className="marketing-ayuda">
            Las mismas columnas de la hoja que se llenaba a mano, pero armadas
            solas con lo que se carga en el CRM y en pagos. El importe sale de los
            pagos reales, por eso va separado por moneda.
          </p>

          {planilla.length === 0 ? (
            <p className="marketing-vacio">No hay consultas cargadas.</p>
          ) : (
            <div className="marketing-tabla-scroll">
              <table className="marketing-tabla planilla">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Nombre</th>
                    <th>País</th>
                    <th>Formación</th>
                    <th>Origen</th>
                    <th>Estado</th>
                    <th>Inscripta</th>
                    <th>Pagado</th>
                  </tr>
                </thead>
                <tbody>
                  {planilla.map((f) => (
                    <tr key={f.id} className={f.inscripta ? "es-inscripta" : ""}>
                      <td>{soloFecha(f.fecha)}</td>
                      <td>{f.nombre}</td>
                      <td>{f.pais || "—"}</td>
                      <td>{f.formacion || "—"}</td>
                      <td>{legible(f.origen)}</td>
                      <td>{legible(f.estado)}</td>
                      <td>{f.inscripta ? "Sí" : "No"}</td>
                      <td className="num">
                        {Number(f.pagado_ars) > 0 && <div>{plata(f.pagado_ars, "ARS")}</div>}
                        {Number(f.pagado_usd) > 0 && <div>{plata(f.pagado_usd, "USD")}</div>}
                        {Number(f.pagado_ars) === 0 && Number(f.pagado_usd) === 0 && "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Marketing;
