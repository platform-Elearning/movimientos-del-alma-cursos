import { describe, it, expect } from "vitest";
import {
  norm,
  limpiar,
  parsearTabla,
  detectarColumnas,
  interpretarFecha,
  hayFechasSinAnio,
  mapearOrigen,
  mapearEstado,
  normalizarPais,
  buscarFormacion,
  construirFilas,
} from "../importarPlanilla";

const HOY = "2026-10-03";

// Los cursos que aparecen en la columna H de la planilla real.
const CURSOS = [
  { id: 1, name: "Jazz" },
  { id: 2, name: "Clásico" },
  { id: 3, name: "Contemporanea" },
  { id: 4, name: "Caribeños" },
  { id: 5, name: "Amplitud" },
  { id: 6, name: "Diplo Clásico" },
  { id: 7, name: "Afro" },
  { id: 8, name: "Composición" },
];

// Filas calcadas de la planilla real, tal como las entrega Google Sheets al
// copiar: separadas por tabuladores, con la lista de cursos suelta en la H.
const PLANILLA = [
  "Fecha\tNombre\tPaís\tFormación\tEstado\tVía\tNúmero\tJazz",
  "01/09\tHola\tChile\tJazz, Composición, Diplo Clásico\tConsultó\tFacebook\t56 9 8419 2162\tClásico",
  "01/09\tLaura\t\t-\t-\t\t\tContemporanea",
  "01/09\tAnneth González\tArgentina\tJazz\tConsultó\tPágina\t54 9 3795 33-9676\tCaribeños",
  "02/09\tBolivar Marin\tEcuador\tContemporanea\tConsultó y preguntó x certificado\tFacebook\t593 98 593 6471\t",
].join("\n");

describe("parsearTabla", () => {
  it("lee lo pegado de una planilla, con el número de cada fila", () => {
    const t = parsearTabla(PLANILLA);
    expect(t).toHaveLength(5);
    expect(t[0].n).toBe(1);
    expect(t[1].celdas[1]).toBe("Hola");
    expect(t[4].n).toBe(5);
  });

  it("salta las filas vacías pero conserva la numeración de las que siguen", () => {
    const t = parsearTabla("a\tb\n\n\nc\td");
    expect(t.map((f) => f.n)).toEqual([1, 4]);
  });

  it("entiende un csv con comas y celdas entre comillas con saltos de línea", () => {
    const t = parsearTabla('Fecha,Nombre,Estado\n01/09,"Pérez, Marta","Dijo que sí\ny que avisa"\n');
    expect(t).toHaveLength(2);
    expect(t[1].celdas).toEqual(["01/09", "Pérez, Marta", "Dijo que sí\ny que avisa"]);
  });

  it("entiende un csv con punto y coma, que es el de Excel en español", () => {
    expect(parsearTabla("Fecha;Nombre\n01/09;Ana")[1].celdas).toEqual(["01/09", "Ana"]);
  });

  it("ignora el BOM y las comillas escapadas", () => {
    const t = parsearTabla('﻿a,b\n"dijo ""hola""",x');
    expect(t[0].celdas[0]).toBe("a");
    expect(t[1].celdas[0]).toBe('dijo "hola"');
  });
});

describe("detectarColumnas", () => {
  it("reconoce los encabezados de la planilla real e ignora la columna suelta", () => {
    const { hayEncabezado, mapeo } = detectarColumnas(parsearTabla(PLANILLA)[0].celdas);
    expect(hayEncabezado).toBe(true);
    expect(mapeo).toEqual(["fecha", "nombre", "pais", "formacion", "estado", "via", "numero", null]);
  });

  it("sin dos coincidencias no hay encabezado: una persona llamada Contacto no es un título", () => {
    expect(detectarColumnas(["Contacto", "11 5555 1234"]).hayEncabezado).toBe(false);
  });

  it("no asigna el mismo campo a dos columnas", () => {
    const { mapeo } = detectarColumnas(["Nombre", "Fecha", "Nombre completo"]);
    expect(mapeo).toEqual(["nombre", "fecha", null]);
  });
});

describe("interpretarFecha", () => {
  it("día/mes: 03/09 es el 3 de septiembre", () => {
    expect(interpretarFecha("03/09", { anio: 2026, hoy: HOY })).toBe("2026-09-03");
    expect(interpretarFecha("3/9/2026", { hoy: HOY })).toBe("2026-09-03");
    expect(interpretarFecha("3/9/26", { hoy: HOY })).toBe("2026-09-03");
    expect(interpretarFecha("2026-09-03", { hoy: HOY })).toBe("2026-09-03");
  });

  it("sin año y sin elegir uno, usa el actual, o el anterior si todavía no llegó", () => {
    expect(interpretarFecha("01/09", { hoy: HOY })).toBe("2026-09-01");
    // Diciembre todavía no pasó en octubre de 2026: tiene que ser el 2025.
    expect(interpretarFecha("15/12", { hoy: HOY })).toBe("2025-12-15");
  });

  it("un año elegido a mano manda sobre la regla automática", () => {
    expect(interpretarFecha("15/12", { anio: 2026, hoy: HOY })).toBe("2026-12-15");
  });

  it("rechaza fechas que no existen y texto que no es fecha", () => {
    expect(interpretarFecha("31/02", { anio: 2026, hoy: HOY })).toBeNull();
    expect(interpretarFecha("32/01", { anio: 2026, hoy: HOY })).toBeNull();
    expect(interpretarFecha("ayer", { hoy: HOY })).toBeNull();
    expect(interpretarFecha("-", { hoy: HOY })).toBeNull();
    expect(interpretarFecha("", { hoy: HOY })).toBeNull();
  });

  it("entiende el número de serie de Excel, pero no un teléfono", () => {
    expect(interpretarFecha("46023", { hoy: HOY })).toBe("2026-01-01");
    expect(interpretarFecha("1155551234", { hoy: HOY })).toBeNull();
  });

  it("avisa si alguna fecha viene sin año", () => {
    const t = parsearTabla(PLANILLA);
    expect(hayFechasSinAnio(t, 0, 1)).toBe(true);
    expect(hayFechasSinAnio(parsearTabla("01/09/2026\nx"), 0)).toBe(false);
  });
});

describe("catálogos", () => {
  it("las vías de la planilla pasan a los orígenes del sistema", () => {
    expect(mapearOrigen("Facebook")).toBe("fb");
    expect(mapearOrigen("Instagram")).toBe("ig");
    expect(mapearOrigen("Página")).toBe("web");
    expect(mapearOrigen("Web")).toBe("web");
    expect(mapearOrigen("Tiktok")).toBeNull();
    expect(mapearOrigen("")).toBeNull();
  });

  it("el estado solo se toma si es exactamente uno del sistema", () => {
    expect(mapearEstado("Perdida")).toBe("perdida");
    expect(mapearEstado("En conversación")).toBe("en_conversacion");
    // Una frase no es un estado: adivinarlo mandaría gente a "perdida".
    expect(mapearEstado("Consultó")).toBeNull();
    expect(mapearEstado("Solo mensaje automático, no respondio seguimiento")).toBeNull();
  });

  it("reconoce el país con o sin tildes y en minúsculas", () => {
    expect(normalizarPais("Perú")).toBe("Perú");
    expect(normalizarPais("peru")).toBe("Perú");
    expect(normalizarPais("ARGENTINA")).toBe("Argentina");
    expect(normalizarPais("EEUU")).toBe("Estados Unidos");
    expect(normalizarPais("Narnia")).toBeNull();
    expect(normalizarPais("-")).toBeNull();
  });
});

describe("buscarFormacion", () => {
  it("una formación clara se elige", () => {
    expect(buscarFormacion("Jazz", CURSOS)).toEqual({ cursoId: 1, detalle: "" });
    expect(buscarFormacion("afro", CURSOS)).toEqual({ cursoId: 7, detalle: "" });
    expect(buscarFormacion("Composición", CURSOS)).toEqual({ cursoId: 8, detalle: "" });
  });

  it("el nombre exacto gana: Clásico no se confunde con Diplo Clásico", () => {
    expect(buscarFormacion("Clásico", CURSOS).cursoId).toBe(2);
    expect(buscarFormacion("Diplo Clásico", CURSOS).cursoId).toBe(6);
  });

  it("varias formaciones distintas no se eligen: el texto queda en el detalle", () => {
    const r = buscarFormacion("Jazz, Composición, Diplo Clásico", CURSOS);
    expect(r).toEqual({ cursoId: null, detalle: "Jazz, Composición, Diplo Clásico" });
    expect(buscarFormacion("Amplitud, Afro", CURSOS).cursoId).toBeNull();
  });

  it("'Todos' o un nombre que no existe se conservan como detalle", () => {
    expect(buscarFormacion("Todos", CURSOS)).toEqual({ cursoId: null, detalle: "Todos" });
    expect(buscarFormacion("folklore", CURSOS)).toEqual({ cursoId: null, detalle: "folklore" });
  });

  it("el mismo curso nombrado dos veces sigue siendo uno", () => {
    expect(buscarFormacion("Jazz, jazz", CURSOS).cursoId).toBe(1);
  });

  it("un término ambiguo no se elige", () => {
    const cursos = [{ id: 1, name: "Profesorado de Jazz" }, { id: 2, name: "Jazz Avanzado" }];
    expect(buscarFormacion("jazz", cursos)).toEqual({ cursoId: null, detalle: "jazz" });
  });

  it("vacío o un guion no es nada", () => {
    expect(buscarFormacion("-", CURSOS)).toEqual({ cursoId: null, detalle: "" });
    expect(buscarFormacion("", CURSOS)).toEqual({ cursoId: null, detalle: "" });
  });
});

describe("construirFilas con la planilla real", () => {
  const todo = parsearTabla(PLANILLA);
  const { mapeo } = detectarColumnas(todo[0].celdas);
  const filas = construirFilas(todo.slice(1), mapeo, { cursos: CURSOS, hoy: HOY });

  it("convierte una fila completa", () => {
    const f = filas[2];
    expect(f.errores).toEqual([]);
    expect(f.datos).toMatchObject({
      fila: 4,
      name: "Anneth González",
      country: "Argentina",
      interest_course_id: 1,
      interest: "",
      origin: "web",
      phone: "54 9 3795 33-9676",
      status: "nueva",
      first_contact_at: "2026-09-01",
    });
  });

  it("el comentario del estado va a las notas y el estado queda en nueva", () => {
    expect(filas[3].datos.notes).toBe("Consultó y preguntó x certificado");
    expect(filas[3].datos.status).toBe("nueva");
  });

  it("varias formaciones quedan en el detalle del interés", () => {
    expect(filas[0].datos.interest_course_id).toBe("");
    expect(filas[0].datos.interest).toBe("Jazz, Composición, Diplo Clásico");
  });

  it("los guiones y vacíos no se importan como texto", () => {
    const f = filas[1].datos;
    expect(f.country).toBe("");
    expect(f.interest).toBe("");
    expect(f.notes).toBe("");
    expect(f.origin).toBe("");
    expect(f.phone).toBe("");
  });

  it("la fecha de la planilla es primer contacto, y el último queda para el backend", () => {
    expect(filas[0].datos.first_contact_at).toBe("2026-09-01");
    expect(filas[0].datos.last_contact_at).toBe("");
  });

  it("numera cada fila como la ve quien tiene la planilla abierta", () => {
    expect(filas.map((f) => f.fila)).toEqual([2, 3, 4, 5]);
  });
});

describe("construirFilas: errores y avisos", () => {
  const mapeo = ["fecha", "nombre", "pais", "via"];
  const armar = (celdas, extra = {}) =>
    construirFilas([{ n: 2, celdas }], mapeo, { cursos: CURSOS, hoy: HOY, ...extra })[0];

  it("sin nombre o sin fecha la fila es un error", () => {
    expect(armar(["01/09", "", "Chile", ""]).errores).toContain("Falta el nombre");
    expect(armar(["", "Ana", "Chile", ""]).errores).toContain("Falta la fecha");
  });

  it("dice qué fecha no entendió", () => {
    expect(armar(["mañana", "Ana", "", ""]).errores[0]).toBe('No se entiende la fecha "mañana"');
  });

  it("un país o una vía desconocidos son un aviso, no un error, y el país se conserva", () => {
    const f = armar(["01/09", "Ana", "Narnia", "Tiktok"]);
    expect(f.errores).toEqual([]);
    expect(f.avisos).toHaveLength(2);
    expect(f.datos.country).toBe("Narnia");
    expect(f.datos.origin).toBe("");
  });

  it("el estado por defecto se aplica cuando la celda no es un estado", () => {
    const f = construirFilas([{ n: 2, celdas: ["01/09", "Ana", "Perdida"] }], ["fecha", "nombre", "estado"], {
      cursos: CURSOS,
      hoy: HOY,
      estadoPorDefecto: "esperando_respuesta",
    })[0];
    expect(f.datos.status).toBe("perdida");
    const g = construirFilas([{ n: 2, celdas: ["01/09", "Ana", "Consultó"] }], ["fecha", "nombre", "estado"], {
      cursos: CURSOS,
      hoy: HOY,
      estadoPorDefecto: "esperando_respuesta",
    })[0];
    expect(g.datos.status).toBe("esperando_respuesta");
  });

  it("un año elegido a mano se usa en las fechas sin año", () => {
    expect(armar(["15/12", "Ana", "", ""], { anio: 2025 }).datos.first_contact_at).toBe("2025-12-15");
  });
});

describe("helpers", () => {
  it("norm quita tildes y mayúsculas; limpiar trata el guion como vacío", () => {
    expect(norm("  PÁGINA  Web ")).toBe("pagina web");
    expect(limpiar(" - ")).toBe("");
    expect(limpiar(" Ana ")).toBe("Ana");
  });
});
