import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCourseDetails, getProfesoreByCourseId } from "../../../api/profesores";
import { useAuth } from "../../../services/authContext";
import ModuleCard from "../../../components/moduleCard/ModuleCard";
import BackLink from "../../../components/backLink/BackLink";
import "../../alumnos/curso/curso.css";
import "./VistaPreviaCurso.css";
import imgProf from "../../../assets/emoji-profesores.png";
import { obtenerLinkDirecto } from "../../../utils/drive";

/**
 * El curso tal como lo ve una alumna, para que el profesor pueda revisarlo sin
 * necesidad de crearse un usuario de prueba.
 *
 * Reutiliza el CSS y la tarjeta de la vista real en lugar de imitarla: si esa
 * pantalla cambia, la vista previa cambia con ella y no queda mintiendo.
 */
const VistaPreviaCurso = () => {
  const { cursoId } = useParams();
  const navigate = useNavigate();
  const { userId } = useAuth();
  const [curso, setCurso] = useState(null);
  const [profesor, setProfesor] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId || !cursoId) return;
    let vigente = true;
    (async () => {
      try {
        setCargando(true);
        setError("");
        // getCourseDetails envuelve el curso en { success, data }.
        const respuesta = await getCourseDetails(cursoId, userId);
        if (vigente) setCurso(respuesta?.data || respuesta);
        // Mismo origen que usa la alumna: asi la vista previa muestra al
        // profesor realmente asignado al curso, no al que esta mirando.
        try {
          const prof = await getProfesoreByCourseId(cursoId);
          if (vigente && prof?.data?.length) setProfesor(prof.data[0]);
        } catch {
          // Sin datos del profesor se cae a la cabecera simple, igual que la
          // vista real cuando el profesor no cargo su descripcion.
        }
      } catch (e) {
        if (vigente) setError("No se pudo cargar el curso. Volvé a intentar.");
      } finally {
        if (vigente) setCargando(false);
      }
    })();
    return () => {
      vigente = false;
    };
  }, [cursoId, userId]);

  const modulos = curso?.modules || [];

  return (
    <div className="course-details-container">
      <div className="vista-previa-aviso" role="status">
        <strong>Vista previa</strong>
        <span>
          Así ve este curso una alumna inscripta. Las lecciones abren igual que
          para ellas; no se registra ningún progreso.
        </span>
        <button type="button" onClick={() => navigate(`/profesores/curso/${cursoId}/completo`)}>
          Volver a gestionar
        </button>
      </div>

      <BackLink
        title="Volver al curso"
        onClick={() => navigate(`/profesores/curso/${cursoId}/completo`)}
      />

      {cargando && <p className="loading-message">Cargando el curso…</p>}
      {error && <p className="error-message">{error}</p>}

      {!cargando && !error && (
        <>
          {profesor?.description_teacher ? (
            <div className="tit-cont">
              <div className="tit-cont-img">
                <img
                  src={profesor.url_avatar ? obtenerLinkDirecto(profesor.url_avatar) : imgProf}
                  alt="Foto del profesor"
                  style={{ maxWidth: "100%", height: "auto", borderRadius: "8px" }}
                />
              </div>
              <div className="tit-cont-prof">
                <h4>Nombre Profesor: {profesor.name}</h4>
                <p>{profesor.description_teacher}</p>
              </div>
              <div className="tit-cont-curso">
                <h4>Curso: {curso?.name}</h4>
                <p>{curso?.description}</p>
              </div>
            </div>
          ) : (
            <h3 className="course-title">{curso?.name || "Curso"}</h3>
          )}

          {modulos.length === 0 ? (
            <p className="loading-message">
              Este curso todavía no tiene módulos cargados. Una alumna vería esta
              misma pantalla vacía.
            </p>
          ) : (
            <div className="modules-grid">
              {modulos.map((modulo) => (
                <ModuleCard
                  key={modulo.id}
                  moduleName={modulo.name}
                  lessons={modulo.lessons}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default VistaPreviaCurso;
