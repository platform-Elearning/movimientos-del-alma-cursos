import { useState, useEffect } from "react";
import { getReports } from "../../api/createReport.js";
import "./ReportProblem.css";

const ReportsList = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getReports();
        setReports(data.data.data);
        setError(null);
      } catch (err) {
        setError(
          "No se pudieron cargar los reportes. Por favor intenta nuevamente."
        );
        console.error("Error fetching reports:", err);
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
