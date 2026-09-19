import { useState, useEffect } from "react";
import {
  getOpcionesContacto,
  crearContacto,
  actualizarContacto,
} from "../../api/contactos";
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
  origin: "",
  interest: "",
  status: "nueva",
  lost_reason: "",
  notes: "",
  first_contact_at: "",
  last_contact_at: "",
};

const ETIQUETAS = {
  nueva: "Nueva",
  esperando_respuesta: "Esperando respuesta",
  en_conversacion: "En conversación",
  inscripta: "Inscripta",
  perdida: "Perdida",
  ig: "Instagram",
  fb: "Facebook",
  referida: "Referida",
  organica: "Orgánica",
  autoregistro: "Se registró sola",
  otro: "Otro",
  falta_de_tiempo: "Falta de tiempo",
  precio: "Precio",
  otra_academia: "Se fue a otra academia",
  no_era_lo_que_buscaba: "No era lo que buscaba",
  nunca_respondio: "Nunca respondió",
};

const legible = (v) => ETIQUETAS[v] || v;

const FormularioContacto = ({ contacto, onGuardado, onCancelar }) => {
  const [datos, setDatos] = useState(VACIO);
  const [opciones, setOpciones] = useState({ estados: [], origenes: [], motivosDePerdida: [] });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getOpcionesContacto()
      .then(setOpciones)
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
    try {
      const guardado = contacto?.id
        ? await actualizarContacto(contacto.id, datos)
        : await crearContacto(datos);
      onGuardado?.(guardado);
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
          <input id="fc-country" name="country" value={datos.country} onChange={cambiar} />
        </div>

        <div className="campo">
          <label htmlFor="fc-origin">Cómo llegó</label>
          <select id="fc-origin" name="origin" value={datos.origin} onChange={cambiar}>
            <option value="">Sin dato</option>
            {opciones.origenes.map((o) => (
              <option key={o} value={o}>{legible(o)}</option>
            ))}
          </select>
        </div>

        <div className="campo campo-ancho">
          <label htmlFor="fc-interest">Qué le interesa</label>
          <input
            id="fc-interest"
            name="interest"
            value={datos.interest}
            onChange={cambiar}
            placeholder="Profesorado de Jazz"
          />
        </div>

        <div className="campo">
          <label htmlFor="fc-status">Estado</label>
          <select id="fc-status" name="status" value={datos.status} onChange={cambiar}>
            {opciones.estados.map((s) => (
              <option key={s} value={s}>{legible(s)}</option>
            ))}
          </select>
        </div>

        {datos.status === "perdida" && (
          <div className="campo">
            <label htmlFor="fc-motivo">Motivo</label>
            <select id="fc-motivo" name="lost_reason" value={datos.lost_reason} onChange={cambiar}>
              <option value="">Sin especificar</option>
              {opciones.motivosDePerdida.map((m) => (
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
