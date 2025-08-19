import { Route, Routes } from "react-router-dom";
import Index from "../pages/index/index";
import Login from "../pages/login/login";
import Register from "../pages/register/register";
import PageAuxiliar from "../pages/pageAuxiliar/pageAuxiliar";
import AlumnosMisCursos from "../pages/alumnos/alumnosMisCursos/alumnosMisCursos";
import Curso from "../pages/alumnos/curso/curso";
import Clase from "../pages/alumnos/clase/clase";
import ProfesoresMisCursos from "../pages/profesores/profesoresMisCursos/profesoresMisCursos";
import PanelAdmin from "../pages/admin/panelAdmin/panelAdmin";
import OlvideContraseña from "../pages/olvideContraseña/olvideContraseña";
import AdminAlumnos from "../pages/admin/adminAlumnos/adminAlumnos";
import EditAlumno from "../pages/admin/adminAlumnos/editAlumno/editAlumno";
import AdminCourses from "../pages/admin/adminCursos/adminCourses";
import ChangePassword from "../pages/changePassword/changePassword";
import EditarCurso from "../pages/admin/adminCursos/editarCurso/editarCurso";
import EditLessons from "../pages/admin/adminCursos/editLessons/editLessons";
import ModuleDetails from "../pages/alumnos/modulo/modulo";
import AdminProfesores from "../pages/admin/adminProfesor/adminProfesor";
import EditProfesor from "../pages/admin/adminProfesor/editProfesor/editProfesor";

// ✅ Nueva importación para ver alumnos del curso
import VerAlumnosCurso from "../pages/admin/adminCursos/verAlumnos/VerAlumnosCurso";

// Teacher Dashboard Components
import TeacherDashboard from "../pages/profesores/dashboard/TeacherDashboard";
import CourseManagement from "../pages/profesores/courses/CourseManagement";
import CourseDetailManagement from "../pages/profesores/courseDetail/CourseDetailManagement";
import StudentsManagement from "../pages/profesores/students/StudentsManagement";
import LibraryManagement from "../pages/profesores/library/LibraryManagement";
import MessagesManagement from "../pages/profesores/messages/MessagesManagement";
import SettingsManagement from "../pages/profesores/settings/SettingsManagement";

const AppRouter = () => {
    return (
        <Routes>
            <Route path="/" element={<Index></Index>}></Route>

            <Route path="/login" element={<Login></Login>}></Route>
            <Route path="/register" element={<Register></Register>}></Route>
            <Route path="/pageAuxiliar" element={<PageAuxiliar></PageAuxiliar>}></Route>
            <Route path="/OlvideContraseña" element={<OlvideContraseña></OlvideContraseña>}></Route>
            <Route path="/changePassword" element={<ChangePassword></ChangePassword>}></Route>

            <Route path="/admin" element={<PanelAdmin></PanelAdmin>}></Route>
            <Route path="/admin/alumnos" element={<AdminAlumnos></AdminAlumnos>}></Route>
            <Route path="/admin/editarAlumno/:id" element={<EditAlumno ></EditAlumno>}></Route>
            <Route path="/admin/cursos" element={<AdminCourses></AdminCourses>}></Route>
            <Route path="/admin/editarCurso/:cursoId" element={<EditarCurso></EditarCurso>}></Route>
            <Route path="/admin/editarCurso/:cursoId/module/:moduleId" element={<EditLessons></EditLessons>}></Route>
            
            {/* ✅ Nueva ruta para ver alumnos de un curso */}
            <Route path="/admin/cursos/alumnos/:courseId" element={<VerAlumnosCurso />} />
            
            <Route path="/admin/profesores" element = {<AdminProfesores/>}></Route>
            <Route path="/admin/editarProfesor/:id" element={<EditProfesor/>}></Route>
            
            <Route path="/alumnos/miscursos/:alumnoId" element={<AlumnosMisCursos />} />
            <Route path="/alumnos/:alumnoId/curso/:cursoId" element={<Curso></Curso>}></Route>
            <Route path="/alumnos/:alumnoId/curso/:cursoId/modulo/:moduleId" element={<ModuleDetails></ModuleDetails>}></Route>
            <Route path="/alumnos/:alumnoId/curso/:cursoId/clase/:claseId" element={<Clase></Clase>}></Route>

            <Route path="/profesores/profesoresMisCursos/:id" element={<ProfesoresMisCursos></ProfesoresMisCursos>}></Route>
            
            {/* Teacher Dashboard Routes */}
            <Route path="/profesores/dashboard" element={<TeacherDashboard />} />
            <Route path="/profesores/curso/:courseId" element={<CourseManagement />} />
            <Route path="/profesores/curso/:courseId/completo" element={<CourseDetailManagement />} />
            <Route path="/profesores/curso/:courseId/modulos" element={<CourseDetailManagement />} />
            <Route path="/profesores/curso/:courseId/estudiantes" element={<StudentsManagement />} />
            <Route path="/profesores/mis-cursos" element={<CourseManagement />} />
            <Route path="/profesores/estudiantes" element={<StudentsManagement />} />
            <Route path="/profesores/biblioteca" element={<LibraryManagement />} />
            <Route path="/profesores/mensajes" element={<MessagesManagement />} />
            <Route path="/profesores/configuracion" element={<SettingsManagement />} />
        </Routes>
    )
}

export default AppRouter;