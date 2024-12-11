import { Route, Routes } from "react-router-dom";
import Index from "../pages/index/index";
import Login from "../pages/login/login";
import Register from "../pages/register/register";
import PageAuxiliar from "../pages/pageAuxiliar/pageAuxiliar";
import MisCursos from "../pages/alumnos/misCursos/misCursos";
import Curso from "../pages/alumnos/curso/curso";
import Clase from "../pages/alumnos/clase/clase";
import Layout from "../components/layout/Layout";

const AppRouter = () => {
    return (
        <Routes>
          
            <Route path="/" element={<Login />} />
    
            <Route element={<Layout />}>
                <Route path="/index" element={<Index />} />
                <Route path="/register" element={<Register />} />
                <Route path="/pageAuxiliar" element={<PageAuxiliar />} />
                <Route path="/alumnos/miscursos/:id" element={<MisCursos />} />
                <Route path="/alumnos/curso/:id" element={<Curso />} />
                <Route path="/alumnos/clase/:id" element={<Clase />} />
            </Route>
        </Routes>
    );
};

export default AppRouter;