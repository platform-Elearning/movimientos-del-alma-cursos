import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import AppRouter from "./router/AppRouter.jsx";
import "./main.css";
import Navbar from "./components/navbar/Navbar.jsx";
import { AuthProvider, useAuth } from "./services/authContext.jsx";

const App = () => {
  const { isLoading } = useAuth();

  // Comentamos temporalmente el loading para evitar errores
  // if (isLoading) {
  //   return <Loading />;
  // }

  return (
    <>
      <Navbar />
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