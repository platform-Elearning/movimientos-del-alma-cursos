/**
 * Lectura y normalización de la planilla de contactos, sin tocar la pantalla ni
 * el backend.
 *
 * La planilla real se llena a mano y tiene lo que tiene una planilla a mano:
 * fechas sin año ("01/09"), una columna "Estado" que mezcla el estado con
 * notas, formaciones escritas de varias formas y, a veces, varias en la misma
 * celda. Este módulo no inventa nada: lo que se puede reconocer con seguridad
 * se convierte, y lo demás se conserva tal cual en las notas o en el detalle
 * del interés, con un aviso. Es preferible un dato crudo y visible a uno
 * inventado.
 *
 * Todo son funciones puras para poder probarlas sin pantalla.
 */
import { COUNTRIES } from "./paises";

/** Sin tildes, en minúsculas y con los espacios colapsados: para comparar. */
export const norm = (v) =>
  String(v ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

/** Una celda lista para usar: sin espacios de más, y un guion solo es "vacío". */
export const limpiar = (v) => {
  const t = String(v ?? "").trim();
  return /^[-–—]+$/.test(t) ? "" : t;
};

/** Máximo de filas por pedido; tiene que coincidir con el del backend. */
export const MAX_FILAS = 1000;

/* ------------------------------------------------------------------ lectura */

/**
 * Convierte lo pegado (o el contenido de un archivo) en una tabla.
 *
 * Lo que se copia de Google Sheets o de Excel llega separado por tabuladores;
 * un .csv, por comas o por punto y coma según la configuración regional. Se
 * detecta mirando la primera línea. Las celdas entre comillas pueden tener
 * saltos de línea adentro, que es como llegan las notas largas.
 *
 * Devuelve cada fila con su número original, para poder decir "la fila 12"
 * y que sea la misma que ve quien tiene la planilla abierta.
 */
export const parsearTabla = (texto) => {
  const t = String(texto ?? "").replace(/^\uFEFF/, "");
  const primera = t.split(/\r?\n/, 1)[0] || "";
  const cuenta = (c) => primera.split(c).length - 1;
  const sep = cuenta("\t") > 0 ? "\t" : cuenta(";") > cuenta(",") ? ";" : ",";

  const filas = [];
  let celda = "";
  let actual = [];
  let entreComillas = false;
  let numero = 1;

  const cerrarCelda = () => {
    actual.push(celda);
    celda = "";
  };
  const cerrarFila = () => {
    cerrarCelda();
    // Una fila donde no hay nada no es un dato; el número igual avanza, para
    // que las que siguen conserven el que tienen en la planilla.
    if (actual.some((c) => c.trim() !== "")) filas.push({ n: numero, celdas: actual });
    actual = [];
    numero += 1;
  };

  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (entreComillas) {
      if (c === '"' && t[i + 1] === '"') {
        celda += '"';
        i++;
      } else if (c === '"') {
        entreComillas = false;
      } else {
        celda += c;
      }
    } else if (c === '"' && celda === "") {
      entreComillas = true;
    } else if (c === sep) {
      cerrarCelda();
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && t[i + 1] === "\n") i++;
      cerrarFila();
    } else {
      celda += c;
    }
  }
  if (celda !== "" || actual.length) cerrarFila();

  return filas;
};

/* ------------------------------------------------------------------ columnas */

/**
 * Qué dice cada encabezado. La clave es el campo que alimenta; los valores, las
 * formas en que se suele escribir ya normalizadas. Un encabezado que no está acá
 * (la lista de cursos suelta en la columna H de la planilla, por ejemplo) se
 * ignora en lugar de adivinarse.
 */
const SINONIMOS = {
  fecha: ["fecha", "fecha de primer contacto", "primer contacto", "fecha de consulta", "fecha consulta", "fecha de ingreso"],
  ultimo: ["ultimo contacto", "fecha de ultimo contacto", "fecha ultimo contacto"],
  nombre: ["nombre", "nombre y apellido", "apellido y nombre", "nombre completo", "contacto"],
  pais: ["pais", "nacionalidad"],
  formacion: ["formacion", "formaciones", "curso", "cursos", "interes", "que formacion"],
  estado: ["estado", "situacion", "seguimiento"],
  via: ["via", "origen", "canal", "como llego", "medio", "red"],
  numero: ["numero", "telefono", "tel", "celular", "cel", "whatsapp", "movil", "nro"],
  email: ["email", "e-mail", "mail", "correo", "correo electronico"],
  dni: ["dni", "documento", "dni o documento", "identificacion"],
  notas: ["notas", "nota", "observaciones", "comentarios"],
};

/** Los campos entre los que se puede elegir al reasignar una columna a mano. */
export const CAMPOS = [
  ["nombre", "Nombre"],
  ["fecha", "Fecha (primer contacto)"],
  ["ultimo", "Último contacto"],
  ["numero", "Teléfono"],
  ["email", "Email"],
  ["dni", "DNI o documento"],
  ["pais", "País"],
  ["formacion", "Formación"],
  ["via", "Cómo llegó (vía)"],
  ["estado", "Estado / comentario"],
  ["notas", "Notas"],
];

const campoDeEncabezado = (texto) => {
  const n = norm(texto);
  if (!n) return null;
  for (const [campo, formas] of Object.entries(SINONIMOS)) {
    if (formas.includes(n)) return campo;
  }
  return null;
};

/**
 * Decide si la primera fila es un encabezado y a qué campo va cada columna.
 *
 * Es encabezado si al menos dos celdas se reconocen: una sola coincidencia puede
 * ser un nombre de persona ("Contacto") y no un título. Un campo no se asigna a
 * dos columnas; gana la primera.
 */
export const detectarColumnas = (primeraFila) => {
  const campos = primeraFila.map(campoDeEncabezado);
  const reconocidos = campos.filter(Boolean).length;
  if (reconocidos < 2) return { hayEncabezado: false, mapeo: primeraFila.map(() => null) };

  const usados = new Set();
  const mapeo = campos.map((c) => {
    if (!c || usados.has(c)) return null;
    usados.add(c);
    return c;
  });
  return { hayEncabezado: true, mapeo };
};

/* -------------------------------------------------------------------- fechas */

const aISO = (anio, mes, dia) => {
  const f = new Date(Date.UTC(anio, mes - 1, dia));
  // La vuelta por Date descarta el 31/02, que Date corre al mes siguiente.
  if (f.getUTCFullYear() !== anio || f.getUTCMonth() !== mes - 1 || f.getUTCDate() !== dia) {
    return null;
  }
  return f.toISOString().slice(0, 10);
};

/**
 * Convierte una celda de fecha a AAAA-MM-DD, o null si no se puede.
 *
 * Se interpreta día/mes, que es como se escribe acá: "03/09" es el 3 de
 * septiembre. Sin año ("01/09", que es lo que trae la planilla) se usa `anio`;
 * si no se indicó, el año en curso, y el anterior cuando esa fecha todavía no
 * llegó, porque una consulta no puede ser del futuro.
 *
 * También entiende el número de serie que Excel guarda por debajo de una fecha,
 * por si el archivo llega sin formato.
 */
export const interpretarFecha = (texto, { anio = null, hoy }) => {
  const t = limpiar(texto);
  if (!t) return null;

  let m = t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (m) return aISO(Number(m[1]), Number(m[2]), Number(m[3]));

  m = t.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2}|\d{4})$/);
  if (m) {
    const y = m[3].length === 2 ? 2000 + Number(m[3]) : Number(m[3]);
    return aISO(y, Number(m[2]), Number(m[1]));
  }

  m = t.match(/^(\d{1,2})[/.-](\d{1,2})$/);
  if (m) {
    const dia = Number(m[1]);
    const mes = Number(m[2]);
    if (anio) return aISO(anio, mes, dia);
    const actual = Number(hoy.slice(0, 4));
    const esteAnio = aISO(actual, mes, dia);
    if (esteAnio && esteAnio <= hoy) return esteAnio;
    return aISO(actual - 1, mes, dia);
  }

  // Número de serie de Excel: días desde el 30/12/1899. Solo en un rango
  // razonable, para que un teléfono o un DNI no se lean como fecha.
  if (/^\d{5}$/.test(t)) {
    const n = Number(t);
    if (n >= 25569 && n <= 80000) {
      return new Date(Date.UTC(1899, 11, 30) + n * 86400000).toISOString().slice(0, 10);
    }
  }
  return null;
};

/** ¿Alguna fecha viene sin año? Si sí, la pantalla tiene que preguntar cuál. */
export const hayFechasSinAnio = (tabla, columnaFecha, desdeFila = 0) =>
  columnaFecha >= 0 &&
  tabla.slice(desdeFila).some((f) => /^\d{1,2}[/.-]\d{1,2}$/.test(limpiar(f.celdas[columnaFecha])));

/* ------------------------------------------------------------------ catálogos */

const ORIGENES = {
  facebook: "fb", fb: "fb", face: "fb",
  instagram: "ig", ig: "ig", insta: "ig",
  pagina: "web", "pagina web": "web", web: "web", sitio: "web", "sitio web": "web",
  whatsapp: "whatsapp", wsp: "whatsapp", wa: "whatsapp",
  meta: "meta_ads", "meta ads": "meta_ads", "pauta meta": "meta_ads",
  "google ads": "google_ads", google: "google_ads", "pauta google": "google_ads",
  referida: "referida", referido: "referida", recomendada: "referida", recomendado: "referida",
  "se registro sola": "autoregistro", autoregistro: "autoregistro",
};

/** De "Facebook" a "fb". Devuelve null si no lo reconoce: queda sin dato. */
export const mapearOrigen = (texto) => ORIGENES[norm(limpiar(texto))] ?? null;

const ESTADOS = {
  nueva: "nueva", nuevo: "nueva",
  "esperando respuesta": "esperando_respuesta",
  "en conversacion": "en_conversacion",
  inscripta: "inscripta", inscripto: "inscripta",
  perdida: "perdida", perdido: "perdida",
};

/**
 * El estado solo se toma si la celda dice exactamente uno de los estados del
 * sistema. Una frase como "Consultó y preguntó x certificado" no es un estado:
 * es un comentario, y adivinar a cuál corresponde mandaría gente a "perdida" o
 * "inscripta" por una palabra suelta. Esas frases van a las notas.
 */
export const mapearEstado = (texto) => ESTADOS[norm(limpiar(texto))] ?? null;

const PAISES_EXTRA = {
  "ee uu": "Estados Unidos", eeuu: "Estados Unidos", usa: "Estados Unidos", "ee.uu.": "Estados Unidos",
  uk: "Reino Unido", "gran bretana": "Reino Unido",
};
const PAISES_POR_NORMA = new Map(COUNTRIES.map((p) => [norm(p), p]));

/** Devuelve el país como se guarda, o null si no está en la lista. */
export const normalizarPais = (texto) => {
  const n = norm(limpiar(texto));
  if (!n) return null;
  return PAISES_POR_NORMA.get(n) ?? PAISES_EXTRA[n] ?? null;
};

/**
 * De "Jazz, Composición" a la formación del sistema, si se puede con seguridad.
 *
 * La celda puede nombrar varias formaciones, o "Todos", y el contacto guarda una
 * sola (interest_course_id) más un detalle libre. Entonces: si TODO lo escrito
 * apunta a una única formación, esa es; si no -- varias, ninguna o una que podría
 * ser dos --, no se elige ninguna y el texto original queda en el detalle del
 * interés, para que la vendedora lo vea tal cual lo escribió.
 *
 * Un término coincide con una formación si es su nombre o aparece como palabras
 * completas dentro de él ("jazz" en "Profesorado de Jazz"). Si el nombre exacto
 * existe gana, así "Clásico" no se confunde con "Diplo Clásico".
 */
export const buscarFormacion = (texto, cursos) => {
  const original = limpiar(texto);
  if (!original) return { cursoId: null, detalle: "" };

  const terminos = original.split(/[,;/]|\sy\s/i).map(norm).filter(Boolean);
  const elegidos = new Set();
  let todos = terminos.length > 0;

  for (const termino of terminos) {
    const exactos = cursos.filter((c) => norm(c.name) === termino);
    let candidatos = exactos;
    if (!candidatos.length) {
      const palabras = new RegExp(`(^|\\s)${termino.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(\\s|$)`);
      candidatos = cursos.filter((c) => palabras.test(norm(c.name)));
    }
    if (candidatos.length === 1) elegidos.add(candidatos[0].id);
    else todos = false;
  }

  if (todos && elegidos.size === 1) return { cursoId: [...elegidos][0], detalle: "" };
  return { cursoId: null, detalle: original };
};

/* ----------------------------------------------------------------- las filas */

/**
 * Arma las filas que viajan al backend, con los avisos y errores que se pueden
 * saber acá. El backend vuelve a validar todo: esto es para que la vista previa
 * pueda ser específica ("la fecha no se entiende") en lugar de genérica.
 *
 * Un error es lo que impide importar la fila; un aviso es algo que se convirtió
 * con pérdida o que quedó sin dato, y que conviene mirar.
 */
export const construirFilas = (tabla, mapeo, { anio = null, estadoPorDefecto = "nueva", cursos = [], hoy }) => {
  const col = (campo) => mapeo.indexOf(campo);
  const celda = (fila, campo) => {
    const i = col(campo);
    return i >= 0 ? limpiar(fila.celdas[i]) : "";
  };

  return tabla.map((fila) => {
    const avisos = [];
    const errores = [];

    const name = celda(fila, "nombre").replace(/\s+/g, " ");
    if (!name) errores.push("Falta el nombre");

    let first = "";
    const crudaFecha = celda(fila, "fecha");
    if (!crudaFecha) {
      errores.push("Falta la fecha");
    } else {
      first = interpretarFecha(crudaFecha, { anio, hoy }) || "";
      if (!first) errores.push(`No se entiende la fecha "${crudaFecha}"`);
    }

    let last = "";
    const crudaUltimo = celda(fila, "ultimo");
    if (crudaUltimo) {
      last = interpretarFecha(crudaUltimo, { anio, hoy }) || "";
      if (!last) errores.push(`No se entiende el último contacto "${crudaUltimo}"`);
    }

    const textoPais = celda(fila, "pais");
    const country = normalizarPais(textoPais);
    if (textoPais && !country) avisos.push(`País no reconocido: "${textoPais}"`);

    const textoVia = celda(fila, "via");
    const origin = mapearOrigen(textoVia);
    if (textoVia && !origin) avisos.push(`Vía no reconocida: "${textoVia}" (queda sin dato)`);

    const { cursoId, detalle } = buscarFormacion(celda(fila, "formacion"), cursos);

    const textoEstado = celda(fila, "estado");
    const estadoReconocido = mapearEstado(textoEstado);
    const status = estadoReconocido || estadoPorDefecto;
    // El comentario del estado no se pierde: va a las notas junto con las que
    // vengan en su propia columna.
    const notas = [estadoReconocido ? "" : textoEstado, celda(fila, "notas")].filter(Boolean).join(" · ");

    return {
      fila: fila.n,
      avisos,
      errores,
      datos: {
        fila: fila.n,
        name,
        phone: celda(fila, "numero"),
        email: celda(fila, "email"),
        identification_number: celda(fila, "dni"),
        country: country || (textoPais || ""),
        origin: origin || "",
        interest_course_id: cursoId ?? "",
        interest: detalle,
        status,
        notes: notas,
        first_contact_at: first,
        last_contact_at: last,
      },
    };
  });
};
