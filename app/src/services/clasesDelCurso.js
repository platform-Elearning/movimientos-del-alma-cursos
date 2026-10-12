import {
  getModulesByAlumnoAndCurso,
  getCoursesByStudentId,
  getModulesByCourseID,
  getLessonsByModuleIdAndCourseId,
} from "../api/cursos";

/**
 * Los modulos de un curso con sus clases, como los ve quien los pide: la alumna
 * solo los que tiene habilitados; el profesor y el admin, todos.
 *
 * Lo usan la pantalla del curso y la de la clase. La de la clase lo necesita
 * para no depender de lo que le paso la pantalla anterior: antes la clase
 * llegaba solo en el estado de la navegacion, y al recargar se perdia el video.
 *
 * Devuelve { curso, modulos }. curso puede ser null si no se encontro.
 */
export const cargarModulosDelCurso = async ({ userRole, alumnoId, cursoId }) => {
  let curso = null;
  let modulos = [];

  // El nombre del curso es un adorno: si no se consigue (el admin mirando el
  // curso de una alumna no pasa ese chequeo), los modulos se cargan igual.
  try {
    const cursos = await getCoursesByStudentId(alumnoId);
    const info = cursos?.data?.find((c) => (c.course_id || c.id) === parseInt(cursoId));
    if (info) {
      curso = {
        courseName: info.course_name || info.name,
        courseDescription: info.description,
      };
    }
  } catch {
    curso = null;
  }

  if (userRole === "student") {
    const filtrado = await getModulesByAlumnoAndCurso(alumnoId, cursoId);
    const datos = filtrado?.success && Array.isArray(filtrado.data) ? filtrado.data[0] : null;
    if (Array.isArray(datos?.courseModules)) {
      modulos = datos.courseModules.map((modulo) => ({
        id: modulo.moduleId,
        name: modulo.moduleName,
        description: modulo.moduleDescription || "Sin descripción",
        classes:
          modulo.moduleLessons?.map((clase) => ({
            lessonNumber: clase.lessonNumber,
            lessonTitle: clase.lessonTitle,
            lessonDescription: clase.lessonDescription,
            url: clase.lessonUrl,
            id: clase.lessonId,
          })) || [],
      }));
    }
    return { curso, modulos };
  }

  const respuesta = await getModulesByCourseID(cursoId);
  const sinClases = respuesta?.success && Array.isArray(respuesta.data) ? respuesta.data : [];
  modulos = await Promise.all(
    sinClases.map(async (modulo) => {
      let classes = [];
      try {
        const clases = await getLessonsByModuleIdAndCourseId(cursoId, modulo.id);
        classes =
          clases.success && Array.isArray(clases.data)
            ? clases.data.map((clase) => ({
                lessonNumber: clase.lesson_number,
                lessonTitle: clase.title,
                lessonDescription: clase.description,
                url: clase.url,
                id: clase.id,
              }))
            : [];
      } catch {
        // Un modulo cuyas clases no cargan se muestra vacio; no tira la pantalla.
      }
      return { id: modulo.id, name: modulo.name, description: modulo.description, classes };
    })
  );
  return { curso, modulos };
};
