import BarraDeProgreso from "../progreso/BarraDeProgreso";
import "./CourseCard.css";

const Icon = ({ size = 14, children }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

// enrolled: la alumna tiene el curso activo.
// progreso: { completadas, total } opcional (solo cursos activos).
// onOpen: abre el material. onContact: abre el contacto de ventas (WhatsApp).
const CourseCard = ({
  nombre,
  description,
  enrolled = false,
  progreso,
  onOpen,
  onContact,
}) => (
  <article className={`course-card ${enrolled ? "is-active" : "is-available"}`}>
    <div className="course-card-band">
      <Icon size={26}>
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </Icon>
      <span className="course-card-chip">
        {enrolled && (
          <Icon size={11}>
            <polyline points="20 6 9 17 4 12" />
          </Icon>
        )}
        {enrolled ? "Activo" : "Disponible"}
      </span>
    </div>

    <div className="course-card-body">
      <h3 className="course-card-title">{nombre}</h3>
      <p className="course-card-description">{description}</p>

      {enrolled && progreso && progreso.total > 0 && (
        <div className="course-card-progress">
          <BarraDeProgreso
            completadas={progreso.completadas}
            total={progreso.total}
            compacta
          />
        </div>
      )}

      <div className="course-card-actions">
        {enrolled ? (
          <button
            type="button"
            className="course-card-btn secondary"
            onClick={onOpen}
          >
            Ir al material
            <Icon>
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </Icon>
          </button>
        ) : (
          <button
            type="button"
            className="course-card-btn primary"
            onClick={onContact}
          >
            <Icon size={16}>
              <path d="M3 21l1.65 -3.8a9 9 0 1 1 3.4 2.9l-5.05 .9" />
              <path d="M9 10a.5 .5 0 0 0 1 0v-1a.5 .5 0 0 0 -1 0v1a5 5 0 0 0 5 5h1a.5 .5 0 0 0 0 -1h-1a.5 .5 0 0 0 0 1" />
            </Icon>
            Consultar por WhatsApp
          </button>
        )}
      </div>
    </div>
  </article>
);

export default CourseCard;
