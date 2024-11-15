import { Route, Routes } from "react-router-dom";
import Index from "../pages/index/index";
import Login from "../pages/login/login";
import Register from "../pages/register/register";

const AppRouter = () => {
    return (
        <Routes>
            <Route path="/" element={<Index></Index>}></Route>
            <Route path="/login" element={<Login></Login>}></Route>
            <Route path="/register" element={<Register></Register>}></Route>
        </Routes>
    )
}

export default AppRouter;