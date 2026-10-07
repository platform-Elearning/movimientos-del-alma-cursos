import { describe, it, expect } from "vitest";
import {
  plural,
  lineasDeImpactoModulo,
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

describe("lineasDeImpactoModulo", () => {
  it("un módulo vacío y sin alumnas no avisa de nada", () => {
    expect(
      lineasDeImpactoModulo({ clases: 0, comentarios: 0, respuestas: 0, alumnas_inscriptas: 0, alumnas_con_acceso: 0 })
    ).toEqual([]);
  });

  it("cuenta clases, comentarios y respuestas con el plural correcto", () => {
    const l = lineasDeImpactoModulo({
      clases: 1, comentarios: 3, respuestas: 1, alumnas_inscriptas: 0, alumnas_con_acceso: 0,
    });
    expect(l[0]).toBe("Se borran 1 clase del módulo.");
    expect(l[1]).toBe("Se borran 3 comentarios y 1 respuesta de esas clases.");
  });

  it("no habla de respuestas si no hay", () => {
    const l = lineasDeImpactoModulo({ clases: 2, comentarios: 1, respuestas: 0, alumnas_inscriptas: 0, alumnas_con_acceso: 0 });
    expect(l[1]).toBe("Se borran 1 comentario de esas clases.");
  });

  it("avisa a cuántas alumnas se les achica lo que ven, concordando el verbo", () => {
    const una = lineasDeImpactoModulo({ clases: 0, comentarios: 0, respuestas: 0, alumnas_inscriptas: 1, alumnas_con_acceso: 1 });
    expect(una[0]).toBe("1 alumna tiene habilitado este módulo hoy y dejaría de verlo.");
    const varias = lineasDeImpactoModulo({ clases: 0, comentarios: 0, respuestas: 0, alumnas_inscriptas: 5, alumnas_con_acceso: 4 });
    expect(varias[0]).toBe("4 alumnas tienen habilitado este módulo hoy y dejarían de verlo.");
    expect(varias[1]).toMatch(/módulo posterior que no tenían habilitado/);
  });

  it("si nadie lo tiene habilitado no avisa del corrimiento, aunque haya inscriptas", () => {
    const l = lineasDeImpactoModulo({ clases: 1, comentarios: 0, respuestas: 0, alumnas_inscriptas: 5, alumnas_con_acceso: 0 });
    expect(l).toEqual(["Se borran 1 clase del módulo."]);
  });
});

describe("lineasDeImpactoClase", () => {
  it("solo habla de comentarios si hay", () => {
    expect(lineasDeImpactoClase({ comentarios: 0, respuestas: 0 })).toEqual([]);
    expect(lineasDeImpactoClase({ comentarios: 2, respuestas: 0 })).toEqual(["Se borran 2 comentarios de esta clase."]);
  });
});

describe("motivoDeBorradoDeCurso", () => {
  it("traduce el bloqueo por alumnas inscriptas, con el número", () => {
    const e = error(400, { errorMessage: "Cannot delete course. Course has 3 student(s) enrolled. Please unenroll all students first." });
    expect(motivoDeBorradoDeCurso(e)).toBe("No se puede borrar: tiene 3 alumnas inscriptas. Desinscribilas primero.");
    const una = error(400, { errorMessage: "Cannot delete course. Course has 1 student(s) enrolled." });
    expect(motivoDeBorradoDeCurso(una)).toMatch(/1 alumna inscripta\./);
  });

  it("traduce el bloqueo por profesores asignados", () => {
    const e = error(400, { errorMessage: "Cannot delete course. Course has 2 teacher(s) assigned. Please unassign all teachers first." });
    expect(motivoDeBorradoDeCurso(e)).toBe("No se puede borrar: tiene 2 profesores asignados. Desasignalos primero.");
  });

  it("un curso que ya no existe y un fallo cualquiera", () => {
    expect(motivoDeBorradoDeCurso(error(404, {}))).toBe("El curso ya no existe.");
    expect(motivoDeBorradoDeCurso(error(500, {}))).toMatch(/error del servidor \(500\)/);
  });

  it("sin respuesta del servidor no manda a revisar datos", () => {
    expect(motivoDeBorradoDeCurso({})).toMatch(/No hay respuesta del servidor/);
  });
});
