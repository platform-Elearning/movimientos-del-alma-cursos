import { Route, Routes } from "react-router-dom";
import Index from "../pages/index/index";
import Login from "../pages/login/login";
import Register from "../pages/register/register";
import PageAuxiliar from "../pages/pageAuxiliar/pageAuxiliar";
import MisCursos from "../pages/alumnos/misCursos/misCursos";
import Curso from "../pages/alumnos/curso/curso";
import Clase from "../pages/alumnos/clase/clase";

const AppRouter = () => {
    return (
        <Routes>
            <Route path="/" element={<Index></Index>}></Route>
            <Route path="/login" element={<Login></Login>}></Route>
            <Route path="/register" element={<Register></Register>}></Route>
            <Route path="/pageAuxiliar" element={<PageAuxiliar></PageAuxiliar>}></Route>
            <Route path="/alumnos/miscursos/:id" element={<MisCursos></MisCursos>}></Route>
            <Route path="/alumnos/curso/:id" element={<Curso></Curso>}></Route>
            <Route path="/alumnos/clase/:id" element={<Clase></Clase>}></Route>
        </Routes>
    )
}

export default AppRouter;