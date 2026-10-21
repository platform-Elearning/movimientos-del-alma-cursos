import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageBanner from "../../../components/banner/PageBanner";
import CardInsignia from "../../../components/cardInsignia/CardInsignia";
import MiConstancia from "../../../components/progreso/MiConstancia";
import "./alumnosMIsCertificaciones.css";
import { getEnrollmentsByAlumnoId } from "../../../api/alumnos";
import { getResumenDeProgreso } from "../../../api/progreso";
import { useAuth } from "../../../services/authContext";

const AlumnosMisCertificaciones = () => {
  const { alumnoId } = useParams();
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resumen, setResumen] = useState(null);
  const { userRole, userNav } = useAuth();

  useEffect(() => {
    if (userRole !== "student") return;
    getResumenDeProgreso()
      .then(setResumen)
      .catch(() => setResumen(null));
  }, [userRole]);

  // Traemos los enrollments del alumno
  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const enrollmentsData = await getEnrollmentsByAlumnoId(alumnoId);
        setEnrollments(enrollmentsData.enrollments || []);
      } catch (er) {
        console.log(er);
        setError("No pudimos cargar tus certificaciones. Probá de nuevo en unos minutos.");
      } finally {
        setLoading(false);
      }
    };
    fetchEnrollments();
  }, [alumnoId]);

  const firstName = (userNav || "").split(" ")[0];
  const aprobadas = enrollments.filter((e) => e.approved === true);
  const enCurso = enrollments.filter((e) => e.approved !== true);

  const renderCard = (enr) => (
    <CardInsignia
      key={enr.course_id}
      enrollment={enr}
      progreso={resumen?.cursos.find((c) => c.course_id === enr.course_id)}
      logros={resumen?.logros}
    />
  );

  return (
    <>
      <PageBanner
        overline={firstName ? `Hola, ${firstName}` : undefined}
        title="Mis Certificaciones"
        chips={
          loading
            ? []
            : [
                {
                  label: `${aprobadas.length} ${aprobadas.length === 1 ? "aprobada" : "aprobadas"}`,
                  tone: "success",
                },
                { label: `${enCurso.length} en curso` },
              ]
        }
      />

      <div className="certificaciones-container">
        <div className="certificaciones-content">
          {resumen && (
            <MiConstancia logros={resumen.logros} racha={resumen.racha} />
          )}

          {loading && <p className="loading-message">Cargando certificaciones...</p>}
          {error && <p className="error-message">{error}</p>}

          {!loading && !error && enrollments.length === 0 && (
            <div className="certificaciones-vacio">
              <h2>Todavía no tenés formaciones</h2>
              <p>
                Cuando te sumes a una, vas a ver acá tu avance y tus certificados.
              </p>
              <button
                type="button"
                className="certificaciones-btn"
                onClick={() => navigate(`/alumnos/miscursos/${alumnoId}`)}
              >
                Ver formaciones
              </button>
            </div>
          )}

          {aprobadas.length > 0 && (
            <section className="certificaciones-section">
              <h2 className="certificaciones-section-title">Aprobadas</h2>
              <div className="certificaciones-grid">{aprobadas.map(renderCard)}</div>
            </section>
          )}

          {enCurso.length > 0 && (
            <section className="certificaciones-section">
              <h2 className="certificaciones-section-title">En curso</h2>
              <div className="certificaciones-grid">{enCurso.map(renderCard)}</div>
            </section>
          )}
        </div>
      </div>
    </>
  );
};

export default AlumnosMisCertificaciones;
