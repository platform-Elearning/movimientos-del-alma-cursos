import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getOpcionesPago,
  buscarAlumnas,
  getPagosDeAlumna,
  registrarPago,
  getPagosDelPeriodo,
} from "../../api/pagos";
import BackLink from "../../components/backLink/BackLink";
import { mensajeDeError } from "../../utils/errores";
import { hoyLocal, mesCorriente } from "../../utils/fechas";
import { legibleOpcional as legible } from "../../utils/etiquetas";
import "./Pagos.css";

/**
 * Pagos: la ficha de una alumna y el cierre del mes.
 *
 * Son las dos preguntas que hoy se contestan con una planilla, y son distintas:
 * "¿esta alumna está al día?" se mira parada sobre la persona, y "¿cuánto entró
 * en septiembre?" se mira sobre el mes. Por eso son dos pestañas y no una lista
 * con filtros.
 *
 * El pago se carga SIEMPRE desde la ficha de la alumna, nunca desde la lista
 * del mes: un pago siempre es de alguien, y elegir a la persona de un
 * desplegable en una lista general es como se cargan pagos a la alumna
 * equivocada.
 */


/** Los importes se muestran con su moneda pegada: nunca un número solo. */
const plata = (monto, moneda) =>
  `${moneda === "USD" ? "US$" : "$"} ${Number(monto).toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const soloFecha = (f) => (f ? String(f).slice(0, 10) : "");

const PAGO_VACIO = {
  concept: "modulo",
  modules_count: 1,
  amount: "",
  currency: "ARS",
  method: "transferencia",
  paid_at: hoyLocal(),
  notes: "",
  enrollment_id: "",
};

const Pagos = () => {
  const navigate = useNavigate();
  const [vista, setVista] = useState("alumna");
  const [opciones, setOpciones] = useState({ conceptos: [], monedas: [], metodos: [] });

  const [busqueda, setBusqueda] = useState("");
  const [alumnas, setAlumnas] = useState([]);
  const [elegida, setElegida] = useState(null);
  const [ficha, setFicha] = useState(null);

  const [pago, setPago] = useState(PAGO_VACIO);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");

  const [periodo, setPeriodo] = useState(mesCorriente());
  const [mes, setMes] = useState(null);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    getOpcionesPago()
      // Se mezcla con el estado inicial: si el backend no manda alguna lista,
      // el .map de más abajo no puede quedar sin nada sobre qué iterar.
      .then((o) => setOpciones((previas) => ({ ...previas, ...o })))
      .catch(() => setError("No se pudieron cargar las opciones de pago."));
  }, []);

  // El buscador espera a que se deje de tipear: sin esto sale una consulta por
  // cada tecla.
  useEffect(() => {
    // vigente descarta la respuesta de una búsqueda que ya quedó vieja: sin
    // esto, escribir rápido puede hacer que la respuesta de "ma" llegue después
    // de la de "marta" y pise la lista con resultados que no corresponden.
    let vigente = true;
    const t = setTimeout(() => {
      buscarAlumnas(busqueda)
        .then((r) => vigente && setAlumnas(r))
        .catch(() => vigente && setAlumnas([]));
    }, 300);
    return () => {
      vigente = false;
      clearTimeout(t);
    };
  }, [busqueda]);

  const cargarFicha = useCallback(async (studentId) => {
    try {
      setError("");
      setFicha(await getPagosDeAlumna(studentId));
    } catch (err) {
      setError(mensajeDeError(err, "cargar la ficha de la alumna"));
    }
  }, []);

  const elegir = async (alumna) => {
    setElegida(alumna);
    setAviso("");
    setPago(PAGO_VACIO);
    await cargarFicha(alumna.id);
  };

  const cargarMes = useCallback(async () => {
    setCargando(true);
    setError("");
    try {
      setMes(await getPagosDelPeriodo(periodo));
    } catch (err) {
      setError(mensajeDeError(err, "cargar el período"));
    } finally {
      setCargando(false);
    }
  }, [periodo]);

  useEffect(() => {
    if (vista === "mes") cargarMes();
  }, [vista, cargarMes]);

  // Si la alumna no está inscripta a ninguna formación, "módulo" sale de la
  // lista de conceptos: el concepto elegido tiene que salir con él, o el
  // selector queda mostrando un valor que ya no ofrece.
  useEffect(() => {
    if (ficha && ficha.modulos.length === 0) {
      setPago((prev) =>
        prev.concept === "modulo"
          ? { ...prev, concept: "matricula", modules_count: "" }
          : prev
      );
    }
  }, [ficha]);

  const cambiarPago = (e) => {
    const { name, value } = e.target;
    setPago((prev) => {
      const siguiente = { ...prev, [name]: value };
      // Contar módulos sólo tiene sentido en un pago de módulos; la base tiene
      // el mismo constraint y mandarlo igual sería un error opaco.
      if (name === "concept" && value !== "modulo") siguiente.modules_count = "";
      if (name === "concept" && value === "modulo" && !prev.modules_count) {
        siguiente.modules_count = 1;
      }
      return siguiente;
    });
    setError("");
  };

  const guardar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError("");
    setAviso("");
    try {
      await registrarPago({
        ...pago,
        student_id: elegida.id,
        enrollment_id: pago.enrollment_id || undefined,
        modules_count: pago.concept === "modulo" ? Number(pago.modules_count) || 1 : undefined,
      });
      setPago(PAGO_VACIO);
      setAviso("Pago registrado.");
      await cargarFicha(elegida.id);
    } catch (err) {
      setError(mensajeDeError(err, "registrar el pago"));
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="pagos">
      <BackLink title="Volver" onClick={() => navigate(-1)} />
      <header className="pagos-header">
        <h2>Pagos</h2>
        <div className="pagos-tabs">
          <button
            type="button"
            className={vista === "alumna" ? "activa" : ""}
            onClick={() => setVista("alumna")}
          >
            Por alumna
          </button>
          <button
            type="button"
            className={vista === "mes" ? "activa" : ""}
            onClick={() => setVista("mes")}
          >
            Cierre del mes
          </button>
        </div>
      </header>

      {error && <p className="pagos-error">{error}</p>}

      {vista === "alumna" && (
        <div className="pagos-columnas">
          <aside className="pagos-buscador">
            <label htmlFor="pg-busqueda">Buscar alumna</label>
            <input
              id="pg-busqueda"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Nombre, apellido o DNI"
            />
            <ul>
              {alumnas.map((a) => (
                <li key={a.id}>
                  <button
                    type="button"
                    className={elegida?.id === a.id ? "elegida" : ""}
                    onClick={() => elegir(a)}
                  >
                    <strong>
                      {a.name} {a.lastname}
                    </strong>
                    <span>{a.identification_number || "sin DNI"}</span>
                  </button>
                </li>
              ))}
              {alumnas.length === 0 && <li className="vacio">Sin resultados</li>}
            </ul>
          </aside>

          <section className="pagos-ficha">
            {!elegida && <p className="pagos-vacio">Elegí una alumna para ver sus pagos.</p>}

            {elegida && ficha && (
              <>
                <h3>
                  {elegida.name} {elegida.lastname}
                </h3>

                {/* Lo primero: por qué módulo va. Es la pregunta que se hace
                    antes de habilitarle el siguiente. */}
                {ficha.modulos.length > 0 ? (
                  <div className="pagos-modulos">
                    {ficha.modulos.map((m) => (
                      <div
                        key={m.enrollment_id}
                        className={`pagos-modulo ${m.al_dia ? "al-dia" : "debe"}`}
                      >
                        <span className="curso">{m.course_name}</span>
                        <span className="proximo">
                          El siguiente módulo a abonar es el{" "}
                          <strong>{m.proximo_modulo_a_abonar}</strong>
                        </span>
                        <span className="detalle">
                          Pagó {m.modulos_pagados} · tiene habilitados {m.modulos_habilitados}
                          {!m.al_dia && ` · debe ${m.modulos_adeudados}`}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="pagos-sin-inscripcion">
                    Todavía no está inscripta a ninguna formación.
                  </p>
                )}

                <div className="pagos-totales">
                  {ficha.totales.length === 0 && <span>Sin pagos registrados</span>}
                  {ficha.totales.map((t) => (
                    <span key={t.currency} className="pagos-total">
                      {plata(t.total, t.currency)}
                      <small>
                        {t.cantidad} pago{t.cantidad === 1 ? "" : "s"}
                      </small>
                    </span>
                  ))}
                </div>

                <form className="pagos-form" onSubmit={guardar}>
                  <h4>Registrar un pago</h4>
                  <div className="pagos-form-grid">
                    <div className="campo">
                      <label htmlFor="pg-concepto">Concepto</label>
                      <select
                        id="pg-concepto"
                        name="concept"
                        value={pago.concept}
                        onChange={cambiarPago}
                      >
                        {(opciones.conceptos || [])
                          // Sin inscripción no hay módulos que pagar: el pago no
                          // tendría dónde sumar.
                          .filter((c) => c !== "modulo" || ficha.modulos.length > 0)
                          .map((c) => (
                            <option key={c} value={c}>
                              {legible(c)}
                            </option>
                          ))}
                      </select>
                    </div>

                    {pago.concept === "modulo" && (
                      <div className="campo">
                        <label htmlFor="pg-modulos">Cuántos módulos cubre</label>
                        <input
                          id="pg-modulos"
                          name="modules_count"
                          type="number"
                          min="1"
                          max="12"
                          value={pago.modules_count}
                          onChange={cambiarPago}
                        />
                      </div>
                    )}

                    <div className="campo">
                      <label htmlFor="pg-monto">Importe</label>
                      <input
                        id="pg-monto"
                        name="amount"
                        type="number"
                        step="0.01"
                        min="0"
                        value={pago.amount}
                        onChange={cambiarPago}
                        required
                      />
                    </div>

                    <div className="campo">
                      <label htmlFor="pg-moneda">Moneda</label>
                      <select
                        id="pg-moneda"
                        name="currency"
                        value={pago.currency}
                        onChange={cambiarPago}
                      >
                        {(opciones.monedas || []).map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="campo">
                      <label htmlFor="pg-metodo">Medio</label>
                      <select
                        id="pg-metodo"
                        name="method"
                        value={pago.method}
                        onChange={cambiarPago}
                      >
                        {(opciones.metodos || []).map((m) => (
                          <option key={m} value={m}>
                            {legible(m)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="campo">
                      <label htmlFor="pg-fecha">Cuándo entró</label>
                      <input
                        id="pg-fecha"
                        name="paid_at"
                        type="date"
                        value={pago.paid_at}
                        onChange={cambiarPago}
                      />
                    </div>

                    {ficha.modulos.length > 0 && (
                      <div className="campo">
                        <label htmlFor="pg-formacion">
                          Por qué formación{pago.concept === "modulo" ? " *" : ""}
                        </label>
                        <select
                          id="pg-formacion"
                          name="enrollment_id"
                          value={pago.enrollment_id}
                          onChange={cambiarPago}
                          required={pago.concept === "modulo"}
                        >
                          {/* Un pago de módulos sin formación no sumaría al
                              contador de módulos habilitados. */}
                          <option value="">
                            {pago.concept === "modulo" ? "Elegí la formación" : "Sin formación"}
                          </option>
                          {ficha.modulos.map((m) => (
                            <option key={m.enrollment_id} value={m.enrollment_id}>
                              {m.course_name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="campo campo-ancho">
                      <label htmlFor="pg-notas">Nota</label>
                      <input
                        id="pg-notas"
                        name="notes"
                        value={pago.notes}
                        onChange={cambiarPago}
                        placeholder="Pagó el módulo 3 con descuento por hermana"
                      />
                    </div>
                  </div>

                  {aviso && <p className="pagos-aviso">{aviso}</p>}

                  <div className="pagos-form-acciones">
                    <button type="submit" className="btn-principal" disabled={guardando}>
                      {guardando ? "Registrando…" : "Registrar pago"}
                    </button>
                  </div>
                </form>

                <h4 className="pagos-subtitulo">Pagos registrados</h4>
                {ficha.pagos.length === 0 ? (
                  <p className="pagos-vacio">Todavía no tiene pagos cargados.</p>
                ) : (
                  <div className="pagos-tabla-scroll">
                    <table className="pagos-tabla">
                      <thead>
                        <tr>
                          <th>Fecha</th>
                          <th>Concepto</th>
                          <th>Importe</th>
                          <th>Medio</th>
                          <th>Formación</th>
                          <th>Cargó</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ficha.pagos.map((p) => (
                          <tr key={p.id}>
                            <td>{soloFecha(p.paid_at)}</td>
                            <td>
                              {legible(p.concept)}
                              {p.modules_count ? ` ×${p.modules_count}` : ""}
                            </td>
                            <td className="num">{plata(p.amount, p.currency)}</td>
                            <td>{legible(p.method)}</td>
                            <td>{p.course_name || "—"}</td>
                            <td>{p.cargado_por || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      )}

      {vista === "mes" && (
        <section className="pagos-mes">
          <div className="pagos-periodo">
            <div className="campo">
              <label htmlFor="pg-desde">Desde</label>
              <input
                id="pg-desde"
                type="date"
                value={periodo.desde}
                onChange={(e) => setPeriodo((p) => ({ ...p, desde: e.target.value }))}
              />
            </div>
            <div className="campo">
              <label htmlFor="pg-hasta">Hasta</label>
              <input
                id="pg-hasta"
                type="date"
                value={periodo.hasta}
                onChange={(e) => setPeriodo((p) => ({ ...p, hasta: e.target.value }))}
              />
            </div>
            <button type="button" className="btn-principal" onClick={cargarMes}>
              Ver
            </button>
          </div>

          {cargando && <p className="pagos-vacio">Cargando…</p>}

          {mes && !cargando && (
            <>
              <div className="pagos-totales">
                {mes.totales.length === 0 && <span>No entró nada en este período</span>}
                {/* Un total por moneda, nunca sumados entre sí. */}
                {mes.totales.map((t) => (
                  <span key={t.currency} className="pagos-total">
                    {plata(t.total, t.currency)}
                    <small>
                      {t.cantidad} pago{t.cantidad === 1 ? "" : "s"}
                    </small>
                  </span>
                ))}
              </div>

              {mes.porConcepto.length > 0 && (
                <div className="pagos-por-concepto">
                  {mes.porConcepto.map((c) => (
                    <span key={`${c.concept}-${c.currency}`}>
                      {legible(c.concept)}: <strong>{plata(c.total, c.currency)}</strong>
                    </span>
                  ))}
                </div>
              )}

              {mes.pagos.length === 0 ? (
                <p className="pagos-vacio">Sin pagos en el período.</p>
              ) : (
                <div className="pagos-tabla-scroll">
                  <table className="pagos-tabla">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Alumna</th>
                        <th>Concepto</th>
                        <th>Importe</th>
                        <th>Medio</th>
                        <th>Formación</th>
                        <th>Cargó</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mes.pagos.map((p) => (
                        <tr key={p.id}>
                          <td>{soloFecha(p.paid_at)}</td>
                          <td>
                            {p.name} {p.lastname}
                          </td>
                          <td>
                            {legible(p.concept)}
                            {p.modules_count ? ` ×${p.modules_count}` : ""}
                          </td>
                          <td className="num">{plata(p.amount, p.currency)}</td>
                          <td>{legible(p.method)}</td>
                          <td>{p.course_name || "—"}</td>
                          <td>{p.cargado_por || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </section>
      )}
    </div>
  );
};

export default Pagos;
