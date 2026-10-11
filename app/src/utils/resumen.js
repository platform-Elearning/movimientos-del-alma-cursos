import { legibleOpcional as legible } from "./etiquetas";
import { variacion } from "./formato";

/**
 * Los textos del resumen del mes. Salen de los datos y no son fijos: un texto
 * fijo explicaba el costo atribuido aunque no se pudiera calcular, y decía que
 * el costo real era "más bajo" aun con todas las consultas identificadas.
 */

/** "2026-09" -> "Septiembre de 2026" */
export const nombreDelMes = (mes) => {
  const [anio, m] = mes.split("-").map(Number);
  const texto = new Date(anio, m - 1, 1).toLocaleDateString("es-AR", {
    month: "long",
    year: "numeric",
  });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
};

/**
 * "+12 % vs agosto". Si el mes anterior tuvo cero no hay porcentaje posible,
 * pero el dato existe y se dice: "0 en agosto" no es lo mismo que "sin datos".
 */
export const conVariacion = (actual, anterior, nombreMes, formato = (x) => x) => {
  if (anterior === null || anterior === undefined) return `sin datos de ${nombreMes}`;
  if (Number(anterior) === 0) return `${formato(0)} en ${nombreMes}`;
  return `${variacion(actual, anterior)} vs ${nombreMes}`;
};

const plural = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;

/**
 * Qué significa cada costo ESTE mes. Devuelve [{ titulo, texto }].
 *
 * Las dos maneras de calcularlo fallan para lados opuestos, y cuánto falla cada
 * una depende de los datos del mes:
 *  - del mes completo se queda corto si entraron consultas que no vinieron de
 *    la pauta (las cuenta como si hubieran salido de ella);
 *  - el atribuido se pasa si hay consultas sin origen que en realidad vinieron
 *    de la pauta (no las cuenta), y no existe si nadie cargó ese origen.
 */
export const explicarCostos = (actual) => {
  const { consultas, inscriptas, atribucion, porPlataforma = [] } = actual;
  const sinOrigen = atribucion.sin_identificar;

  // Una plataforma puede venir en dos filas (pesos y dólares); sus consultas
  // atribuidas son las mismas, se cuentan una vez.
  const plataformas = [...new Map(porPlataforma.map((p) => [p.platform, p])).values()];
  const dePauta = plataformas.reduce((s, p) => s + p.atribuido.consultas, 0);
  const deOtroOrigen = Math.max(0, atribucion.identificadas - dePauta);

  let mesCompleto =
    `Todo lo invertido en pauta dividido las ${plural(consultas, "consulta", "consultas")} ` +
    `y ${plural(inscriptas, "inscripta", "inscriptas")} del mes, como en la planilla.`;
  if (deOtroOrigen > 0) {
    mesCompleto +=
      ` Incluye ${plural(deOtroOrigen, "consulta cargada", "consultas cargadas")} con otro ` +
      "origen: si no vinieron de la pauta, el costo real es más alto que este.";
  } else if (sinOrigen > 0) {
    mesCompleto +=
      ` Si alguna de las ${plural(sinOrigen, "consulta sin origen", "consultas sin origen")} ` +
      "no vino de la pauta, el costo real es más alto que este.";
  } else {
    mesCompleto += " Todas las consultas del mes están cargadas como pauta: es el costo real.";
  }

  const atribuidos = plataformas.map(({ platform, atribuido }) => {
    const nombre = legible(platform);
    if (atribuido.consultas === 0) {
      return {
        titulo: `Atribuido a ${nombre}`,
        texto:
          `Ninguna consulta del mes está cargada como ${nombre}, así que no se puede ` +
          "calcular. Aparece cuando las consultas que llegan por los anuncios se cargan " +
          "con ese origen.",
      };
    }
    let texto =
      `Lo invertido en ${nombre} dividido las ` +
      `${plural(atribuido.consultas, "consulta cargada", "consultas cargadas")} con ese origen.`;
    texto +=
      sinOrigen > 0
        ? ` Hay ${plural(sinOrigen, "consulta", "consultas")} sin origen: si alguna vino de ` +
          `${nombre}, el costo real es más bajo que este.`
        : " Todas las consultas tienen origen cargado: es exacto.";
    return { titulo: `Atribuido a ${nombre}`, texto };
  });

  return [{ titulo: "Del mes completo", texto: mesCompleto }, ...atribuidos];
};
