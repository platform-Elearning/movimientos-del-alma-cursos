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
            <Route path="/admin/editarAlumno/:id" element={<EditAlumno></EditAlumno>}></Route>
            <Route path="/admin/cursos" element={<AdminCourses></AdminCourses>}></Route>
            <Route path="/admin/editarCurso/:cursoId" element={<EditarCurso></EditarCurso>}></Route>
            <Route path="/admin/editarCurso/:cursoId/module/:moduleId" element={<EditLessons></EditLessons>}></Route>
            <Route path="/admin/profesores" element = {<AdminProfesores/>}></Route>

            
            <Route path="/alumnos/miscursos/:alumnoId" element={<AlumnosMisCursos />} />
            <Route path="/alumnos/:alumnoId/curso/:cursoId" element={<Curso></Curso>}></Route>
            <Route path="/alumnos/:alumnoId/curso/:cursoId/modulo/:moduleId/clase/:claseId" element={<Clase></Clase>}></Route>
            <Route path="/alumnos/:alumnoId/curso/:cursoId/modulo/:moduleId" element={<ModuleDetails></ModuleDetails>}></Route>

            <Route path="/profesores/profesoresMisCursos/:id" element={<ProfesoresMisCursos></ProfesoresMisCursos>}></Route>
        </Routes>
    )
}

export default AppRouter;

