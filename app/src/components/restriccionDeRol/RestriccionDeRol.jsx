import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../services/authContext";
import { destinoSegunRol, rutaPermitida } from "../../utils/roles";

/**
 * Si el rol tiene sus pantallas acotadas (marketing) y se entra a otra -- por
 * URL, por el historial, por un link viejo --, lo devuelve a la suya. La
 * seguridad la pone el backend; esto evita que vea pantallas vacías y con
 * errores que no son para él.
 */
const RestriccionDeRol = () => {
  const { userRole, userId } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!userRole || rutaPermitida(userRole, location.pathname)) return;
    const destino = destinoSegunRol(userRole, userId);
    if (destino) navigate(destino, { replace: true });
  }, [userRole, userId, location.pathname, navigate]);

  return null;
};

export default RestriccionDeRol;
