import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./curso.css";
import { getProfesoreByCourseId } from "../../../api/profesores";
import { useAuth } from "../../../services/authContext";
import ModuleCard from "../../../components/moduleCard/ModuleCard";
import BackLink from "../../../components/backLink/BackLink";
import imgProf from "../../../assets/emoji-profesores.png";
import { obtenerLinkDirecto } from "../../../utils/drive";
import { cargarModulosDelCurso } from "../../../services/clasesDelCurso";
import { useProgresoDelCurso } from "../../../services/useProgresoDelCurso";
import { ordenarClases } from "../../../utils/progreso";
import BarraDeProgreso from "../../../components/progreso/BarraDeProgreso";
import Celebracion from "../../../components/progreso/Celebracion";
import MuroDeLogros from "../../../components/progreso/MuroDeLogros";

const CourseDetails = () => {
  const { cursoId, alumnoId } = useParams();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [course, setCourse] = useState();
  const [profesor, setProfesor] = useState(null);
  const navigate = useNavigate();
  const { userRole, logout } = useAuth();

  const getProfesorByCourse = async (courseId) => {
    try {
      const response = await getProfesoreByCourseId(courseId);
      // length y no solo data: un curso sin profesor devuelve una lista vacia,
      // y data[0] seria undefined.
      if (response.success && response.data?.length) {
        setProfesor(response.data[0]);
      }
    } catch (error) {
      // Que no haya profesor no puede impedir ver el curso. Se deja el aviso en
      // consola y la pantalla sigue con la cabecera simple.
      console.warn("No se pudo obtener el profesor del curso:", error?.message);
    }
  };
  useEffect(() => {
    if (cursoId) {
      getProfesorByCourse(cursoId);
    }
  }, [cursoId]);  

  const esAlumna = userRole === "student";
  const progreso = useProgresoDelCurso(cursoId, esAlumna);

  const fetchModules = async () => {
    try {
      const { curso, modulos } = await cargarModulosDelCurso({ userRole, alumnoId, cursoId });
      if (curso) setCourse(curso);
      setModules(modulos);
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        logout();
      } else {
        setError(`Error al obtener los módulos: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // No ejecutar hasta saber el rol: de el depende que modulos se piden.
    if (cursoId && alumnoId && userRole) {
      fetchModules();
    }
  }, [cursoId, alumnoId, userRole]);

  const clases = useMemo(() => ordenarClases(modules), [modules]);
  const ultimaClase = clases.find((c) => c.id === progreso.ultimaClaseId);
  // Seguir desde la ultima que abrio; si ya la hizo, desde la primera que falta.
  const claseParaSeguir =
    ultimaClase && progreso.completadas && !progreso.completadas.has(ultimaClase.id)
      ? ultimaClase
      : clases.find((c) => !progreso.completadas?.has(c.id));

  const irAClase = (clase) =>
    navigate(`/alumnos/${alumnoId}/curso/${cursoId}/clase/${clase.id}`, {
      state: { classItem: { ...clase, lessonUrl: clase.url } },
    });

  const goToFormation = (alumnoId) => {
    navigate(`/alumnos/miscursos/${alumnoId}`);
  };

  if (loading) return <p className="loading-message">Cargando módulos...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <>
      <div className="course-details-container">
        <div>
          <BackLink
            title="Volver a Mis Formaciones"
            onClick={() => goToFormation(alumnoId)}
          />
        </div>

      {profesor?.description_teacher ? (
        <div className="tit-cont">
          <div className="tit-cont-img">
          <img 
        src={profesor.url_avatar ? obtenerLinkDirecto(profesor.url_avatar) : imgProf} 
        alt="Foto del profesor" 
        style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }}
      />
          
          </div>
          <div className="tit-cont-prof">
            <h4>Nombre Profesor: {profesor.name}</h4>
            <p>{profesor.description_teacher}</p>
          </div>
          <div className="tit-cont-curso">
            <h4>Curso: {course?.courseName}</h4>
            <p>{course?.courseDescription}</p>
          </div>
        </div>
      ):(

        <h3 className="course-title">
          {course?.courseName || "Cargando curso..."}
        </h3>
      )
      }
        {esAlumna && progreso.completadas && (
          <div className="curso-avance">
            <BarraDeProgreso
              completadas={progreso.completadas.size}
              total={progreso.total || clases.length}
            />
            {claseParaSeguir && (
              <button
                type="button"
                className="boton-dorado"
                onClick={() => irAClase(claseParaSeguir)}
              >
                {progreso.completadas.size === 0 ? "Empezar" : "Continuar"}: {claseParaSeguir.lessonTitle} ▶
              </button>
            )}
            {progreso.error && <p className="curso-avance-error">{progreso.error}</p>}
          </div>
        )}
        {modules.length > 0 ? (
          <div className="modules-grid">
            {modules.map((module) => (
              <ModuleCard
                moduleName={module.name}
                key={module.id}
                lessons={module.classes}
                completadas={esAlumna ? progreso.completadas : undefined}
                onMarcar={esAlumna ? (clase, hecha) => progreso.marcar(clase.id, hecha) : undefined}
              />
            ))}
          </div>
        ) : (
          <p>No hay módulos disponibles para este curso.</p>
        )}
        {esAlumna && <MuroDeLogros cursoId={cursoId} recargar={progreso.versionDeLogros} />}
      </div>
      <Celebracion logros={progreso.logrosNuevos} onCerrar={progreso.cerrarCelebracion} />
    </>
  );
};

export default CourseDetails;
