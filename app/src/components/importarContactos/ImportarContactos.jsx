import { useState, useEffect, useMemo, useRef } from "react";
import { getOpcionesContacto, importarContactos } from "../../api/contactos";
import {
  parsearTabla,
  detectarColumnas,
  hayFechasSinAnio,
  construirFilas,
  CAMPOS,
  MAX_FILAS,
} from "../../utils/importarPlanilla";
import { hoyLocal } from "../../utils/fechas";
import { legible } from "../../utils/etiquetas";
import { mensajeDeError } from "../../utils/errores";
import "./ImportarContactos.css";

/**
 * Importar contactos desde una planilla.
 *
 * La vendedora ya trabaja en una planilla: lo más corto es copiar las celdas y
 * pegarlas acá, o arrastrar el archivo. En los dos casos pasa lo mismo: se lee,
 * se muestra qué se entendió de cada fila y recién ahí se guarda. Nada se
 * escribe hasta apretar "Importar", y la vista previa ya marca los contactos que
 * existen, que se omiten.
 *
 * Es el mismo trabajo que el formulario de alta, en bloque, y escribe en la
 * misma tabla: no hay una segunda versión de la verdad.
 */

const MAX_BYTES = 5 * 1024 * 1024;

const verFecha = (iso) => (iso ? iso.split("-").reverse().join("/") : "—");

const textoDuplicada = (d) => {
  if (!d) return "Ya existe";
  if (d.tipo === "archivo") return `Repetida: es la misma que la fila ${d.fila}`;
  if (d.tipo === "alumna") return `Ya es alumna: ${d.nombre}`;
  return `Ya está cargada: ${d.nombre}`;
};

const ImportarContactos = ({ onTerminado, onCancelar }) => {
  const [texto, setTexto] = useState("");
  const [cuerpo, setCuerpo] = useState([]);
  const [muestra, setMuestra] = useState([]);
  const [mapeo, setMapeo] = useState([]);
  const [anio, setAnio] = useState("");
  const [estadoPorDefecto, setEstadoPorDefecto] = useState("nueva");
  const [opciones, setOpciones] = useState({ estados: [], cursos: [] });
  const [analisis, setAnalisis] = useState(null);
  const [analizando, setAnalizando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [filtro, setFiltro] = useState("todas");
  const [arrastrando, setArrastrando] = useState(false);
  const [error, setError] = useState("");
  const [hecho, setHecho] = useState(null);
  const inputArchivo = useRef(null);

  const hoy = hoyLocal();
  const anioActual = Number(hoy.slice(0, 4));

  useEffect(() => {
    getOpcionesContacto()
      .then((o) => setOpciones((previas) => ({ ...previas, ...o })))
      .catch(() => setError("No se pudieron cargar las formaciones. Probá de nuevo."));
  }, []);

  /** Lee el texto (pegado o de un archivo) y deja las columnas detectadas. */
  const leer = (contenido) => {
    setError("");
    setAnalisis(null);
    setHecho(null);
    setFiltro("todas");
    const tabla = parsearTabla(contenido);
    if (tabla.length === 0) {
      setCuerpo([]);
      setError("No encontré filas. Copiá las celdas de la planilla, con la fila de encabezados.");
      return;
    }
    const { hayEncabezado, mapeo: detectado } = detectarColumnas(tabla[0].celdas);
    const datos = hayEncabezado ? tabla.slice(1) : tabla;
    if (datos.length === 0) {
      setCuerpo([]);
      setError("Solo hay encabezados y ninguna fila de datos.");
      return;
    }
    // El mapeo cubre la fila más ancha, no solo la primera: una celda de más en
    // el medio de la planilla no puede dejar una columna sin selector.
    const ancho = Math.max(...tabla.map((f) => f.celdas.length));
    setMapeo(Array.from({ length: ancho }, (_, i) => detectado[i] ?? null));
    setMuestra(datos[0].celdas);
    setCuerpo(datos);
  };

  const alPegar = (e) => {
    setTexto(e.target.value);
    if (e.target.value.trim()) leer(e.target.value);
    else setCuerpo([]);
  };

  const leerArchivo = async (archivo) => {
    if (!archivo) return;
    if (/\.(xlsx|xls|ods)$/i.test(archivo.name)) {
      setError(
        "Los archivos de Excel todavía no se leen directo. Abrilo, copiá las celdas y pegalas acá, " +
          "o descargalo como CSV (Archivo → Descargar → Valores separados por comas)."
      );
      return;
    }
    if (archivo.size > MAX_BYTES) {
      setError("El archivo es demasiado grande (máximo 5 MB).");
      return;
    }
    try {
      const contenido = await archivo.text();
      setTexto(contenido);
      leer(contenido);
    } catch {
      setError("No se pudo leer el archivo.");
    }
  };

  const alSoltar = (e) => {
    e.preventDefault();
    setArrastrando(false);
    leerArchivo(e.dataTransfer.files?.[0]);
  };

  /** Reasigna una columna. Un campo no puede estar en dos columnas a la vez. */
  const cambiarColumna = (indice, campo) =>
    setMapeo((previo) =>
      previo.map((c, i) => (i === indice ? campo || null : c === campo && campo ? null : c))
    );

  const sinAnio = useMemo(
    () => hayFechasSinAnio(cuerpo, mapeo.indexOf("fecha")),
    [cuerpo, mapeo]
  );

  const construidas = useMemo(
    () =>
      cuerpo.length
        ? construirFilas(cuerpo, mapeo, {
            anio: anio ? Number(anio) : null,
            estadoPorDefecto,
            cursos: opciones.cursos || [],
            hoy,
          })
        : [],
    [cuerpo, mapeo, anio, estadoPorDefecto, opciones.cursos, hoy]
  );

  const faltanColumnas = !mapeo.includes("nombre") || !mapeo.includes("fecha");
  const demasiadas = cuerpo.length > MAX_FILAS;

  // Al backend solo viajan las que no tienen un error que ya se sabe acá: así el
  // mensaje que se ve es el específico ("no se entiende la fecha") y no uno genérico.
  const enviables = useMemo(
    () => construidas.filter((f) => !f.errores.length),
    [construidas]
  );

  // Espera a que se deje de tocar la configuración, y descarta la respuesta vieja.
  useEffect(() => {
    if (!cuerpo.length || faltanColumnas || demasiadas || !enviables.length) {
      setAnalisis(null);
      return undefined;
    }
    let vigente = true;
    const t = setTimeout(async () => {
      setAnalizando(true);
      try {
        const r = await importarContactos(enviables.map((f) => f.datos), false);
        if (vigente) {
          setAnalisis(r);
          setError("");
        }
      } catch (err) {
        if (vigente) {
          setAnalisis(null);
          setError(mensajeDeError(err, "analizar la planilla"));
        }
      } finally {
        if (vigente) setAnalizando(false);
      }
    }, 400);
    return () => {
      vigente = false;
      clearTimeout(t);
    };
  }, [cuerpo.length, faltanColumnas, demasiadas, enviables]);

  const nombreFormacion = (id) => (opciones.cursos || []).find((c) => c.id === Number(id))?.name;

  /** Una fila por cada una de la planilla, con lo que se sabe de ella. */
  const vista = useMemo(() => {
    const porFila = new Map((analisis?.filas || []).map((f) => [f.fila, f]));
    return construidas.map((c) => {
      let estado = "pendiente";
      let mensajes = [];
      let duplicadaDe = null;
      if (c.errores.length) {
        estado = "error";
        mensajes = c.errores;
      } else if (porFila.has(c.fila)) {
        const s = porFila.get(c.fila);
        estado = s.estado;
        mensajes = s.errores;
        duplicadaDe = s.duplicadaDe;
      }
      return { ...c, estado, mensajes, duplicadaDe };
    });
  }, [construidas, analisis]);

  const cuenta = (e) => vista.filter((v) => v.estado === e).length;
  const nuevas = cuenta("ok");
  const duplicadas = cuenta("duplicada");
  const conError = cuenta("error");
  const filtradas = vista.filter((v) =>
    filtro === "todas" ? true : filtro === "nuevas" ? v.estado === "ok" : filtro === "duplicadas" ? v.estado === "duplicada" : v.estado === "error"
  );

  const confirmar = async () => {
    setConfirmando(true);
    setError("");
    try {
      const r = await importarContactos(
        vista.filter((v) => v.estado === "ok").map((v) => v.datos),
        true
      );
      setHecho(r);
    } catch (err) {
      // 422: entre la vista previa y el botón alguna fila dejó de servir. No se
      // importó nada; se muestra el estado nuevo para que se pueda corregir.
      const detalle = err?.response?.data?.data;
      if (err?.response?.status === 422 && detalle) setAnalisis(detalle);
      setError(err?.response?.data?.error || mensajeDeError(err, "importar la planilla"));
    } finally {
      setConfirmando(false);
    }
  };

  if (hecho) {
    return (
      <div className="importar importar-hecho" role="status">
        <h3>Importación terminada</h3>
        <p>
          Se crearon <strong>{hecho.creadas}</strong> contactos
          {hecho.resumen.duplicadas ? ` y se omitieron ${hecho.resumen.duplicadas} que ya existían` : ""}.
        </p>
        <div className="importar-acciones">
          <button type="button" className="importar-principal" onClick={() => onTerminado?.(hecho.creadas)}>
            Listo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="importar">
      <h3>Importar contactos desde una planilla</h3>

      <div
        className={`importar-zona${arrastrando ? " arrastrando" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setArrastrando(true);
        }}
        onDragLeave={() => setArrastrando(false)}
        onDrop={alSoltar}
      >
        <label htmlFor="imp-texto">
          Pegá acá las celdas copiadas de tu planilla (con la fila de títulos), o arrastrá un archivo CSV
        </label>
        <textarea
          id="imp-texto"
          rows={cuerpo.length ? 3 : 7}
          value={texto}
          onChange={alPegar}
          placeholder={"Fecha\tNombre\tPaís\tFormación\tEstado\tVía\tNúmero\n01/09\tAna\tChile\tJazz\tConsultó\tInstagram\t56 9 1234 5678"}
          spellCheck={false}
        />
        <div className="importar-zona-pie">
          <button type="button" className="importar-secundario" onClick={() => inputArchivo.current?.click()}>
            Elegir un archivo
          </button>
          <input
            ref={inputArchivo}
            type="file"
            accept=".csv,.tsv,.txt,text/csv,text/plain"
            hidden
            onChange={(e) => {
              leerArchivo(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          <span className="importar-ayuda">
            Máximo {MAX_FILAS} filas por vez. Lo que ya está cargado se omite solo.
          </span>
        </div>
      </div>

      {error && <p className="importar-error" role="alert">{error}</p>}

      {cuerpo.length > 0 && (
        <>
          <h4>1. Qué es cada columna</h4>
          <div className="importar-columnas">
            {mapeo.map((campo, i) => (
              <div className="importar-columna" key={i}>
                <select
                  aria-label={`Qué es la columna ${i + 1}`}
                  value={campo || ""}
                  onChange={(e) => cambiarColumna(i, e.target.value)}
                >
                  <option value="">Ignorar</option>
                  {CAMPOS.map(([clave, rotulo]) => (
                    <option key={clave} value={clave}>{rotulo}</option>
                  ))}
                </select>
                <span className="importar-muestra" title={muestra[i]}>{muestra[i] || "—"}</span>
              </div>
            ))}
          </div>

          {faltanColumnas && (
            <p className="importar-error" role="alert">
              Indicá cuál columna es el <strong>nombre</strong> y cuál la <strong>fecha</strong>: sin esas
              dos no se puede importar.
            </p>
          )}
          {demasiadas && (
            <p className="importar-error" role="alert">
              Son {cuerpo.length} filas y el máximo es {MAX_FILAS} por vez. Dividí la planilla en partes.
            </p>
          )}

          <div className="importar-opciones">
            {sinAnio && (
              <div className="importar-campo">
                <label htmlFor="imp-anio">Las fechas no traen año, ¿de qué año son?</label>
                <select id="imp-anio" value={anio} onChange={(e) => setAnio(e.target.value)}>
                  <option value="">Automático (este año; el anterior si la fecha aún no llegó)</option>
                  {[anioActual, anioActual - 1, anioActual - 2].map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="importar-campo">
              <label htmlFor="imp-estado">Estado de los contactos que no lo traen</label>
              <select id="imp-estado" value={estadoPorDefecto} onChange={(e) => setEstadoPorDefecto(e.target.value)}>
                {(opciones.estados || []).map((e) => (
                  <option key={e} value={e}>{legible(e)}</option>
                ))}
              </select>
            </div>
          </div>

          {!faltanColumnas && !demasiadas && (
            <>
              <h4>2. Revisá lo que se entendió</h4>
              <div className="importar-resumen" aria-live="polite">
                <button type="button" className={filtro === "todas" ? "activo" : ""} onClick={() => setFiltro("todas")}>
                  Todas <b>{vista.length}</b>
                </button>
                <button type="button" className={`ok${filtro === "nuevas" ? " activo" : ""}`} onClick={() => setFiltro("nuevas")}>
                  Se crean <b>{analizando ? "…" : nuevas}</b>
                </button>
                <button type="button" className={`dup${filtro === "duplicadas" ? " activo" : ""}`} onClick={() => setFiltro("duplicadas")}>
                  Ya existen <b>{analizando ? "…" : duplicadas}</b>
                </button>
                <button type="button" className={`err${filtro === "errores" ? " activo" : ""}`} onClick={() => setFiltro("errores")}>
                  Con error <b>{conError}</b>
                </button>
              </div>

              <div className="importar-tabla-caja">
                <table className="importar-tabla">
                  <thead>
                    <tr>
                      <th>Fila</th>
                      <th>Nombre</th>
                      <th>Teléfono</th>
                      <th>Fecha</th>
                      <th>Formación</th>
                      <th>Vía</th>
                      <th>Resultado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtradas.map((v) => (
                      <tr key={v.fila} className={`fila-${v.estado}`}>
                        <td>{v.fila}</td>
                        <td>{v.datos.name || "—"}</td>
                        <td>{v.datos.phone || "—"}</td>
                        <td>{verFecha(v.datos.first_contact_at)}</td>
                        <td>
                          {nombreFormacion(v.datos.interest_course_id) || v.datos.interest || "—"}
                        </td>
                        <td>{v.datos.origin ? legible(v.datos.origin) : "—"}</td>
                        <td>
                          {v.estado === "ok" && <span className="chip ok">Se crea</span>}
                          {v.estado === "pendiente" && <span className="chip">Revisando…</span>}
                          {v.estado === "duplicada" && (
                            <span className="chip dup">{textoDuplicada(v.duplicadaDe)}</span>
                          )}
                          {v.estado === "error" && <span className="chip err">{v.mensajes.join(" · ")}</span>}
                          {v.avisos.map((a) => (
                            <span className="aviso" key={a}>{a}</span>
                          ))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filtradas.length === 0 && <p className="importar-vacio">No hay filas en esta vista.</p>}
              </div>
            </>
          )}
        </>
      )}

      <div className="importar-acciones">
        <button type="button" className="importar-secundario" onClick={onCancelar}>
          Cancelar
        </button>
        <button
          type="button"
          className="importar-principal"
          onClick={confirmar}
          disabled={confirmando || analizando || nuevas === 0 || faltanColumnas || demasiadas}
        >
          {confirmando
            ? "Importando…"
            : nuevas === 0
              ? "No hay contactos nuevos para importar"
              : `Importar ${nuevas} contacto${nuevas === 1 ? "" : "s"}${
                  conError ? ` (dejando afuera ${conError} con error)` : ""
                }`}
        </button>
      </div>
    </div>
  );
};

export default ImportarContactos;
