/**
 * Guiones del recorrido guiado.
 *
 * Cada paso apunta a un selector real de la pantalla. No hace falta que todos
 * existan a la vez: Tour.jsx descarta los que no estan presentes, asi que el
 * mismo guion sirve en "Mis cursos", en una clase o en el panel del profesor, y
 * en cada lugar se muestran solo los pasos que aplican.
 *
 * Para agregar un paso: sumar un objeto con selector, titulo y texto. Conviene
 * anclar a clases estructurales y no a estilos, para que no se rompa con un
 * cambio visual.
 */

export const guionAlumna = [
  {
    selector: ".cursos-title, .cursos-container",
    titulo: "Tus formaciones",
    texto:
      "Acá aparecen todas las formaciones en las que estás inscripta. Tocá cualquiera para entrar y ver sus módulos y clases.",
  },
  {
    selector: ".lock-overlay",
    titulo: "Contenido bloqueado",
    texto:
      "Si una formación aparece con candado todavía no está habilitada. Se desbloquea cuando se registra tu pago.",
  },
  {
    selector: ".video-container, .class-details-container",
    titulo: "La clase",
    texto:
      "Acá está el video junto con el material de la clase. Podés verlo las veces que quieras y cuando quieras: no hay horarios ni vencimiento.",
  },
  {
    selector: ".comment-form, .comment-input, .comment-submit",
    titulo: "Preguntá lo que necesites",
    texto:
      "Escribí tu consulta acá y tu profesora la responde desde su panel. Volvé a esta clase para ver la respuesta.",
  },
  {
    selector: ".comments-section, .comments-list",
    titulo: "Las consultas de la clase",
    texto:
      "Acá quedan todas las preguntas y respuestas. Conviene leerlas antes de escribir: seguramente alguien ya preguntó lo mismo.",
  },
  {
    selector: ".report-button",
    titulo: "Si algo no funciona",
    texto:
      "Desde acá nos avisás si un video no carga o encontrás cualquier problema. Llega directo al equipo.",
  },
];

export const guionProfesor = [
  {
    selector: ".dashboard-title, .teacher-dashboard",
    titulo: "Tu panel",
    texto:
      "Este es el resumen de tus cursos. Desde acá entrás a cada uno para ver sus módulos, su material y sus alumnas.",
  },
  {
    selector: ".courses-grid",
    titulo: "Tus cursos",
    texto:
      "Cada tarjeta es un curso que dictás. Al entrar vas a poder cargar clases, subir material y ver quiénes están cursando.",
  },
  {
    selector: ".notification-button",
    titulo: "Mensajes de tus alumnas",
    texto:
      "Cuando una alumna deja una consulta en alguna de tus clases, te avisa acá. El número son las que todavía no respondiste.",
  },
];

/**
 * Elige el guion segun el rol, no segun la ruta: un profesor entrando a una
 * clase navega por rutas que empiezan con /alumnos, y decidir por la URL le
 * mostraba el recorrido equivocado.
 */
export const guionPara = (userRole) => {
  if (userRole === "teacher") return guionProfesor;
  if (userRole === "student") return guionAlumna;
  return null;
};
