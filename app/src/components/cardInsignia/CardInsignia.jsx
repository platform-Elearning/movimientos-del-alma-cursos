import "./CardInsignia.css";
import logo from "../../assets/logo2.png";
import BarraDeProgreso from "../progreso/BarraDeProgreso";
import InsigniasDelCurso from "../progreso/InsigniasDelCurso";

// El link al certificado y el link de verificacion son dos cosas distintas:
// el primero es el documento, el segundo es la pagina publica que prueba que ese
// documento es valido -- la que se pega en un CV o en LinkedIn. Solo el dueño de
// la credencial ve su codigo, porque llega por la ruta autenticada del alumno.
const VERIFY_BASE = import.meta.env.VITE_VERIFY_BASE_URL || "";

// progreso: { completadas, total, modulos } de la alumna en ese curso, opcional.
// logros: todos los de la alumna; la tarjeta muestra solo los de su curso. Sin
// logros (no es alumna) no se muestra la fila de insignias.
const CardInsignia = ({ enrollment, progreso, logros }) => {
  const aprobada = enrollment.approved === true;
  const verifyUrl = enrollment.verification_code
    ? `${VERIFY_BASE}/verificar/${enrollment.verification_code}`
    : null;

  return (
    <div className="insignia-con-logros">
      <div className={`insignia-card ${aprobada ? "es-aprobada" : "en-curso"}`}>
        <img src={logo} alt="" className="insignia-icon" />
        <div className="insignia-content">
          <h3 className="insignia-titulo">{enrollment.course_name}</h3>

          {aprobada ? (
            <div className="insignia-estado">
              <p className="p_card">Aprobado</p>

              {enrollment.url_certificate ? (
                <a
                  href={enrollment.url_certificate}
                  target="_blank"
                  rel="noreferrer"
                  className="a_card a_card--primary"
                >
                  Ver certificado
                </a>
              ) : (
                <p className="p_card_no_p">Certificado en proceso</p>
              )}

              {verifyUrl && (
                <a
                  href={verifyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="a_card"
                >
                  Credencial pública
                </a>
              )}
            </div>
          ) : (
            <div className="insignia-estado">
              <p className="p_card_no">En curso</p>
              {progreso && progreso.total > 0 && (
                <div className="insignia-progreso">
                  <BarraDeProgreso
                    completadas={progreso.completadas}
                    total={progreso.total}
                    compacta
                    oscura
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {logros && (
        <InsigniasDelCurso
          logros={logros}
          courseId={enrollment.course_id}
          modulos={progreso?.modulos || 0}
        />
      )}
    </div>
  );
};

export default CardInsignia;
