import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import AppRouter from "./router/AppRouter.jsx";
import "./main.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AppRouter></AppRouter>
  </BrowserRouter>
);
