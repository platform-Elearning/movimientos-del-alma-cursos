import { useState, useEffect, useCallback } from "react";
import {
  getOpcionesMarketing,
  getGastos,
  registrarGasto,
  eliminarGasto,
  getMetricasInversion,
} from "../../api/marketing";
import BackLink from "../../components/backLink/BackLink";
import "./Marketing.css";

/**
 * Inversión en publicidad y cuánto costó cada consulta e inscripción.
 *
 * Lo que esta pantalla nunca hace es mostrar un costo por inscripción a secas.
 * Siempre va con la cobertura de atribución al lado, porque el número calculado
 * es MÁS ALTO que el real: entre las consultas sin origen identificado hay
 * inscripciones de la pauta que no se están contando. Sin ese contexto, el
 * número parece confiable y no lo es.
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
};
const legible = (v) => ETIQUETAS[v] || v || "—";

const plata = (monto, moneda) =>
  `${moneda === "USD" ? "US$" : "$"} ${Number(monto).toLocaleString("es-AR", {
    maximumFractionDigits: 0,
  })}`;

const porcentaje = (v) => (v === null || v === undefined ? "—" : `${Math.round(v * 100)}%`);

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
  const [opciones, setOpciones] = useState({ plataformas: [], monedas: [] });
  const [gasto, setGasto] = useState(GASTO_VACIO);
  const [gastos, setGastos] = useState([]);
  const [metricas, setMetricas] = useState(null);
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
    try {
      const [g, m] = await Promise.all([getGastos(), getMetricasInversion()]);
      setGastos(g);
      setMetricas(m);
      setError("");
    } catch {
      setError("No se pudo cargar la inversión.");
    } finally {
      setCargando(false);
    }
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
      const { yaHabia } = await registrarGasto({
        ...gasto,
        period: `${gasto.period}-01`,
      });
      setAviso(yaHabia || null);
      setGasto({ ...GASTO_VACIO, period: gasto.period });
      await cargar();
    } catch (err) {
      const delBackend = err?.response?.data?.error;
      setError(
        delBackend ||
          `No se pudo cargar el gasto por un error del servidor${
            err?.response?.status ? ` (${err.response.status})` : ""
          }.`
      );
    } finally {
      setGuardando(false);
    }
  };

  const borrar = async (id) => {
    try {
      await eliminarGasto(id);
      await cargar();
    } catch {
      setError("No se pudo borrar el gasto.");
    }
  };

  const cobertura = metricas?.atribucion?.cobertura;

  return (
    <div className="marketing">
      <BackLink />
      <header className="marketing-header">
        <h2>Inversión en publicidad</h2>
        <p>
          El gasto sale de Meta y de Google, así que hay que cargarlo a mano. Es
          lo único que falta para saber cuánto cuesta cada inscripción.
        </p>
      </header>

      {error && <p className="marketing-error">{error}</p>}

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

      {cargando && <p className="marketing-vacio">Cargando…</p>}

      {metricas && !cargando && (
        <>
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
                        {p.costo_por_consulta === null
                          ? "—"
                          : plata(p.costo_por_consulta, p.currency)}
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

          {/* La cobertura va pegada a los costos, no escondida abajo: es lo que
              dice si esos números se pueden usar o no. */}
          <div className={`marketing-cobertura ${cobertura !== null && cobertura < 0.6 ? "floja" : ""}`}>
            <strong>
              Sabemos de dónde vinieron {porcentaje(cobertura)} de las consultas
            </strong>
            <span>
              {metricas.atribucion.identificadas} de {metricas.atribucion.total} ·{" "}
              {metricas.atribucion.sin_identificar} sin identificar
            </span>
            <p>
              Los costos de arriba se calculan sólo sobre las consultas con origen
              conocido, así que el costo real por inscripción es <em>más bajo</em>{" "}
              que el que se muestra: entre las que no se identificaron hay
              inscripciones de la pauta que no se están contando.
            </p>
          </div>

          {metricas.coberturaPorMes.length > 0 && (
            <>
              <h3>Cómo viene la atribución mes a mes</h3>
              <div className="marketing-tabla-scroll">
                <table className="marketing-tabla">
                  <thead>
                    <tr>
                      <th>Mes</th>
                      <th>Consultas</th>
                      <th>Con origen</th>
                      <th>Cobertura</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metricas.coberturaPorMes.map((m) => (
                      <tr key={m.mes}>
                        <td>{m.mes}</td>
                        <td className="num">{m.consultas}</td>
                        <td className="num">{m.identificadas}</td>
                        <td className="num">
                          <span className="barra">
                            <span style={{ width: `${(m.cobertura || 0) * 100}%` }} />
                          </span>
                          {porcentaje(m.cobertura)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          <h3>De dónde entraron las consultas</h3>
          <div className="marketing-origenes">
            {metricas.porOrigen.map((o) => (
              <span key={o.origin} className="marketing-origen">
                {legible(o.origin)}
                <strong>{o.consultas}</strong>
                <small>{o.inscripciones} inscriptas</small>
              </span>
            ))}
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
                        <button
                          type="button"
                          className="marketing-borrar"
                          onClick={() => borrar(g.id)}
                        >
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
    </div>
  );
};

export default Marketing;
