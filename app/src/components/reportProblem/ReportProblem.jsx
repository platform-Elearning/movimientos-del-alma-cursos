import { useState, useEffect } from "react";
import { getReports, deleteReport, updateReportStatus } from "../../api/createReport.js";
import "./ReportProblem.css";

const STATUS_LABELS = {
  pendiente: { label: "Pendiente", color: "#e67e22" },
  "en revision": { label: "En revisión", color: "#2980b9" },
  revisado: { label: "Revisado", color: "#27ae60" },
};

const ReportsList = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUsingMockData, setIsUsingMockData] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getReports();
        
        // Verificar diferentes estructuras de respuesta posibles
        let reportsData = [];
        if (data?.data?.data) {
          reportsData = data.data.data;
        } else if (data?.data) {
          reportsData = Array.isArray(data.data) ? data.data : [data.data];
        } else if (Array.isArray(data)) {
          reportsData = data;
        }
        
        // Verificar si son datos de ejemplo (mock data)
        const isMock = reportsData.some(report => 
          report.email?.includes("ejemplo.com") || 
          report.description?.includes("datos de ejemplo")
        );
        setIsUsingMockData(isMock);
        
        setReports(reportsData);
        setError(null);
      } catch (err) {
        console.error("Error fetching reports:", err);
        
        // Mensaje de error más específico
        let errorMessage = "No se pudieron cargar los reportes. Por favor intenta nuevamente.";
        
        if (err.response?.status === 404) {
          errorMessage = "El endpoint de reportes no está disponible en el servidor.";
        } else if (err.response?.status === 401) {
          errorMessage = "No tienes permisos para ver los reportes.";
        } else if (err.response?.status === 500) {
          errorMessage = "Error interno del servidor al obtener reportes.";
        } else if (err.message === 'Network Error') {
          errorMessage = "Error de conexión. Verifica que el servidor esté funcionando.";
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de que querés eliminar este reporte?")) return;
    setActionLoading(id + "-delete");
    try {
      await deleteReport(id);
      setReports((prev) => prev.filter((r) => r.id !== id));
    } catch {
      alert("Error al eliminar el reporte.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleStatusChange = async (id, status) => {
    setActionLoading(id + "-" + status);
    try {
      await updateReportStatus(id, status);
      setReports((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r))
      );
    } catch (err) {
      console.error("Error al actualizar el estado:", err?.response?.data || err?.message || err);
      const msg = err?.response?.data?.error || err?.response?.data?.errorMessage || "Error al actualizar el estado.";
      alert(msg);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="reports-page">
      <div className="reports-page-header">
        <h2 className="reports-page-title">Reportes</h2>
        {!loading && !error && (
          <span className="reports-count">
            {reports.length} {reports.length === 1 ? "reporte" : "reportes"}
          </span>
        )}
      </div>

      <div className="reports-page-body">
        {loading && (
          <div className="reports-status">
            <div className="loading-spinner"></div>
            <p>Cargando reportes...</p>
          </div>
        )}

        {error && (
          <div className="reports-status">
            <p className="error-message">{error}</p>
          </div>
        )}

        {!loading && !error && reports.length === 0 && (
          <div className="reports-status">
            <p className="empty-state">No hay reportes disponibles</p>
          </div>
        )}

        {!loading && !error && isUsingMockData && (
          <div className="reports-mock-banner">
            <strong>Modo de Prueba:</strong> Mostrando datos de ejemplo. El
            endpoint de reportes no está disponible en el backend.
          </div>
        )}

        {!loading && !error && reports.map((report, index) => {
          const statusInfo = STATUS_LABELS[report.status] || STATUS_LABELS["pendiente"];
          return (
            <div key={report.id ?? index} className="report-item">
              <div className="report-item-header">
                <span className="report-item-number">#{index + 1}</span>
                <span
                  className="report-item-status"
                  style={{ backgroundColor: statusInfo.color }}
                >
                  {statusInfo.label}
                </span>
                <span className="report-item-date">
                  {new Date(report.created_at).toLocaleDateString()} —{" "}
                  {new Date(report.created_at).toLocaleTimeString()}
                </span>
              </div>
              <div className="report-item-body">
                <div className="report-item-email">
                  <strong>Email:</strong> {report.email}
                </div>
                <div className="report-item-description">
                  <strong>Descripción:</strong>
                  <p>{report.description}</p>
                </div>
                <div className="report-item-actions">
                  <button
                    className="report-btn report-btn--revision"
                    disabled={report.status === "en revision" || actionLoading !== null}
                    onClick={() => handleStatusChange(report.id, "en revision")}
                  >
                    {actionLoading === report.id + "-en revision" ? "..." : "En revisión"}
                  </button>
                  <button
                    className="report-btn report-btn--revisado"
                    disabled={report.status === "revisado" || actionLoading !== null}
                    onClick={() => handleStatusChange(report.id, "revisado")}
                  >
                    {actionLoading === report.id + "-revisado" ? "..." : "Revisado"}
                  </button>
                  <button
                    className="report-btn report-btn--delete"
                    disabled={actionLoading !== null}
                    onClick={() => handleDelete(report.id)}
                  >
                    {actionLoading === report.id + "-delete" ? "..." : "Eliminar"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReportsList;
