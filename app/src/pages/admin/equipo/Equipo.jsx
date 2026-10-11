import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getEquipo, crearMiembroDeEquipo } from "../../../api/equipo";
import BackLink from "../../../components/backLink/BackLink";
import { mensajeDeError } from "../../../utils/errores";
import "./Equipo.css";

/**
 * Equipo: quienes entran a un panel sin ser alumnas ni docentes.
 *
 * Cada rol ve una sola cosa: Ventas, el CRM y los pagos; Marketing, el panel
 * de marketing y nada más. El admin los da de alta acá.
 *
 * La contraseña la genera el servidor y se muestra UNA sola vez. El cartel que
 * la muestra no se cierra solo: ya pasó que un panel se desmontaba antes de que
 * se pudiera leer la contraseña generada, y no hay forma de volver a verla.
 */

const ALTA_VACIA = { email: "", role: "marketing" };

const Equipo = () => {
  const navigate = useNavigate();
  const [equipo, setEquipo] = useState([]);
  // Mezclado con lo que manda el backend: si no manda los roles, el selector no
  // puede quedarse sin nada que listar.
  const [roles, setRoles] = useState({ seller: "Ventas", marketing: "Marketing" });
  const [alta, setAlta] = useState(ALTA_VACIA);
  const [creada, setCreada] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const cargar = useCallback(async () => {
    try {
      const r = await getEquipo();
      setEquipo(r.equipo || []);
      setRoles((previos) => ({ ...previos, ...(r.roles || {}) }));
    } catch (err) {
      setError(mensajeDeError(err, "cargar el equipo"));
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const crear = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError("");
    try {
      const r = await crearMiembroDeEquipo(alta);
      setCreada(r);
      setAlta(ALTA_VACIA);
      await cargar();
    } catch (err) {
      setError(mensajeDeError(err, "dar de alta al usuario"));
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="equipo">
      <BackLink title="Volver" onClick={() => navigate(-1)} />
      <h2>Equipo</h2>
      <p className="equipo-ayuda">
        Usuarios que trabajan en un solo panel. <strong>Ventas</strong> ve el CRM y los
        pagos; <strong>Marketing</strong> ve sólo el panel de marketing.
      </p>

      {error && <p className="equipo-error">{error}</p>}

      {creada && (
        <div className="equipo-creada" role="status">
          <strong>
            Usuario creado: {creada.miembro.email} ({roles[creada.miembro.role] || creada.miembro.role})
          </strong>
          <p>
            Contraseña: <code>{creada.password}</code>
          </p>
          <p>
            Pasásela por un medio privado. <strong>No se vuelve a mostrar</strong>: si se
            pierde, hay que generar otra.
          </p>
          <button type="button" className="btn-principal" onClick={() => setCreada(null)}>
            Listo, ya la guardé
          </button>
        </div>
      )}

      <form className="equipo-form" onSubmit={crear}>
        <div className="campo">
          <label htmlFor="eq-email">Email</label>
          <input
            id="eq-email"
            type="email"
            value={alta.email}
            onChange={(e) => setAlta((a) => ({ ...a, email: e.target.value }))}
            required
          />
        </div>
        <div className="campo">
          <label htmlFor="eq-rol">Rol</label>
          <select
            id="eq-rol"
            value={alta.role}
            onChange={(e) => setAlta((a) => ({ ...a, role: e.target.value }))}
          >
            {Object.entries(roles).map(([clave, nombre]) => (
              <option key={clave} value={clave}>
                {nombre}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn-principal" disabled={guardando}>
          {guardando ? "Creando…" : "Dar de alta"}
        </button>
      </form>

      <h3>Quiénes están</h3>
      {equipo.length === 0 ? (
        <p className="equipo-ayuda">Todavía no hay nadie dado de alta.</p>
      ) : (
        <table className="equipo-tabla">
          <thead>
            <tr>
              <th>Email</th>
              <th>Rol</th>
            </tr>
          </thead>
          <tbody>
            {equipo.map((u) => (
              <tr key={u.id}>
                <td>{u.email}</td>
                <td>{roles[u.role] || u.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Equipo;
