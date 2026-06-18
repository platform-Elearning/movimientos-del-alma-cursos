import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CardInsignia from "../../../components/cardInsignia/CardInsignia";
import CardInsigniaEmpty from "../../../components/cardInsigniaEmpty/cardInsigniaEmpty"
import "./alumnosMIsCertificaciones.css";
import { getCoursesByStudentId, getAllCoursesPublic } from "../../../api/cursos";
import { getEnrollmentsByAlumnoId } from "../../../api/alumnos";

const AlumnosMisCertificaciones = () =>{
  const {alumnoId} = useParams();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState([]);
  const [error, setError] = useState(null);

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
      <div className="cont">
    {enrollments.map((enr)=>{
      return(

          <CardInsignia
          key={enr.course_id}
          enrollment={enr}
          ></CardInsignia>
        )      
      }
    )}

      </div>
    </section>
    )
}

export default AlumnosMisCertificaciones