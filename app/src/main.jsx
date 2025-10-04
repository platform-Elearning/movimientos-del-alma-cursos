import ReactDOM from "react-dom/client";
import { BrowserRouter, useLocation } from "react-router-dom";
import AppRouter from "./router/AppRouter.jsx";
import "./main.css";
import Navbar from "./components/navbar/Navbar.jsx";
import { AuthProvider } from "./services/authContext.jsx";

const App = () => {
  const location = useLocation();
  
  // Rutas donde NO queremos mostrar el navbar
  const authRoutes = ['/', '/login', '/register', '/pageAuxiliar', '/OlvideContraseña', '/changePassword'];
  const hideNavbar = authRoutes.some(route => location.pathname === route);

  console.log('Current path:', location.pathname, 'Hide navbar:', hideNavbar);

  return (
    <>
      {!hideNavbar && <Navbar />}
      <AppRouter />
    </>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </AuthProvider>
);