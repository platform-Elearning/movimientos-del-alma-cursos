import { useState, useEffect } from "react";
import { getResumenMes } from "../../api/marketing";
import { Metrica } from "../../components/graficos/Graficos";
import { mensajeDeError } from "../../utils/errores";
import { legibleOpcional as legible } from "../../utils/etiquetas";
import { mesLocal } from "../../utils/fechas";
import { plataRedonda, porcentaje, veces } from "../../utils/formato";
import { conVariacion, explicarCostos, nombreDelMes } from "../../utils/resumen";

/**
 * El resumen del mes: la pestaña RESUMEN de la planilla, calculada sola con lo
 * que se carga en el CRM, en pagos y en marketing.
 *
 * El costo se muestra de las dos maneras, una al lado de la otra:
 *  - del mes completo, como la planilla: todo el gasto contra todo lo que
 *    entró. Siempre se puede calcular, pero le atribuye a la pauta hasta lo que
 *    llegó solo;
 *  - atribuido: cada plataforma contra las consultas con ese origen. Es más
 *    preciso, y vale tanto como la cobertura, que va pegada.
 *
 * Los ingresos son lo que pagaron las inscriptas del mes en el mes en que se
 * inscribieron. Todo va separado por moneda.
 */

const ResumenMes = () => {
  const [mes, setMes] = useState(mesLocal());
  const [resumen, setResumen] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // vigente descarta la respuesta de un mes que ya no es el elegido: cambiar
    // rápido de mes no puede dejar en pantalla los números del anterior.
    let vigente = true;
    setCargando(true);
    setError("");
    getResumenMes(mes)
      .then((r) => vigente && setResumen(r))
      .catch((err) => vigente && setError(mensajeDeError(err, "calcular el resumen del mes")))
      .finally(() => vigente && setCargando(false));
    return () => {
      vigente = false;
    };
  }, [mes]);

  const actual = resumen?.actual;
  const previo = resumen?.previo;
  const anterior = resumen ? nombreDelMes(resumen.anterior).split(" ")[0].toLowerCase() : "";
  const previoDe = (moneda) => previo?.porMoneda.find((m) => m.currency === moneda);
  const cobertura = actual?.atribucion.cobertura;

  return (
    <section className="resumen-mes">
      <div className="resumen-mes-encabezado">
        <div className="campo">
          <label htmlFor="rm-mes">Mes</label>
          <input
            id="rm-mes"
            type="month"
            value={mes}
            onChange={(e) => e.target.value && setMes(e.target.value)}
          />
        </div>
        {resumen && <h3>{nombreDelMes(resumen.mes)}</h3>}
      </div>

      {error && <p className="marketing-error">{error}</p>}
      {cargando && <p className="marketing-vacio">Calculando…</p>}

      {actual && !cargando && (
        <>
          <div className="marketing-metricas">
            <Metrica
              rotulo="Consultas"
              valor={actual.consultas}
              detalle={conVariacion(actual.consultas, previo.consultas, anterior)}
            />
            <Metrica
              rotulo="Se inscribieron"
              valor={actual.inscriptas}
              detalle={conVariacion(actual.inscriptas, previo.inscriptas, anterior)}
            />
            <Metrica
              rotulo="Conversión"
              valor={porcentaje(actual.conversion, 1)}
              detalle={`${porcentaje(previo.conversion, 1)} en ${anterior}`}
            />
            <Metrica
              rotulo="Con origen conocido"
              valor={porcentaje(cobertura)}
              detalle={`${actual.atribucion.sin_identificar} sin identificar`}
              alerta={cobertura !== null && cobertura < 0.6}
            />
          </div>

          {actual.porMoneda.length === 0 && (
            <p className="marketing-vacio">
              Este mes no hay gasto cargado ni pagos de inscriptas, así que no hay
              costo ni retorno que calcular.
            </p>
          )}

          {actual.porMoneda.map((m) => {
            const p = previoDe(m.currency);
            return (
              <div key={m.currency} className="resumen-moneda">
                <h4>En {m.currency === "USD" ? "dólares" : "pesos"}</h4>
                <div className="marketing-metricas">
                  <Metrica
                    rotulo="Cobrado a las inscriptas"
                    valor={plataRedonda(m.ingresos, m.currency)}
                    detalle={conVariacion(m.ingresos, p?.ingresos, anterior, (x) =>
                      plataRedonda(x, m.currency)
                    )}
                  />
                  <Metrica
                    rotulo="Invertido en pauta"
                    valor={plataRedonda(m.gasto, m.currency)}
                    detalle={conVariacion(m.gasto, p?.gasto, anterior, (x) => plataRedonda(x, m.currency))}
                  />
                  <Metrica
                    rotulo="Retorno de la pauta"
                    valor={veces(m.retorno)}
                    detalle={m.retorno === null ? "sin gasto cargado" : "cobrado ÷ invertido"}
                  />
                  <Metrica
                    rotulo="Ticket promedio"
                    valor={m.ticket_promedio === null ? "—" : plataRedonda(m.ticket_promedio, m.currency)}
                    detalle={`${m.alumnas_que_pagaron} pagaron`}
                  />
                  <Metrica
                    rotulo="Cobrado menos pauta"
                    valor={plataRedonda(m.ganancia_sobre_pauta, m.currency)}
                    detalle="antes de los demás costos"
                    alerta={m.ganancia_sobre_pauta < 0}
                  />
                </div>
              </div>
            );
          })}

          {actual.porMoneda.some((m) => m.gasto > 0) && (
            <>
              <h3>Qué costó cada consulta e inscripción</h3>
              <div className="marketing-tabla-scroll">
                <table className="marketing-tabla">
                  <thead>
                    <tr>
                      <th />
                      <th>Del mes completo</th>
                      {actual.porPlataforma.map((p) => (
                        <th key={`${p.platform}-${p.currency}`}>Atribuido a {legible(p.platform)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["Por consulta", "costo_por_consulta"],
                      ["Por inscripción", "costo_por_inscripcion"],
                    ].map(([rotulo, campo]) => (
                      <tr key={campo}>
                        <td>{rotulo}</td>
                        <td className="num">
                          {actual.porMoneda
                            .filter((m) => m[campo] !== null)
                            .map((m) => (
                              <div key={m.currency}>{plataRedonda(m[campo], m.currency)}</div>
                            ))}
                        </td>
                        {actual.porPlataforma.map((p) => (
                          <td key={`${p.platform}-${p.currency}`} className="num">
                            {p.atribuido[campo] === null ? "—" : plataRedonda(p.atribuido[campo], p.currency)}
                          </td>
                        ))}
                      </tr>
                    ))}
                    <tr>
                      <td>Consultas / inscriptas</td>
                      <td className="num">
                        {actual.consultas} / {actual.inscriptas}
                      </td>
                      {actual.porPlataforma.map((p) => (
                        <td key={`${p.platform}-${p.currency}`} className="num">
                          {p.atribuido.consultas} / {p.atribuido.inscripciones}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
              {/* El texto sale de los datos del mes: qué falla de cada costo
                  depende de cuántas consultas tienen origen y de cuál. */}
              <div className={`marketing-cobertura ${cobertura !== null && cobertura < 0.6 ? "floja" : ""}`}>
                {explicarCostos(actual).map(({ titulo, texto }) => (
                  <p key={titulo}>
                    <strong>{titulo}</strong> {texto}
                  </p>
                ))}
              </div>
            </>
          )}

          {actual.porPlataforma.some((p) => p.pauta.impresiones || p.pauta.resultados) && (
            <>
              <h3>Lo que reportó la plataforma</h3>
              <div className="marketing-tabla-scroll">
                <table className="marketing-tabla">
                  <thead>
                    <tr>
                      <th>Plataforma</th>
                      <th>Resultados</th>
                      <th>Alcance</th>
                      <th>Impresiones</th>
                      <th>Clics</th>
                      <th>CPM</th>
                      <th>CTR de enlace</th>
                      <th>CPC</th>
                      <th>Por resultado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {actual.porPlataforma.map(({ platform, currency, pauta }) => (
                      <tr key={`${platform}-${currency}`}>
                        <td>{legible(platform)}</td>
                        <td className="num">{pauta.resultados ?? "—"}</td>
                        <td className="num">{pauta.alcance?.toLocaleString("es-AR") ?? "—"}</td>
                        <td className="num">{pauta.impresiones?.toLocaleString("es-AR") ?? "—"}</td>
                        <td className="num">{pauta.clics ?? "—"}</td>
                        <td className="num">{pauta.cpm === null ? "—" : plataRedonda(pauta.cpm, currency)}</td>
                        <td className="num">
                          {pauta.ctr_enlace === null
                            ? "—"
                            : `${(pauta.ctr_enlace * 100).toLocaleString("es-AR", { maximumFractionDigits: 2 })}%`}
                        </td>
                        <td className="num">{pauta.cpc === null ? "—" : plataRedonda(pauta.cpc, currency)}</td>
                        <td className="num">
                          {pauta.costo_por_resultado === null
                            ? "—"
                            : plataRedonda(pauta.costo_por_resultado, currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          <div className="resumen-desgloses">
            {[
              ["De dónde consultan", resumen.porPais, "pais", "País"],
              ["Qué formación preguntan", resumen.porFormacion, "formacion", "Formación"],
            ].map(([titulo, filas, campo, columna]) => (
              <div key={campo}>
                <h3>{titulo}</h3>
                {filas.length === 0 ? (
                  <p className="marketing-vacio">Sin consultas este mes.</p>
                ) : (
                  <div className="marketing-tabla-scroll">
                    <table className="marketing-tabla">
                      <thead>
                        <tr>
                          <th>{columna}</th>
                          <th>Consultas</th>
                          <th>Inscriptas</th>
                          <th>Conversión</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filas.map((f) => (
                          <tr key={f[campo]}>
                            <td>{f[campo]}</td>
                            <td className="num">{f.consultas}</td>
                            <td className="num">{f.inscriptas}</td>
                            <td className="num">
                              {porcentaje(f.consultas ? f.inscriptas / f.consultas : null, 1)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
};

export default ResumenMes;
