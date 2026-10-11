import { describe, it, expect } from "vitest";
import {
  plural,
  hayBloqueos,
  lineasDeBloqueoCurso,
  lineasDeBloqueoModulo,
  lineasDeImpactoClase,
  motivoDeBorradoDeCurso,
} from "../cursos";

const error = (status, data) => ({ response: { status, data } });

describe("plural", () => {
  it("singular con 1 y plural con el resto, también 0", () => {
    expect(plural(1, "clase", "clases")).toBe("1 clase");
    expect(plural(12, "clase", "clases")).toBe("12 clases");
    expect(plural(0, "clase", "clases")).toBe("0 clases");
  });
});

describe("hayBloqueos", () => {
  it("es verdadero si algún conteo es mayor a cero", () => {
    expect(hayBloqueos({ modulos: 0, alumnas: 0, profesores: 1 })).toBe(true);
    expect(hayBloqueos({ clases: 0, alumnas: 0 })).toBe(false);
  });

  it("sin datos no hay bloqueos que mostrar", () => {
    expect(hayBloqueos(undefined)).toBe(false);
    expect(hayBloqueos(null)).toBe(false);
    expect(hayBloqueos({})).toBe(false);
  });
});

describe("lineasDeBloqueoCurso", () => {
  it("un curso vacío no tiene nada que hacer antes", () => {
    expect(lineasDeBloqueoCurso({ modulos: 0, alumnas: 0, profesores: 0 })).toEqual([]);
    expect(lineasDeBloqueoCurso()).toEqual([]);
  });

  it("dice qué hay y qué hacer primero, con el plural correcto", () => {
    const l = lineasDeBloqueoCurso({ modulos: 1, alumnas: 2, profesores: 1 });
    expect(l).toHaveLength(3);
    expect(l[0]).toMatch(/Tiene 1 módulo: hay que borrarlos primero/);
    expect(l[1]).toMatch(/Tiene 2 alumnas inscriptas: hay que desinscribirlas/);
    expect(l[2]).toMatch(/Tiene 1 profesor asignado: hay que desasignarlos/);
  });

  it("solo menciona lo que realmente hay", () => {
    const l = lineasDeBloqueoCurso({ modulos: 0, alumnas: 1, profesores: 0 });
    expect(l).toHaveLength(1);
    expect(l[0]).toMatch(/1 alumna inscripta/);
  });
});

describe("lineasDeBloqueoModulo", () => {
  it("un módulo vacío que nadie ve no tiene nada que hacer antes", () => {
    expect(lineasDeBloqueoModulo({ clases: 0, alumnas: 0 })).toEqual([]);
  });

  it("pide borrar las clases primero, y concuerda el plural", () => {
    expect(lineasDeBloqueoModulo({ clases: 1, alumnas: 0 })).toEqual([
      "Tiene 1 clase: hay que borrarlas primero, una por una.",
    ]);
    expect(lineasDeBloqueoModulo({ clases: 12, alumnas: 0 })[0]).toMatch(/Tiene 12 clases/);
  });

  it("explica que un módulo que una alumna ve no se borra, y que se puede editar", () => {
    const una = lineasDeBloqueoModulo({ clases: 0, alumnas: 1 });
    expect(una[0]).toMatch(/1 alumna lo tiene habilitado hoy/);
    expect(una[0]).toMatch(/Se puede editar/);
    expect(lineasDeBloqueoModulo({ clases: 0, alumnas: 4 })[0]).toMatch(/4 alumnas lo tienen habilitado/);
  });

  it("junta las dos razones cuando hay clases y alumnas", () => {
    expect(lineasDeBloqueoModulo({ clases: 2, alumnas: 3 })).toHaveLength(2);
  });
});

describe("lineasDeImpactoClase", () => {
  it("solo habla de comentarios si hay", () => {
    expect(lineasDeImpactoClase({ comentarios: 0, respuestas: 0 })).toEqual([]);
    expect(lineasDeImpactoClase({ comentarios: 2, respuestas: 0 })).toEqual(["Se borran 2 comentarios de esta clase."]);
    expect(lineasDeImpactoClase({ comentarios: 3, respuestas: 1 })).toEqual([
      "Se borran 3 comentarios y 1 respuesta de esta clase.",
    ]);
  });
});

describe("motivoDeBorradoDeCurso", () => {
  it("muestra lo que explica el backend, que ya viene en español y con los números", () => {
    const e = error(409, {
      error: "No se puede eliminar el curso: tiene 3 módulos. Primero hay que borrar los módulos.",
    });
    expect(motivoDeBorradoDeCurso(e)).toBe(
      "No se puede eliminar el curso: tiene 3 módulos. Primero hay que borrar los módulos."
    );
  });

  it("un curso que ya no existe, sin motivo del backend", () => {
    expect(motivoDeBorradoDeCurso(error(404, {}))).toBe("El curso ya no existe.");
  });

  it("un fallo cualquiera no manda a revisar los datos", () => {
    expect(motivoDeBorradoDeCurso(error(500, {}))).toMatch(/error del servidor \(500\)/);
  });

  it("sin respuesta del servidor lo dice", () => {
    expect(motivoDeBorradoDeCurso({})).toMatch(/No hay respuesta del servidor/);
  });
});
