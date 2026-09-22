import { useState, useEffect, useCallback } from "react";
import {
  getContactos,
  getOpcionesContacto,
  eliminarContacto,
} from "../../api/contactos";
import FormularioContacto from "../../components/formularioContacto/FormularioContacto";
import { legible } from "../../utils/etiquetas";
import { mensajeDeError } from "../../utils/errores";
import "./Contactos.css";

/**
 * Todos los contactos: buscar, editar y borrar.
 *
 * La bandeja es una cola de trabajo y sólo muestra los que están abiertos. Acá
 * se llega a cualquiera -- también a los inscriptos y a los perdidos -- que es
 * lo que hacía falta para poder corregir algo cargado mal.
 *
 * Incluye las fechas, que son las que mandan en la bandeja: los días que
 * alguien "lleva esperando" salen de last_contact_at, así que una fecha mal
 * cargada pone a esa persona en el lugar equivocado de la cola. Editarla acá es
 * la forma de acomodarla.
 */

const soloFecha = (f) => (f ? String(f).slice(0, 10) : "");

/** Los mismos días que muestra la bandeja, para que las dos vistas coincidan. */
const diasEsperando = (c) => {
  const desde = c.last_contact_at || c.first_contact_at;
  if (!desde) return null;
  const dias = Math.floor((Date.now() - new Date(desde).getTime()) / 86400000);
  return dias;
};

const Contactos = () => {
  const [contactos, setContactos] = useState([]);
  const [total, setTotal] = useState(0);
  const [opciones, setOpciones] = useState({ estados: [], origenes: [] });
  const [filtros, setFiltros] = useState({ busqueda: "", estado: "", origen: "" });
  const [editando, setEditando] = useState(null);
  const [borrando, setBorrando] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    getOpcionesContacto()
      .then((o) => setOpciones((previas) => ({ ...previas, ...o })))
      .catch(() => {});
  }, []);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const { contactos: filas, total: t } = await getContactos({
        busqueda: filtros.busqueda || undefined,
        estado: filtros.estado || undefined,
        origen: filtros.origen || undefined,
        limite: 100,
      });
      setContactos(filas || []);
      setTotal(t || 0);
      setError("");
    } catch (err) {
      setError(mensajeDeError(err, "cargar los contactos"));
    } finally {
      setCargando(false);
    }
  }, [filtros]);

  // Espera a que se deje de tipear, y descarta la respuesta que quedó vieja.
  useEffect(() => {
    let vigente = true;
    const t = setTimeout(() => {
      if (vigente) cargar();
    }, 300);
    return () => {
      vigente = false;
      clearTimeout(t);
    };
  }, [cargar]);

  const cambiarFiltro = (e) => {
    const { name, value } = e.target;
    setFiltros((prev) => ({ ...prev, [name]: value }));
  };

  const borrar = async (contacto) => {
    setError("");
    setAviso("");
    try {
      await eliminarContacto(contacto.id);
      setBorrando(null);
      setAviso(`Se borró el contacto de ${contacto.name}.`);
      await cargar();
    } catch (err) {
      // El backend rechaza los que ya son alumnas con un motivo entendible.
      setError(mensajeDeError(err, "borrar el contacto"));
      setBorrando(null);
    }
  };

  return (
    <div className="contactos">
      <div className="contactos-filtros">
        <div className="campo campo-ancho">
          <label htmlFor="ct-busqueda">Buscar</label>
          <input
            id="ct-busqueda"
            name="busqueda"
            value={filtros.busqueda}
            onChange={cambiarFiltro}
            placeholder="Nombre, email o teléfono"
          />
        </div>
        <div className="campo">
          <label htmlFor="ct-estado">Estado</label>
          <select id="ct-estado" name="estado" value={filtros.estado} onChange={cambiarFiltro}>
            <option value="">Todos</option>
            {(opciones.estados || []).map((e) => (
              <option key={e} value={e}>
                {legible(e)}
              </option>
            ))}
          </select>
        </div>
        <div className="campo">
          <label htmlFor="ct-origen">Cómo llegó</label>
          <select id="ct-origen" name="origen" value={filtros.origen} onChange={cambiarFiltro}>
            <option value="">Todos</option>
            {(opciones.origenes || []).map((o) => (
              <option key={o} value={o}>
                {legible(o)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="contactos-error">{error}</p>}
      {aviso && <p className="contactos-aviso">{aviso}</p>}

      {cargando && <p className="contactos-vacio">Cargando…</p>}

      {!cargando && contactos.length === 0 && (
        <p className="contactos-vacio">
          No hay contactos que coincidan con la búsqueda.
        </p>
      )}

      {!cargando && contactos.length > 0 && (
        <>
          <p className="contactos-cuenta">
            {contactos.length === total
              ? `${total} contacto${total === 1 ? "" : "s"}`
              : `Mostrando ${contactos.length} de ${total}`}
          </p>

          <div className="contactos-tabla-scroll">
            <table className="contactos-tabla">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Contacto</th>
                  <th>Estado</th>
                  <th>Cómo llegó</th>
                  <th>Primer contacto</th>
                  <th>Último contacto</th>
                  <th>Días</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {contactos.map((c) => {
                  const dias = diasEsperando(c);
                  return (
                    <tr key={c.id} className={c.student_id ? "es-alumna" : ""}>
                      <td>
                        <strong>{c.name}</strong>
                        {c.student_id && <span className="contactos-tag">alumna</span>}
                      </td>
                      <td className="contactos-chico">
                        {[c.phone, c.email].filter(Boolean).join(" · ") || "—"}
                      </td>
                      <td>{legible(c.status)}</td>
                      <td>{legible(c.origin)}</td>
                      <td>{soloFecha(c.first_contact_at) || "—"}</td>
                      <td>{soloFecha(c.last_contact_at) || "sin contactar"}</td>
                      <td className="num">{dias === null ? "—" : dias}</td>
                      <td className="contactos-acciones">
                        <button type="button" onClick={() => setEditando(c)}>
                          Editar
                        </button>
                        {/* Los que ya son alumnas no se borran: el backend lo
                            rechaza y el botón no se ofrece. */}
                        {!c.student_id && (
                          <button
                            type="button"
                            className="borrar"
                            onClick={() => setBorrando(c)}
                          >
                            Borrar
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Confirmación antes de borrar: es la única acción de esta pantalla que
          no se puede deshacer, y se lleva el historial de la consulta. */}
      {borrando && (
        <div className="contactos-confirmar">
          <p>
            ¿Borrar el contacto de <strong>{borrando.name}</strong>? Se va con
            todo su historial de seguimiento y no se puede recuperar.
          </p>
          <div className="contactos-confirmar-acciones">
            <button type="button" onClick={() => setBorrando(null)}>
              No, dejarlo
            </button>
            <button type="button" className="borrar" onClick={() => borrar(borrando)}>
              Sí, borrar
            </button>
          </div>
        </div>
      )}

      {editando && (
        <div className="contactos-edicion">
          <h3>Editar {editando.name}</h3>
          <FormularioContacto
            contacto={editando}
            onGuardado={(_guardado, duplicados) => {
              // Igual que en el alta: si hay aviso de duplicado el formulario
              // queda abierto para que se pueda leer.
              if (!duplicados) setEditando(null);
              cargar();
            }}
            onCancelar={() => setEditando(null)}
          />
        </div>
      )}
    </div>
  );
};

export default Contactos;
