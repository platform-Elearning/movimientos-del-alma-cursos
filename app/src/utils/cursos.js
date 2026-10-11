/**
 * Textos de la gestión de cursos: qué impide borrar y qué se pierde al hacerlo.
 *
 * Son funciones puras para poder probarlas sin pantalla. Lo que se le muestra a
 * quien va a confirmar tiene que ser exacto: "se borran 12 clases" no puede
 * decir "se borran 1 clases".
 *
 * El borrado va de abajo hacia arriba y el backend lo hace cumplir: un curso se
 * borra vacío (sin módulos, alumnas ni profesores), y un módulo sin clases y sin
 * que ninguna alumna lo tenga habilitado. Estas funciones solo explican, antes de
 * pedir confirmación, lo mismo que el backend va a exigir.
 */
import { mensajeDeError } from "./errores";

/** "1 clase" / "12 clases". */
export const plural = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;

/** ¿Hay algo que impida borrar? `bloqueos` es un objeto de conteos. */
export const hayBloqueos = (bloqueos) => !!bloqueos && Object.values(bloqueos).some((n) => n > 0);

/** Qué hay que hacer antes de poder borrar un curso, una línea por cosa. */
export const lineasDeBloqueoCurso = ({ modulos = 0, alumnas = 0, profesores = 0 } = {}) => {
  const lineas = [];
  if (modulos) {
    lineas.push(
      `Tiene ${plural(modulos, "módulo", "módulos")}: hay que borrarlos primero, empezando por sus clases (en "Editar curso").`
    );
  }
  if (alumnas) {
    lineas.push(
      `Tiene ${plural(alumnas, "alumna inscripta", "alumnas inscriptas")}: hay que desinscribirlas primero ("Desinscribir alumno").`
    );
  }
  if (profesores) {
    lineas.push(
      `Tiene ${plural(profesores, "profesor asignado", "profesores asignados")}: hay que desasignarlos primero (en Profesores).`
    );
  }
  return lineas;
};

/**
 * Qué hay que hacer antes de poder borrar un módulo. El acceso se cuenta por
 * posición ("los primeros N módulos"): sacar uno que una alumna ve le haría
 * aparecer un módulo posterior que no tenía habilitado. Por eso no se borra, y lo
 * que sí se puede es editarlo.
 */
export const lineasDeBloqueoModulo = ({ clases = 0, alumnas = 0 } = {}) => {
  const lineas = [];
  if (clases) {
    lineas.push(`Tiene ${plural(clases, "clase", "clases")}: hay que borrarlas primero, una por una.`);
  }
  if (alumnas) {
    lineas.push(
      `${plural(alumnas, "alumna lo tiene", "alumnas lo tienen")} habilitado hoy: un módulo que alguien está viendo no se puede borrar. Se puede editar.`
    );
  }
  return lineas;
};

/** Lo que arrastra borrar una clase: sus comentarios y respuestas. */
export const lineasDeImpactoClase = (i) => {
  const lineas = [];
  if (i.comentarios) {
    const resp = i.respuestas ? ` y ${plural(i.respuestas, "respuesta", "respuestas")}` : "";
    lineas.push(`Se borran ${plural(i.comentarios, "comentario", "comentarios")}${resp} de esta clase.`);
  }
  return lineas;
};

/**
 * Por qué no se pudo borrar un curso. El backend ya lo explica en español y con
 * los números (409); acá solo se recurre a un texto propio si no vino ninguno.
 */
export const motivoDeBorradoDeCurso = (err) => {
  const delBackend = err?.response?.data?.error;
  if (delBackend) return delBackend;
  if (err?.response?.status === 404) return "El curso ya no existe.";
  return mensajeDeError(err, "borrar el curso");
};
