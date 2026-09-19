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
