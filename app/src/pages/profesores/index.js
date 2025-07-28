// Exportar todos los componentes de profesores
export { default as TeacherDashboard } from './dashboard/TeacherDashboard';
export { default as CourseManagement } from './courses/CourseManagement';
export { default as CourseDetailManagement } from './courseDetail/CourseDetailManagement';
export { default as StudentsManagement } from './students/StudentsManagement';
export { default as LibraryManagement } from './library/LibraryManagement';
export { default as MessagesManagement } from './messages/MessagesManagement';
export { default as SettingsManagement } from './settings/SettingsManagement';
export { default as ProfesoresMisCursos } from './profesoresMisCursos/profesoresMisCursos';

// Exportar funciones de API específicas para profesores
export {
  getCourseByTeacherId,
  getCourseCompleteByTeacherId,
  getStudentByCourseId,
  getCoursesByTeacher,
  getCourseModules,
  createCourseModule,
  deleteCourseModule,
  createLesson,
  deleteLesson,
  getLessonsByModule,
  getStudentsByCourse,
  getCourseDetails
} from '../../api/profesores';
