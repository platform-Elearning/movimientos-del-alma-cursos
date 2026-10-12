import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CardInsignia from "../../../components/cardInsignia/CardInsignia";
import CardInsigniaEmpty from "../../../components/cardInsigniaEmpty/cardInsigniaEmpty"
import "./alumnosMIsCertificaciones.css";
import { getCoursesByStudentId, getAllCoursesPublic } from "../../../api/cursos";
import { getEnrollmentsByAlumnoId } from "../../../api/alumnos";
import { getResumenDeProgreso } from "../../../api/progreso";
import { useAuth } from "../../../services/authContext";
import MiConstancia from "../../../components/progreso/MiConstancia";

const AlumnosMisCertificaciones = () =>{
  const {alumnoId} = useParams();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState([]);
  const [error, setError] = useState(null);
  const [resumen, setResumen] = useState(null);
  const { userRole } = useAuth();

  useEffect(() => {
    if (userRole !== "student") return;
    getResumenDeProgreso()
      .then(setResumen)
      .catch(() => setResumen(null));
  }, [userRole]);

  // traemos los enrollments del alumno
  const fetchEnrollments = async()=>{
    try {
      const enrollmentsData = await getEnrollmentsByAlumnoId(alumnoId)
      const data=enrollmentsData.enrollments
      setEnrollments(data)
      
    }catch(er){
      console.log(er)
    } 
  }
  
  // TRAEMOS LOS ENROLLMENTS DEL ALUMNO
  useEffect(() => {
    fetchEnrollments();
    }, [setEnrollments]);




return(
    <section>
      <div className="title-container" >
        <h2 className="cursos-title">Mis Certificaciones</h2>
      </div>
      {resumen && <MiConstancia logros={resumen.logros} racha={resumen.racha} />}
      <div className="cont">
    {enrollments.map((enr)=>{
      return(

          <CardInsignia
          key={enr.course_id}
          enrollment={enr}
          progreso={resumen?.cursos.find((c) => c.course_id === enr.course_id)}
          logros={resumen?.logros}
          ></CardInsignia>
        )      
      }
    )}

      </div>
    </section>
    )
}

export default AlumnosMisCertificaciones