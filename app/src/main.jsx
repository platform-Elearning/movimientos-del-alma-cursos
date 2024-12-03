import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import AppRouter from "./router/AppRouter.jsx";
import "./main.css";
import Navbar from "./components/navbar/Navbar.jsx";
import { AuthProvider } from "./services/authContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <BrowserRouter>
      <Navbar />
      <AppRouter />
    </BrowserRouter>
  </AuthProvider>
);