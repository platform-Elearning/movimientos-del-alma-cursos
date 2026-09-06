import "./CardInsignia.css"
import logo from "../../assets/logo2.png";

// El link al certificado y el link de verificacion son dos cosas distintas:
// el primero es el documento, el segundo es la pagina publica que prueba que ese
// documento es valido -- la que se pega en un CV o en LinkedIn. Solo el dueño de
// la credencial ve su codigo, porque llega por la ruta autenticada del alumno.
const VERIFY_BASE = import.meta.env.VITE_VERIFY_BASE_URL || "";

const CardInsignia = ({ enrollment }) => {
  const verifyUrl = enrollment.verification_code
    ? `${VERIFY_BASE}/verificar/${enrollment.verification_code}`
    : null;

  return (
    <div className="insignia-card">
      <div>
        <img src={logo} alt="Logo" className="insignia-icon" />
      </div>
      <div className="insignia-content">
        <h3 className="p_card">{enrollment.course_name}</h3>

        {enrollment.approved === true ? (
          <div>
            <p className="p_card">Aprobado</p>

            {enrollment.url_certificate !== null ? (
              <a
                href={enrollment.url_certificate}
                target="_blank"
                rel="noreferrer"
                className="a_card"
              >
                Link al certificado
              </a>
            ) : (
              <p className="p_card_no_p">certificado en proceso</p>
            )}

            {verifyUrl && (
              <a href={verifyUrl} target="_blank" rel="noreferrer" className="a_card">
                Credencial pública
              </a>
            )}
          </div>
        ) : (
          <div>
            <p className="p_card_no">En curso</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CardInsignia;
