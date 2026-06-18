import React, { useState, useEffect } from 'react';
import './CardModuleTeacher.css';
import AuthUtils from '../../utils/authUtils';
import { useNavigate, useParams } from 'react-router-dom';



const CardModuleTeacher = ({ 
  student, 
  onViewProgress, 
  onSendMessage, 
  getProgressColor,
  getStatusBadge,
  approved,
  noApproved,
  updateUrl,
}

) => {
  const [url_certificate, setUrl_certificate] = useState(student.url_certificate ?? '');

  return (
    <section className='card-main'>
    <div className="teacher-student-card">

      <div className="teacher-card-avatar">
        <img 
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=4CAF50&color=fff&size=60`}
          alt={student.name}
        />
      </div>
      
      <div className="teacher-card-info">
        <div className="teacher-card-main-info">
          <h3 className="teacher-card-name">{student.name}</h3>
          <p className="teacher-card-email">{student.email}</p>
          <p className="teacher-card-id">ID: {student.identification_number}</p>
        </div>
        
        <div className="teacher-card-course-info">
          <p className="teacher-card-course-name">{student.course_name}</p>
          <p className="teacher-card-enrollment-date">
            Inscrito: {new Date(student.enrollment_date).toLocaleDateString()}
          </p>
        </div>
      </div>
      
      <div className="teacher-card-progress">
        <div className="teacher-progress-info">
          <span className="teacher-progress-text">{student.progress}% completado</span>
          <span className="teacher-lessons-info">
            {student.completed_lessons}/{student.total_lessons} módulos
          </span>
        </div>
        <div className="teacher-progress-bar">
          <div 
            className="teacher-progress-fill"
            style={{
              width: `${student.progress}%`,
              backgroundColor: getProgressColor(student.progress)
            }}
          />
        </div>
        <p className="teacher-last-activity">
          Última actividad: {new Date(student.last_activity).toLocaleDateString()}
        </p>
      </div>
      
      <div className="teacher-card-status">
        {getStatusBadge(student.status)}
      </div>
      
      <div className="teacher-card-actions">
        <button 
          className="teacher-btn-primary"
          onClick={() => onViewProgress(student)}
          title="Ver progreso detallado"
        >
          📊 Progreso
        </button>
       {/*  <button 
          className="teacher-btn-secondary"
          onClick={() => onSendMessage(student)}
          title="Enviar mensaje"
        >
          💬 Mensaje
        </button> */}
      </div>
    </div>

  
      {  /* PARTE DE CARD DE APROBACION */    }
      <div className='card-main-2' >
        <div className='card-main-2-sec'>
          <div>
            <h4 className='card-main-2-tit' >Condicion de aprobación:</h4>
            {student.approved === true ? (<h4>Aprobado</h4>):(<h4>No Aprobado</h4>)}
          </div>

          <div>
             {student.approved === true ? (

               <button className="teacher-btn-aprov"
               type='submit'
               onClick={() => noApproved(student.id_enrollment)}
               >Dar como No aprobado</button>
              ):(
                
                <button className="teacher-btn-aprov" type='submit'
                    onClick={() => approved(student.id_enrollment)}
                >Dar como aprobado</button>
              )}

          </div>
        </div>

      {  /* PARTE DE CARD DE LINK */    }
      {student.url_certificate === null ?
       (// si el url es igual a null debemos cargarlo
        
        <form action="" className='card-main-2-sec2' onSubmit={(e) => e.preventDefault()} >
          <div>
              <label htmlFor="" className='form-cert-label'>Ingresar link al certificado: </label>
              <input
              value={url_certificate}
              onChange={(e) => setUrl_certificate(e.target.value)}
              type="text" className='input_url' placeholder='https://docs.google.com/document/d/bl...' />
          </div>
          <div>
          <button className="teacher-btn-aprov"
              type='submit'

              onClick={() => updateUrl(student.id_enrollment,url_certificate)}>Guardar link</button>

          </div>
        </form>


       ):(// si el url es diferente a null debemos mostrarlo y dar la opcion de editarlo
          <div className='card-main-2-sec3' >
            <h4 className='card-main-2-tit' >Link actual al documento:</h4>
            <a href={student.url_certificate} target='_blank' >{student.url_certificate}</a>
           <form action="" className='card-main-2-sec4' onSubmit={(e) => e.preventDefault()} >
          <div >
              <label htmlFor="" className='form-cert-label'>Ingresar nuevo link al certificado: </label>
              <input
              value={url_certificate}
              onChange={(e) => setUrl_certificate(e.target.value)}
              type="text" className='input_url' placeholder='https://docs.google.com/document/d/bl...' />
          </div>
          <div>
          <button className="teacher-btn-aprov"
              type='submit'

              onClick={() => updateUrl(student.id_enrollment,url_certificate)}>Guardar nuevo link</button>

          </div>
        </form>

          </div>


)
      }
      </div>

      
    </section>
  );
};

export default CardModuleTeacher;