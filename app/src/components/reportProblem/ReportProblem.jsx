import { useState, useEffect } from "react";
import { getReports } from "../../api/createReport.js";
import "./ReportProblem.css";

const ReportsList = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUsingMockData, setIsUsingMockData] = useState(false);

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

  if (loading) {
    return (
      <div className="card">
        <section className="card-header">
          <h2 className="card-title">Cargando reportes...</h2>
        </section>
        <section className="card-info">
          <p>Por favor espera...</p>
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <section className="card-header">
          <h2 className="card-title">Error</h2>
        </section>
        <section className="card-info">
          <p style={{ color: "#ff3333" }}>{error}</p>
        </section>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="card">
        <section className="card-header">
          <h2 className="card-title">Reportes</h2>
        </section>
        <section className="card-info">
          <p>No hay reportes disponibles</p>
        </section>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {isUsingMockData && (
        <div className="card" style={{ backgroundColor: "#fff3cd", borderColor: "#ffeaa7" }}>
          <section className="card-info" style={{ textAlign: "center", padding: "10px" }}>
            <p style={{ color: "#856404", margin: 0 }}>
              ⚠️ <strong>Modo de Prueba:</strong> Mostrando datos de ejemplo. 
              El endpoint de reportes no está disponible en el backend.
            </p>
          </section>
        </div>
      )}
      {reports.map((report, index) => (
        <div key={index} className="card">
          {" "}
          {/* Usamos el índice como key ya que no hay id */}
          <section className="card-header">
            <h2 className="card-title">Reporte #{index + 1}</h2>{" "}
            {/* Mostramos el índice + 1 como número de reporte */}
          </section>
          <section
            className="card-info"
            style={{ textAlign: "left", padding: "15px" }}
          >
            <div style={{ marginBottom: "10px" }}>
              <strong>Email:</strong> {report.email}{" "}
              {/* Mostramos el email en lugar de user_id */}
            </div>
            <div style={{ marginBottom: "10px" }}>
              <strong>Fecha:</strong>{" "}
              {new Date(report.created_at).toLocaleDateString()} -{" "}
              {new Date(report.created_at).toLocaleTimeString()}
            </div>
            <div
              style={{
                backgroundColor: "#f8f9fa",
                padding: "10px",
                borderRadius: "5px",
                borderLeft: "3px solid #83711B",
              }}
            >
              <strong>Descripción:</strong>
              <p style={{ marginTop: "5px", whiteSpace: "pre-wrap" }}>
                {report.description}
              </p>
            </div>
          </section>
        </div>
      ))}
    </div>
  );
};

export default ReportsList;
