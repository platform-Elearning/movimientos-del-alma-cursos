import { useState, useEffect, useCallback } from "react";
import { getSeguimiento, registrarEvento } from "../../api/contactos";
import FormularioContacto from "../../components/formularioContacto/FormularioContacto";
import FormularioInscripcion from "../../components/formularioInscripcion/FormularioInscripcion";
import { legible } from "../../utils/etiquetas";
import { mensajeDeError } from "../../utils/errores";
import "./BandejaSeguimiento.css";

/**
 * Bandeja de seguimiento: a quién hay que escribirle hoy.
 *
 * No es un listado con filtros, es una cola de trabajo. Responde una sola
 * pregunta y está ordenada por antigüedad, con los que nunca fueron atendidos
 * arriba de todo. El contador es lo primero que se ve, a propósito: si hay 471
 * esperando, eso tiene que doler.
 */


/** La urgencia sale del tiempo esperando, no de un campo cargado a mano. */
const urgencia = (dias) => {
  if (dias === null || dias === undefined) return "sin-dato";
  if (dias >= 14) return "critico";
  if (dias >= 7) return "atencion";
  return "reciente";
};

const BandejaSeguimiento = () => {
  const [cola, setCola] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [abierto, setAbierto] = useState(null);
  const [nota, setNota] = useState("");
  const [nuevoEstado, setNuevoEstado] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [mostrarAlta, setMostrarAlta] = useState(false);
  const [inscribiendo, setInscribiendo] = useState(null);

  const cargar = useCallback(async () => {
    try {
      setCargando(true);
      setError("");
      setCola(await getSeguimiento());
    } catch (err) {
      setError(mensajeDeError(err, "cargar la bandeja"));
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const abrir = (contacto) => {
    setAbierto(abierto?.id === contacto.id ? null : contacto);
    setNota("");
    setNuevoEstado("");
  };

  const registrar = async (contacto) => {
    if (!nota.trim() && !nuevoEstado) {
      setError("Escribí qué pasó o cambiá el estado antes de registrar.");
      return;
    }
    setGuardando(true);
    setError("");
    try {
      await registrarEvento(contacto.id, {
        note: nota.trim() || undefined,
        status: nuevoEstado || undefined,
      });
      // Se recarga en vez de sacar la fila a mano: si el contacto sigue
      // abierto tiene que volver a aparecer, pero al final de la cola.
      setAbierto(null);
      setNota("");
      setNuevoEstado("");
      await cargar();
    } catch (err) {
      setError(
        err?.response?.data?.error || "No se pudo registrar. Intentá de nuevo."
      );
    } finally {
      setGuardando(false);
    }
  };

  const sinAtender = cola.filter((c) => !c.last_contact_at).length;

  return (
    <div className="bandeja">

      <header className="bandeja-header">
        <div>
          <p className="bandeja-sub">
            Ordenados por quién espera hace más tiempo. Los que nunca fueron
            atendidos van primero.
          </p>
        </div>
        <button
          type="button"
          className="bandeja-btn-alta"
          onClick={() => setMostrarAlta((v) => !v)}
        >
          {mostrarAlta ? "Cerrar" : "Agregar contacto"}
        </button>
      </header>

      {mostrarAlta && (
        <div className="bandeja-alta">
          <FormularioContacto
            onGuardado={(_guardado, duplicados) => {
              // Si el contacto puede estar repetido el formulario queda abierto:
              // cerrarlo haria desaparecer el aviso antes de que nadie lo lea.
              if (!duplicados) setMostrarAlta(false);
              cargar();
            }}
            onCancelar={() => setMostrarAlta(false)}
          />
        </div>
      )}

      <div className="bandeja-resumen">
        <div className="bandeja-metrica">
          <span className="valor">{cola.length}</span>
          <span className="rotulo">esperando respuesta</span>
        </div>
        <div className="bandeja-metrica">
          <span className="valor">{sinAtender}</span>
          <span className="rotulo">nunca atendidos</span>
        </div>
      </div>

      {error && <p className="bandeja-error">{error}</p>}
      {cargando && <p className="bandeja-cargando">Cargando la bandeja…</p>}

      {!cargando && cola.length === 0 && (
        <p className="bandeja-vacia">
          No hay nadie esperando respuesta. Es buena señal.
        </p>
      )}

      <ul className="bandeja-lista">
        {cola.map((c) => (
          <li key={c.id} className={`bandeja-item ${urgencia(c.dias_esperando)}`}>
            <button
              type="button"
              className="bandeja-fila"
              onClick={() => abrir(c)}
              aria-expanded={abierto?.id === c.id}
            >
              <span className="bandeja-dias">
                {c.dias_esperando ?? 0}
                <small>días</small>
              </span>
              <span className="bandeja-datos">
                <strong>{c.name}</strong>
                <span className="bandeja-meta">
                  {legible(c.status)} · {legible(c.origin)}
                  {c.interest ? ` · ${c.interest}` : ""}
                </span>
                {(c.phone || c.email) && (
                  <span className="bandeja-contacto">
                    {[c.phone, c.email].filter(Boolean).join(" · ")}
                  </span>
                )}
              </span>
              <span className="bandeja-flecha" aria-hidden="true">
                {abierto?.id === c.id ? "▴" : "▾"}
              </span>
            </button>

            {abierto?.id === c.id && (
              <div className="bandeja-acciones">
                {c.notes && <p className="bandeja-notas">{c.notes}</p>}
                <label htmlFor={`nota-${c.id}`}>Qué pasó</label>
                <textarea
                  id={`nota-${c.id}`}
                  rows={2}
                  value={nota}
                  onChange={(e) => setNota(e.target.value)}
                  placeholder="Le escribí por WhatsApp, quedó en confirmar el lunes"
                />
                <div className="bandeja-acciones-pie">
                  <select
                    value={nuevoEstado}
                    onChange={(e) => setNuevoEstado(e.target.value)}
                    aria-label="Cambiar estado"
                  >
                    <option value="">Dejar el estado como está</option>
                    <option value="esperando_respuesta">Esperando respuesta</option>
                    <option value="en_conversacion">En conversación</option>
                    <option value="perdida">Perdida</option>
                  </select>
                  <button
                    type="button"
                    className="bandeja-btn-registrar"
                    onClick={() => registrar(c)}
                    disabled={guardando}
                  >
                    {guardando ? "Registrando…" : "Registrar"}
                  </button>
                </div>

                {/* Inscribir vive separado de registrar una interacción: una
                    anota lo que pasó, la otra le crea la cuenta y le da acceso
                    a la plataforma. */}
                {c.student_id ? (
                  <p className="bandeja-ya-alumna">Ya es alumna de la academia.</p>
                ) : inscribiendo?.id === c.id ? (
                  <FormularioInscripcion
                    contacto={c}
                    onCancelar={() => {
                      setInscribiendo(null);
                      cargar();
                    }}
                  />
                ) : (
                  <button
                    type="button"
                    className="bandeja-btn-inscribir"
                    onClick={() => setInscribiendo(c)}
                  >
                    Inscribir como alumna
                  </button>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BandejaSeguimiento;
