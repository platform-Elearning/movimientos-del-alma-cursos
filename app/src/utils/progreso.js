/**
 * Textos y cuentas del progreso de la alumna, sin React: que dice cada logro,
 * como se ordenan las clases de un curso, que frase acompaña a la racha.
 */

export const LOGROS = {
  primer_paso: {
    emoji: "🌱",
    titulo: "Primer paso",
    descripcion: "Completaste tu primera clase",
    pista: "Completá tu primera clase",
  },
  modulo_completo: {
    emoji: "🌸",
    titulo: "Módulo completo",
    descripcion: "Terminaste todas las clases de un módulo",
    pista: "Terminá todas las clases de un módulo",
  },
  curso_completo: {
    emoji: "👑",
    titulo: "Formación completa",
    descripcion: "Terminaste todas las clases de una formación",
    pista: "Terminá todas las clases de una formación",
  },
  constancia: {
    emoji: "🔥",
    titulo: "Constancia",
    descripcion: "Bailaste 4 semanas seguidas",
    pista: "Bailá al menos un día por semana, 4 semanas seguidas",
  },
};

export const ORDEN_DE_LOGROS = ["primer_paso", "modulo_completo", "curso_completo", "constancia"];

/** Titulo y detalle de un logro ganado, con el modulo o el curso donde se gano. */
export const describirLogro = (logro) => {
  const base = LOGROS[logro.kind] || { emoji: "✨", titulo: "Logro", descripcion: "" };
  let detalle = base.descripcion;
  if (logro.kind === "modulo_completo" && logro.module_name) {
    detalle = `Terminaste el módulo “${logro.module_name}”`;
  } else if (logro.kind === "curso_completo" && logro.course_name) {
    detalle = `Terminaste “${logro.course_name}”`;
  } else if (logro.kind === "primer_paso" && logro.course_name) {
    detalle = `Completaste tu primera clase de “${logro.course_name}”`;
  }
  return { emoji: base.emoji, titulo: base.titulo, detalle };
};

/** Lo que cuenta el muro: "María G. terminó el módulo “Ondas” 🌸". */
export const fraseDelMuro = (logro) => {
  const quien = logro.es_mio ? "Vos" : logro.quien;
  const conjugar = (yo, ella) => (logro.es_mio ? yo : ella);
  switch (logro.kind) {
    case "primer_paso":
      return `${quien} ${conjugar("diste tu", "dio su")} primer paso 🌱`;
    case "modulo_completo":
      return `${quien} ${conjugar("terminaste", "terminó")} el módulo “${logro.module_name || ""}” 🌸`;
    case "curso_completo":
      return `${quien} ${conjugar("completaste", "completó")} la formación 👑`;
    case "constancia":
      return `${quien} ${conjugar("bailaste", "bailó")} 4 semanas seguidas 🔥`;
    default:
      return `${quien} ${conjugar("ganaste", "ganó")} un logro ✨`;
  }
};

/**
 * Todas las clases del curso en orden, una detras de otra, con su modulo. Es el
 * camino que recorren "clase anterior" y "clase siguiente".
 */
export const ordenarClases = (modulos = []) =>
  modulos.flatMap((modulo) =>
    (modulo.classes || []).map((clase) => ({
      ...clase,
      moduleId: modulo.id,
      moduleName: modulo.name,
    }))
  );

/** La clase actual y sus vecinas en el recorrido del curso. */
export const vecinasDe = (clases, claseId) => {
  const indice = clases.findIndex((c) => String(c.id) === String(claseId));
  if (indice === -1) return { actual: null, anterior: null, siguiente: null, indice: -1 };
  return {
    actual: clases[indice],
    anterior: clases[indice - 1] || null,
    siguiente: clases[indice + 1] || null,
    indice,
  };
};

export const porcentaje = (completadas, total) =>
  total > 0 ? Math.round((Math.min(completadas, total) / total) * 100) : 0;

/** La frase que acompaña a la barra de progreso. */
export const fraseDeAvance = (completadas, total) => {
  if (!total) return "Todavía no hay clases habilitadas";
  if (completadas >= total) return "¡Completaste todas tus clases! 🎉";
  if (completadas === 0) return "Tu primera clase te está esperando 💃";
  return `Llevás ${completadas} de ${total} clases 💃`;
};

/**
 * La frase de la racha. Amable a proposito: nunca reta. Si esta semana todavia
 * no bailo pero venia bailando, la invita a seguir en vez de decirle que perdio.
 */
export const fraseDeRacha = (racha) => {
  if (!racha) return null;
  const { diasEstaSemana = 0, semanasSeguidas = 0 } = racha;
  if (diasEstaSemana > 0) {
    const dias = diasEstaSemana === 1 ? "1 día" : `${diasEstaSemana} días`;
    const semanas = semanasSeguidas > 1 ? ` · ${semanasSeguidas} semanas seguidas` : "";
    return `Bailaste ${dias} esta semana 🔥${semanas}`;
  }
  if (semanasSeguidas > 0) {
    const semanas = semanasSeguidas === 1 ? "la semana pasada" : `${semanasSeguidas} semanas seguidas`;
    return `Venís bailando ${semanas}. ¡Esta semana te espera! ✨`;
  }
  return null;
};

const FRASES_DE_CIERRE = [
  "Cada movimiento que aprendés queda en tu cuerpo para siempre.",
  "Tu constancia es tu mejor maestra. ¡Seguí así!",
  "El alma se expresa cuando el cuerpo se anima. ¡Bravo!",
  "Un módulo menos, mucha más danza adentro tuyo.",
];

/** Una frase para celebrar; la misma para el mismo modulo, para que no cambie al recargar. */
export const fraseDeCelebracion = (semilla = 0) =>
  FRASES_DE_CIERRE[Math.abs(Number(semilla) || 0) % FRASES_DE_CIERRE.length];

/**
 * Las insignias de UNA formacion, para mostrarlas junto a su tarjeta. Cada
 * logro es de un curso (salvo constancia, que es de la alumna y va aparte): si
 * se mostraran todas juntas, con dos formaciones no se sabria de cual es cada
 * una.
 *
 * modulos: cuantos modulos con clases tiene habilitados en ese curso.
 */
export const insigniasDelCurso = (logros = [], courseId, modulos = 0) => {
  const delCurso = logros.filter((l) => l.course_id === courseId);
  const tiene = (kind) => delCurso.some((l) => l.kind === kind);
  const modulosCompletos = delCurso.filter((l) => l.kind === "modulo_completo").length;
  const total = Math.max(modulos, modulosCompletos);

  return [
    {
      kind: "primer_paso",
      ...LOGROS.primer_paso,
      ganada: tiene("primer_paso"),
      etiqueta: LOGROS.primer_paso.titulo,
    },
    {
      kind: "modulo_completo",
      ...LOGROS.modulo_completo,
      ganada: modulosCompletos > 0,
      etiqueta: total > 0 ? `${modulosCompletos} de ${total} módulos` : "Módulos",
    },
    {
      kind: "curso_completo",
      ...LOGROS.curso_completo,
      ganada: tiene("curso_completo"),
      etiqueta: LOGROS.curso_completo.titulo,
    },
  ];
};

/** Si la alumna ya gano la constancia (es suya, no de un curso). */
export const tieneConstancia = (logros = []) => logros.some((l) => l.kind === "constancia");
