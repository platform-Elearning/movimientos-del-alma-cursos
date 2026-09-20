import { useState, useEffect } from "react";
import { getOpcionesContacto, inscribirContacto } from "../../api/contactos";
import CountrySelect from "../countrySelect/CountrySelect";
import { mensajeDeError } from "../../utils/errores";
import "./FormularioInscripcion.css";

/**
 * Convertir un contacto en alumna.
 *
 * Todo viene precargado de la consulta: el sentido de esta pantalla es no
 * volver a tipear lo que Cami ya cargó cuando la persona escribió por primera
 * vez. Lo único que suele faltar es el DNI, y por eso es el campo que se pide.
 *
 * Es una acción aparte y no un estado del desplegable a propósito: crear la
 * alumna le da acceso a la plataforma, y eso no puede pasar por mover una
 * lista sin querer.
 */

/**
 * Parte "María Fernanda Gómez" en nombre y apellido.
 *
 * Es una heurística -- la primera palabra es el nombre -- y se equivoca con los
 * nombres compuestos. Por eso los dos campos quedan editables: adivinar bien el
 * 80% y dejar corregir el resto es mejor que hacer tipear todo de nuevo.
 */
const partirNombre = (completo = "") => {
  const partes = String(completo).trim().split(/\s+/).filter(Boolean);
  if (partes.length <= 1) return { name: partes[0] || "", lastname: "" };
  return { name: partes[0], lastname: partes.slice(1).join(" ") };
};

const FormularioInscripcion = ({ contacto, onInscripta, onCancelar }) => {
  const [datos, setDatos] = useState({
    name: "",
    lastname: "",
    identification_number: "",
    email: "",
    nationality: "",
    telefono: "",
    course_id: "",
    modules_covered: 0,
  });
  const [cursos, setCursos] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [resultado, setResultado] = useState(null);

  useEffect(() => {
    getOpcionesContacto()
      .then((o) => setCursos(o.cursos || []))
      .catch(() => setCursos([]));
  }, []);

  useEffect(() => {
    if (!contacto) return;
    const { name, lastname } = partirNombre(contacto.name);
    setDatos({
      name,
      lastname,
      identification_number: contacto.identification_number || "",
      email: contacto.email || "",
      // El país del contacto y la nacionalidad de la alumna usan el mismo
      // selector, así que el dato viaja tal cual, sin traducir.
      nationality: contacto.country || "",
      telefono: contacto.phone || "",
      course_id: contacto.interest_course_id || "",
      modules_covered: 0,
    });
    setResultado(null);
    setError("");
  }, [contacto]);

  const cambiar = (e) => {
    const { name, value } = e.target;
    setDatos((prev) => {
      const siguiente = { ...prev, [name]: value };
      // Los módulos cuelgan de la inscripción a una formación: si no hay
      // formación no hay dónde guardarlos, y dejar el número cargado haría
      // creer que quedó anotado.
      if (name === "course_id" && !value) siguiente.modules_covered = 0;
      return siguiente;
    });
    setError("");
  };

  const enviar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError("");
    try {
      const data = await inscribirContacto(contacto.id, {
        ...datos,
        modules_covered: Number(datos.modules_covered) || 0,
        course_id: datos.course_id || undefined,
      });
      setResultado(data);
      // Quien monta este formulario NO puede recargar su lista en este momento:
      // el contacto recien inscripto sale de la bandeja de seguimiento, la fila
      // desaparece y se lleva puesto este panel -- junto con la contraseña, que
      // se muestra una sola vez. La lista se refresca al cerrar.
      onInscripta?.(data);
    } catch (err) {
      setError(mensajeDeError(err, "inscribir"));
    } finally {
      setGuardando(false);
    }
  };

  // Ya inscripta: lo que importa es la contraseña, porque es lo único que no se
  // puede volver a ver después.
  if (resultado) {
    return (
      <div className="form-inscripcion form-inscripcion-hecho">
        <h4>
          {resultado.cuentaCreada
            ? "Listo: ya es alumna"
            : "Listo: quedó vinculada con su cuenta"}
        </h4>
        {!resultado.cuentaCreada && (
          <p>
            Ya tenía cuenta en la plataforma, así que no se creó otra. Entra con
            la contraseña que ya usaba.
          </p>
        )}
        {resultado.passwordGenerada && (
          <div className="form-inscripcion-clave">
            <span className="rotulo">Contraseña para pasarle</span>
            <code>{resultado.passwordGenerada}</code>
            <p>
              Anotala ahora: no se vuelve a mostrar. Si se pierde, ella puede
              usar «olvidé mi contraseña».
            </p>
          </div>
        )}
        <div className="form-inscripcion-acciones">
          <button type="button" className="btn-principal" onClick={onCancelar}>
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className="form-inscripcion" onSubmit={enviar}>
      <h4>Inscribir a {contacto?.name}</h4>
      <p className="form-inscripcion-ayuda">
        Los datos vienen de la consulta. Revisalos y completá lo que falte.
      </p>

      <div className="form-inscripcion-grid">
        <div className="campo">
          <label htmlFor="fi-name">Nombre *</label>
          <input id="fi-name" name="name" value={datos.name} onChange={cambiar} required />
        </div>

        <div className="campo">
          <label htmlFor="fi-lastname">Apellido *</label>
          <input
            id="fi-lastname"
            name="lastname"
            value={datos.lastname}
            onChange={cambiar}
            required
          />
        </div>

        <div className="campo">
          <label htmlFor="fi-dni">DNI o documento *</label>
          <input
            id="fi-dni"
            name="identification_number"
            value={datos.identification_number}
            onChange={cambiar}
            required
          />
        </div>

        <div className="campo">
          <label htmlFor="fi-email">Email *</label>
          <input
            id="fi-email"
            name="email"
            type="email"
            value={datos.email}
            onChange={cambiar}
            required
          />
        </div>

        <div className="campo">
          <label htmlFor="fi-nationality">Nacionalidad *</label>
          <CountrySelect
            id="fi-nationality"
            name="nationality"
            value={datos.nationality}
            onChange={cambiar}
            required
          />
        </div>

        <div className="campo">
          <label htmlFor="fi-telefono">Teléfono</label>
          <input
            id="fi-telefono"
            name="telefono"
            value={datos.telefono}
            onChange={cambiar}
          />
        </div>

        <div className="campo">
          <label htmlFor="fi-curso">Formación</label>
          <select id="fi-curso" name="course_id" value={datos.course_id} onChange={cambiar}>
            <option value="">Decidir después</option>
            {cursos.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {datos.course_id && (
          <div className="campo">
            <label htmlFor="fi-modulos">Módulos habilitados</label>
            <input
              id="fi-modulos"
              name="modules_covered"
              type="number"
              min="0"
              max="12"
              value={datos.modules_covered}
              onChange={cambiar}
            />
          </div>
        )}
      </div>

      <p className="form-inscripcion-ayuda">
        La contraseña la genera el sistema y se muestra una sola vez, para que se
        la pases por donde ya venís hablando con ella.
      </p>

      {error && <p className="form-inscripcion-error">{error}</p>}

      <div className="form-inscripcion-acciones">
        <button type="button" className="btn-secundario" onClick={onCancelar}>
          Cancelar
        </button>
        <button type="submit" className="btn-principal" disabled={guardando}>
          {guardando ? "Inscribiendo…" : "Inscribir como alumna"}
        </button>
      </div>
    </form>
  );
};

export default FormularioInscripcion;
