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
import EditAlumno from "../pages/admin/editAlumno/editAlumno";

const AppRouter = () => {
    return (
        <Routes>
            <Route path="/" element={<Index></Index>}></Route>

            <Route path="/login" element={<Login></Login>}></Route>
            <Route path="/register" element={<Register></Register>}></Route>
            <Route path="/pageAuxiliar" element={<PageAuxiliar></PageAuxiliar>}></Route>
            <Route path="/OlvideContraseña" element={<OlvideContraseña></OlvideContraseña>}></Route>

            <Route path="/admin" element={<PanelAdmin></PanelAdmin>}></Route>
            <Route path="/admin/alumnos" element={<AdminAlumnos></AdminAlumnos>}></Route>
            <Route path="/admin/editarAlumno/:id" element={<EditAlumno></EditAlumno>}></Route>
            
 
            <Route path="/alumnos/miscursos/:id" element={<AlumnosMisCursos />} />
            <Route path="/alumnos/curso/:id" element={<Curso></Curso>}></Route>
            <Route path="/alumnos/clase/:id" element={<Clase></Clase>}></Route>

            <Route path="/profesores/profesoresMisCursos/:id" element={<ProfesoresMisCursos></ProfesoresMisCursos>}></Route>
        </Routes>
    )
}

export default AppRouter;

