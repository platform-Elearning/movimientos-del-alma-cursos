import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import AppRouter from "./router/AppRouter.jsx";
import { AuthProvider } from "./components/context/authContext";
import "./main.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  </AuthProvider>
);