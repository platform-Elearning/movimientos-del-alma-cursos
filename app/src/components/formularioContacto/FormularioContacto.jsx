import { useState, useEffect } from "react";
import {
  getOpcionesContacto,
  crearContacto,
  actualizarContacto,
} from "../../api/contactos";
import CountrySelect from "../countrySelect/CountrySelect";
import { legible } from "../../utils/etiquetas";
import "./FormularioContacto.css";

/**
 * Formulario único de contacto.
 *
 * Es el mismo componente para el alta y la edición, y lo montan tanto el panel
 * de admin como el de ventas: una sola entrada de datos escribiendo en una sola
 * tabla. Tener dos formularios para lo mismo es como se llega a dos versiones
 * de la verdad.
 *
 * Las listas de estados, orígenes y motivos las trae del backend en lugar de
 * repetirlas acá: cuando se agrega un estado, aparece solo.
 */

const VACIO = {
  name: "",
  phone: "",
  email: "",
  country: "",
  identification_number: "",
  origin: "",
  interest_course_id: "",
  interest: "",
  status: "nueva",
  lost_reason: "",
  notes: "",
  first_contact_at: "",
  last_contact_at: "",
};



const FormularioContacto = ({ contacto, onGuardado, onCancelar }) => {
  const [datos, setDatos] = useState(VACIO);
  const [opciones, setOpciones] = useState({
    estados: [],
    origenes: [],
    motivosDePerdida: [],
    cursos: [],
  });
  const [duplicados, setDuplicados] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getOpcionesContacto()
      // Se mezcla con el estado inicial en vez de reemplazarlo: un backend que
      // todavia no conoce alguna de estas listas -- el de la version anterior,
      // durante un deploy -- dejaria el campo en undefined y el .map de mas
      // abajo tumbaria el formulario entero.
      .then((datos) => setOpciones((previas) => ({ ...previas, ...datos })))
      .catch(() => setError("No se pudieron cargar las opciones del formulario."));
  }, []);

  useEffect(() => {
    if (!contacto) {
      setDatos(VACIO);
      return;
    }
    const soloFecha = (f) => (f ? String(f).slice(0, 10) : "");
    setDatos({
      ...VACIO,
      ...contacto,
      phone: contacto.phone || "",
      email: contacto.email || "",
      country: contacto.country || "",
      origin: contacto.origin || "",
      interest: contacto.interest || "",
      identification_number: contacto.identification_number || "",
      interest_course_id: contacto.interest_course_id || "",
      lost_reason: contacto.lost_reason || "",
      notes: contacto.notes || "",
      first_contact_at: soloFecha(contacto.first_contact_at),
      last_contact_at: soloFecha(contacto.last_contact_at),
    });
  }, [contacto]);

  const cambiar = (e) => {
    const { name, value } = e.target;
    setDatos((prev) => {
      const siguiente = { ...prev, [name]: value };
      // El motivo solo tiene sentido si está perdida; el backend lo rechaza y
      // acá se limpia para no mandar algo que ya sabemos que va a fallar.
      if (name === "status" && value !== "perdida") siguiente.lost_reason = "";
      return siguiente;
    });
    setError("");
  };

  const enviar = async (e) => {
    e.preventDefault();
    if (!datos.name.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }
    setGuardando(true);
    setError("");
    setDuplicados(null);
    try {
      const { contacto: guardado, duplicados: aviso } = contacto?.id
        ? await actualizarContacto(contacto.id, datos)
        : await crearContacto(datos);
      setDuplicados(aviso || null);
      // El aviso viaja con el contacto guardado: quien monta el formulario
      // necesita saberlo para no cerrarlo y dejar el aviso sin ver.
      onGuardado?.(guardado, aviso || null);
      if (!contacto?.id) setDatos(VACIO);
    } catch (err) {
      setError(
        err?.response?.data?.error ||
          "No se pudo guardar el contacto. Revisá los datos e intentá de nuevo."
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <form className="form-contacto" onSubmit={enviar}>
      <div className="form-contacto-grid">
        <div className="campo campo-ancho">
          <label htmlFor="fc-name">Nombre y apellido *</label>
          <input id="fc-name" name="name" value={datos.name} onChange={cambiar} required />
        </div>

        <div className="campo">
          <label htmlFor="fc-phone">Teléfono</label>
          <input id="fc-phone" name="phone" value={datos.phone} onChange={cambiar} />
        </div>

        <div className="campo">
          <label htmlFor="fc-email">Email</label>
          <input id="fc-email" name="email" type="email" value={datos.email} onChange={cambiar} />
        </div>

        <div className="campo">
          <label htmlFor="fc-country">País</label>
          <CountrySelect id="fc-country" name="country" value={datos.country} onChange={cambiar} />
        </div>

        <div className="campo">
          <label htmlFor="fc-dni">DNI o documento</label>
          <input
            id="fc-dni"
            name="identification_number"
            value={datos.identification_number}
            onChange={cambiar}
            placeholder="Se puede completar después"
          />
        </div>

        <div className="campo">
          <label htmlFor="fc-origin">Cómo llegó</label>
          <select id="fc-origin" name="origin" value={datos.origin} onChange={cambiar}>
            <option value="">Sin dato</option>
            {(opciones.origenes || []).map((o) => (
              <option key={o} value={o}>{legible(o)}</option>
            ))}
          </select>
        </div>

        <div className="campo">
          <label htmlFor="fc-formacion">Qué formación</label>
          <select
            id="fc-formacion"
            name="interest_course_id"
            value={datos.interest_course_id}
            onChange={cambiar}
          >
            <option value="">Sin definir</option>
            {(opciones.cursos || []).map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="campo campo-ancho">
          <label htmlFor="fc-interest">Detalle del interés</label>
          <input
            id="fc-interest"
            name="interest"
            value={datos.interest}
            onChange={cambiar}
            placeholder="Preguntó si hay clases grabadas y si puede empezar en marzo"
          />
        </div>

        <div className="campo">
          <label htmlFor="fc-status">Estado</label>
          <select id="fc-status" name="status" value={datos.status} onChange={cambiar}>
            {(opciones.estados || []).map((s) => (
              <option key={s} value={s}>{legible(s)}</option>
            ))}
          </select>
        </div>

        {datos.status === "perdida" && (
          <div className="campo">
            <label htmlFor="fc-motivo">Motivo</label>
            <select id="fc-motivo" name="lost_reason" value={datos.lost_reason} onChange={cambiar}>
              <option value="">Sin especificar</option>
              {(opciones.motivosDePerdida || []).map((m) => (
                <option key={m} value={m}>{legible(m)}</option>
              ))}
            </select>
          </div>
        )}

        <div className="campo">
          <label htmlFor="fc-primer">Primer contacto</label>
          <input
            id="fc-primer"
            name="first_contact_at"
            type="date"
            value={datos.first_contact_at}
            onChange={cambiar}
          />
        </div>

        <div className="campo">
          <label htmlFor="fc-ultimo">Último contacto</label>
          <input
            id="fc-ultimo"
            name="last_contact_at"
            type="date"
            value={datos.last_contact_at}
            onChange={cambiar}
          />
        </div>

        <div className="campo campo-ancho">
          <label htmlFor="fc-notes">Notas</label>
          <textarea
            id="fc-notes"
            name="notes"
            rows={3}
            value={datos.notes}
            onChange={cambiar}
            placeholder="Le mandé el pdf, dijo que lo consulta y avisa"
          />
        </div>
      </div>

      {error && <p className="form-contacto-error">{error}</p>}

      {duplicados && (
        <div className="form-contacto-aviso">
          <strong>Ojo: puede que esta persona ya esté cargada.</strong>
          <ul>
            {duplicados.contactos?.map((c) => (
              <li key={`c-${c.id}`}>
                Ya hay un contacto: <b>{c.name}</b>
                {c.identification_number ? ` · ${c.identification_number}` : ""}
                {c.email ? ` · ${c.email}` : ""} · {legible(c.status)}
              </li>
            ))}
            {duplicados.alumnas?.map((a) => (
              <li key={`a-${a.id}`}>
                Ya es alumna: <b>{a.name} {a.lastname}</b>
                {a.identification_number ? ` · ${a.identification_number}` : ""}
                {a.activo === false ? " · inactiva" : ""}
              </li>
            ))}
          </ul>
          <p>
            Se guardó igual. Si es la misma persona, conviene seguir con la ficha
            que ya existe en lugar de esta.
          </p>
        </div>
      )}

      <div className="form-contacto-acciones">
        {onCancelar && (
          <button type="button" className="btn-secundario" onClick={onCancelar}>
            Cancelar
          </button>
        )}
        <button type="submit" className="btn-principal" disabled={guardando}>
          {guardando ? "Guardando…" : contacto?.id ? "Guardar cambios" : "Agregar contacto"}
        </button>
      </div>
    </form>
  );
};

export default FormularioContacto;
