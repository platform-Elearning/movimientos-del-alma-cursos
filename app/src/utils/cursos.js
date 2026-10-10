/**
 * Textos de la gestión de cursos: qué se pierde al borrar y por qué no se pudo.
 *
 * Son funciones puras para poder probarlas sin pantalla. Lo que se le muestra a
 * quien va a confirmar tiene que ser exacto: "se borran 12 clases" no puede
 * decir "se borran 1 clases".
 */
import { mensajeDeError } from "./errores";

/** "1 clase" / "12 clases". */
export const plural = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;

/**
 * Las líneas que se le muestran a quien va a borrar un módulo, a partir de lo
 * que cuenta el backend. Solo aparece lo que existe: no tiene sentido decir "0
 * comentarios".
 */
export const lineasDeImpactoModulo = (i) => {
  const lineas = [];
  if (i.clases) lineas.push(`Se borran ${plural(i.clases, "clase", "clases")} del módulo.`);
  if (i.comentarios) {
    const resp = i.respuestas ? ` y ${plural(i.respuestas, "respuesta", "respuestas")}` : "";
    lineas.push(`Se borran ${plural(i.comentarios, "comentario", "comentarios")}${resp} de esas clases.`);
  }
  if (i.alumnas_con_acceso) {
    lineas.push(
      `${plural(i.alumnas_con_acceso, "alumna tiene", "alumnas tienen")} habilitado este módulo hoy y dejaría${
        i.alumnas_con_acceso === 1 ? "" : "n"
      } de verlo.`
    );
    // El acceso se cuenta por posición ("los primeros N módulos"): al sacar uno,
    // el siguiente ocupa su lugar y esas alumnas pasarían a ver un módulo que no
    // tenían habilitado. Es lo más fácil de no ver, y lo que hay que decir.
    lineas.push(
      "Como el acceso se cuenta por posición, en su lugar verían un módulo posterior que no tenían habilitado."
    );
  }
  return lineas;
};

export const lineasDeImpactoClase = (i) => {
  const lineas = [];
  if (i.comentarios) {
    const resp = i.respuestas ? ` y ${plural(i.respuestas, "respuesta", "respuestas")}` : "";
    lineas.push(`Se borran ${plural(i.comentarios, "comentario", "comentarios")}${resp} de esta clase.`);
  }
  return lineas;
};

/**
 * Por qué no se pudo borrar un curso, en español. El backend frena el borrado si
 * tiene alumnas o profesores y lo dice en inglés; acá se traduce, con el número.
 */
export const motivoDeBorradoDeCurso = (err) => {
  const msg = err?.response?.data?.errorMessage || "";
  const alumnas = msg.match(/(\d+) student\(s\) enrolled/);
  if (alumnas) {
    const n = Number(alumnas[1]);
    return `No se puede borrar: tiene ${plural(n, "alumna inscripta", "alumnas inscriptas")}. Desinscribilas primero.`;
  }
  const profes = msg.match(/(\d+) teacher\(s\) assigned/);
  if (profes) {
    const n = Number(profes[1]);
    return `No se puede borrar: tiene ${plural(n, "profesor asignado", "profesores asignados")}. Desasignalos primero.`;
  }
  if (err?.response?.status === 404) return "El curso ya no existe.";
  return mensajeDeError(err, "borrar el curso");
};
