import "./Graficos.css";

/**
 * Gráficos mínimos en SVG, sin librería.
 *
 * Los que hacen falta acá son barras, una serie temporal y proporciones. Traer
 * una librería de gráficos para eso agrega peso y pelea con la paleta; en SVG
 * son pocas líneas y siguen los tokens.
 *
 * Todos exponen los valores como texto además del dibujo: un gráfico que solo
 * se entiende mirándolo deja afuera a quien usa lector de pantalla.
 */

const ORO = ["#c08c44", "#83711b", "#ffbb80", "#ffd9a3", "#6b5a16"];

const fmt = (n) => Number(n || 0).toLocaleString("es-AR");

/** Barras horizontales: sirve para comparar categorías con nombres largos. */
export const BarrasHorizontales = ({ titulo, datos, campoValor = "cantidad", campoEtiqueta = "etiqueta", sufijo = "" }) => {
  const maximo = Math.max(1, ...datos.map((d) => Number(d[campoValor]) || 0));
  return (
    <figure className="grafico">
      <figcaption>{titulo}</figcaption>
      {datos.length === 0 ? (
        <p className="grafico-vacio">Todavía no hay datos.</p>
      ) : (
        <ul className="barras-h">
          {datos.map((d, i) => {
            const valor = Number(d[campoValor]) || 0;
            return (
              <li key={d[campoEtiqueta] ?? i}>
                <span className="barra-rotulo">{d[campoEtiqueta]}</span>
                <span className="barra-pista">
                  <span
                    className="barra-relleno"
                    style={{
                      width: `${(valor / maximo) * 100}%`,
                      background: ORO[i % ORO.length],
                    }}
                  />
                </span>
                <span className="barra-valor">
                  {fmt(valor)}
                  {sufijo}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </figure>
  );
};

/** Serie temporal con dos líneas: ingresados contra convertidos. */
export const LineaTemporal = ({ titulo, datos, series }) => {
  const ancho = 520;
  const alto = 180;
  const pad = { arriba: 12, derecha: 12, abajo: 26, izquierda: 38 };

  const maximo = Math.max(
    1,
    ...datos.flatMap((d) => series.map((s) => Number(d[s.campo]) || 0))
  );
  const paso =
    datos.length > 1
      ? (ancho - pad.izquierda - pad.derecha) / (datos.length - 1)
      : 0;

  const punto = (i, valor) => {
    const x = pad.izquierda + i * paso;
    const usable = alto - pad.arriba - pad.abajo;
    const y = pad.arriba + usable - (Number(valor) || 0) / maximo * usable;
    return [x, y];
  };

  const resumen = datos
    .map((d) => `${d.mes}: ${series.map((s) => `${s.nombre} ${d[s.campo] ?? 0}`).join(", ")}`)
    .join(". ");

  return (
    <figure className="grafico">
      <figcaption>{titulo}</figcaption>
      {datos.length === 0 ? (
        <p className="grafico-vacio">Todavía no hay datos.</p>
      ) : (
        <>
          <div className="grafico-leyenda">
            {series.map((s) => (
              <span key={s.campo}>
                <i style={{ background: s.color }} aria-hidden="true" />
                {s.nombre}
              </span>
            ))}
          </div>
          <svg
            viewBox={`0 0 ${ancho} ${alto}`}
            className="grafico-svg"
            role="img"
            aria-label={`${titulo}. ${resumen}`}
          >
            <line
              x1={pad.izquierda} y1={alto - pad.abajo}
              x2={ancho - pad.derecha} y2={alto - pad.abajo}
              stroke="var(--borde)" strokeWidth="1"
            />
            <text x="4" y={pad.arriba + 6} className="grafico-eje">{maximo}</text>
            <text x="4" y={alto - pad.abajo} className="grafico-eje">0</text>
            {series.map((s) => (
              <polyline
                key={s.campo}
                fill="none"
                stroke={s.color}
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
                points={datos.map((d, i) => punto(i, d[s.campo]).join(",")).join(" ")}
              />
            ))}
            {series.map((s) =>
              datos.map((d, i) => {
                const [x, y] = punto(i, d[s.campo]);
                return <circle key={`${s.campo}-${i}`} cx={x} cy={y} r="3" fill={s.color} />;
              })
            )}
            {datos.map((d, i) => (
              <text
                key={d.mes}
                x={pad.izquierda + i * paso}
                y={alto - 8}
                textAnchor="middle"
                className="grafico-eje"
              >
                {String(d.mes).slice(5)}
              </text>
            ))}
          </svg>
        </>
      )}
    </figure>
  );
};

/** Proporciones como barra apilada: más legible que una torta con pocos datos. */
export const BarraApilada = ({ titulo, datos }) => {
  const total = datos.reduce((s, d) => s + (Number(d.cantidad) || 0), 0);
  return (
    <figure className="grafico">
      <figcaption>{titulo}</figcaption>
      {total === 0 ? (
        <p className="grafico-vacio">Todavía no hay datos.</p>
      ) : (
        <>
          <div
            className="apilada"
            role="img"
            aria-label={`${titulo}. ${datos.map((d) => `${d.etiqueta}: ${d.cantidad}`).join(", ")}`}
          >
            {datos.map((d, i) => (
              <span
                key={d.etiqueta}
                style={{
                  width: `${((Number(d.cantidad) || 0) / total) * 100}%`,
                  background: ORO[i % ORO.length],
                }}
              />
            ))}
          </div>
          <ul className="apilada-leyenda">
            {datos.map((d, i) => (
              <li key={d.etiqueta}>
                <i style={{ background: ORO[i % ORO.length] }} aria-hidden="true" />
                {d.etiqueta}
                <strong>{fmt(d.cantidad)}</strong>
                <span>{Math.round(((Number(d.cantidad) || 0) / total) * 100)}%</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </figure>
  );
};

export const Metrica = ({ rotulo, valor, detalle, alerta }) => (
  <div className={`metrica ${alerta ? "metrica-alerta" : ""}`}>
    <span className="metrica-valor">{valor}</span>
    <span className="metrica-rotulo">{rotulo}</span>
    {detalle && <span className="metrica-detalle">{detalle}</span>}
  </div>
);

/**
 * Embudo: cuánta gente queda en cada paso y cuánta se cae entre uno y otro.
 *
 * Es distinto de unas barras ordenadas. Lo que importa no es el alto de cada
 * paso sino la caída entre pasos, y por eso el porcentaje que se muestra es
 * respecto del paso anterior, no del total: "de las que contestaron, el 40% se
 * inscribió" dice dónde está la fuga; "el 12% del total" no.
 */
export const Embudo = ({ titulo, pasos }) => {
  const inicial = Number(pasos[0]?.cantidad) || 0;
  return (
    <figure className="grafico">
      <figcaption>{titulo}</figcaption>
      {inicial === 0 ? (
        <p className="grafico-vacio">Todavía no hay datos.</p>
      ) : (
        <ol
          className="embudo"
          role="img"
          aria-label={`${titulo}. ${pasos
            .map((p) => `${p.etiqueta}: ${p.cantidad}`)
            .join(", ")}`}
        >
          {pasos.map((p, i) => {
            const valor = Number(p.cantidad) || 0;
            const previo = i === 0 ? valor : Number(pasos[i - 1].cantidad) || 0;
            const ancho = inicial ? (valor / inicial) * 100 : 0;
            const retencion = previo ? Math.round((valor / previo) * 100) : 0;
            return (
              <li key={p.etiqueta}>
                <span className="embudo-rotulo">
                  {p.etiqueta}
                  <strong>{fmt(valor)}</strong>
                </span>
                <span className="embudo-pista">
                  <span className="embudo-relleno" style={{ width: `${ancho}%` }} />
                </span>
                {i > 0 && (
                  <span className="embudo-caida">
                    {retencion}% de las anteriores
                    {previo - valor > 0 && ` · se cayeron ${fmt(previo - valor)}`}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </figure>
  );
};

/**
 * Dos barras por categoría: volumen contra resultado.
 *
 * Existe porque comparar "cuántas consultas trajo" con "cuántas se inscribieron"
 * en dos gráficos separados obliga a cruzarlos de memoria. Juntas se ve de una
 * el canal que trae mucho y convierte poco.
 */
export const BarrasComparadas = ({ titulo, datos, series, sufijoTasa }) => {
  const maximo = Math.max(
    1,
    ...datos.flatMap((d) => series.map((s) => Number(d[s.campo]) || 0))
  );
  return (
    <figure className="grafico">
      <figcaption>{titulo}</figcaption>
      {datos.length === 0 ? (
        <p className="grafico-vacio">Todavía no hay datos.</p>
      ) : (
        <>
          <div className="grafico-leyenda">
            {series.map((s) => (
              <span key={s.campo}>
                <i style={{ background: s.color }} aria-hidden="true" />
                {s.nombre}
              </span>
            ))}
          </div>
          <ul
            className="comparadas"
            role="img"
            aria-label={`${titulo}. ${datos
              .map(
                (d) =>
                  `${d.etiqueta}: ${series.map((s) => `${s.nombre} ${d[s.campo] ?? 0}`).join(", ")}`
              )
              .join(". ")}`}
          >
            {datos.map((d) => (
              <li key={d.etiqueta}>
                <span className="comparadas-rotulo">
                  {d.etiqueta}
                  {sufijoTasa !== undefined && d.tasa !== undefined && (
                    <strong>{d.tasa}{sufijoTasa}</strong>
                  )}
                </span>
                <span className="comparadas-barras">
                  {series.map((s) => (
                    <span key={s.campo} className="comparadas-fila">
                      <span
                        className="comparadas-relleno"
                        style={{
                          width: `${((Number(d[s.campo]) || 0) / maximo) * 100}%`,
                          background: s.color,
                        }}
                      />
                      <span className="comparadas-valor">{fmt(d[s.campo])}</span>
                    </span>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </figure>
  );
};

/**
 * Anillo de proporciones.
 *
 * Sirve para una pregunta y una sola: qué parte del total es cada cosa cuando
 * son pocas categorías. Con muchas se vuelve ilegible, así que agrupa la cola
 * en "otros" en lugar de dibujar veinte gajos de un píxel.
 */
export const Anillo = ({ titulo, datos, maximoGajos = 5 }) => {
  const total = datos.reduce((s, d) => s + (Number(d.cantidad) || 0), 0);
  const ordenados = [...datos].sort((a, b) => b.cantidad - a.cantidad);
  const visibles = ordenados.slice(0, maximoGajos);
  const resto = ordenados.slice(maximoGajos).reduce((s, d) => s + (Number(d.cantidad) || 0), 0);
  const gajos = resto > 0 ? [...visibles, { etiqueta: "Otros", cantidad: resto }] : visibles;

  const radio = 60;
  const grosor = 22;
  const circunferencia = 2 * Math.PI * radio;
  let acumulado = 0;

  return (
    <figure className="grafico">
      <figcaption>{titulo}</figcaption>
      {total === 0 ? (
        <p className="grafico-vacio">Todavía no hay datos.</p>
      ) : (
        <div className="anillo-caja">
          <svg
            viewBox="0 0 160 160"
            className="anillo-svg"
            role="img"
            aria-label={`${titulo}. ${gajos
              .map((g) => `${g.etiqueta}: ${g.cantidad}, ${Math.round((g.cantidad / total) * 100)}%`)
              .join(". ")}`}
          >
            {gajos.map((g, i) => {
              const porcion = (Number(g.cantidad) || 0) / total;
              // stroke-dasharray dibuja el gajo y dashoffset lo rota hasta donde
              // termina el anterior: un anillo sin calcular arcos a mano.
              const trazo = porcion * circunferencia;
              const desfase = -acumulado * circunferencia;
              acumulado += porcion;
              return (
                <circle
                  key={g.etiqueta}
                  cx="80"
                  cy="80"
                  r={radio}
                  fill="none"
                  stroke={ORO[i % ORO.length]}
                  strokeWidth={grosor}
                  strokeDasharray={`${trazo} ${circunferencia - trazo}`}
                  strokeDashoffset={desfase}
                  transform="rotate(-90 80 80)"
                />
              );
            })}
            <text x="80" y="76" className="anillo-total">{fmt(total)}</text>
            <text x="80" y="94" className="anillo-rotulo">en total</text>
          </svg>
          <ul className="anillo-leyenda">
            {gajos.map((g, i) => (
              <li key={g.etiqueta}>
                <i style={{ background: ORO[i % ORO.length] }} aria-hidden="true" />
                {g.etiqueta}
                <strong>{fmt(g.cantidad)}</strong>
                <span>{Math.round((g.cantidad / total) * 100)}%</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </figure>
  );
};
