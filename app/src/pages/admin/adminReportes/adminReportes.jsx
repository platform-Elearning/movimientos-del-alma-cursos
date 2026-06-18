import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../services/authContext";
import ReportsList from "../../../components/reportProblem/ReportProblem";
import BackLink from "../../../components/backLink/BackLink";
import "./adminReportes.css";

const AdminReportes = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated === false) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const goToInicio = () => {
    navigate("/admin");
  };

  if (!isAuthenticated) return null;

  return (
    <div className="admin-reportes-wrapper">
      <BackLink title="Volver" onClick={goToInicio} />
      <div className="admin-reportes-container">
        <ReportsList />
      </div>
    </div>
  );
};

export default AdminReportes;
