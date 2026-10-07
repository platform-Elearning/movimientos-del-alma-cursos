import { useEffect, useRef, useState } from "react";
import "./ConfirmarBorrado.css";

/**
 * Confirmación antes de borrar.
 *
 * Borrar un módulo o un curso no se deshace, y arrastra cosas que quien aprieta
 * no ve (clases, comentarios, lo que ve cada alumna). Por eso no alcanza con un
 * "¿está seguro?": el cuerpo dice qué se pierde, y el botón rojo no se habilita
 * hasta marcar que se entendió. El foco arranca en "Cancelar", no en borrar, así
 * un Enter de más no borra nada.
 *
 * Es el mismo componente para cursos, módulos y clases: lo que cambia es el
 * texto, no el cuidado.
 */
const ConfirmarBorrado = ({
  titulo,
  children,
  cargando = false,
  error = "",
  enProceso = false,
  textoConfirmar = "Sí, borrar",
  exigirEntendido = true,
  bloqueado = false,
  onConfirmar,
  onCancelar,
}) => {
  const [entendido, setEntendido] = useState(false);
  const cancelar = useRef(null);

  useEffect(() => {
    cancelar.current?.focus();
    const alTeclear = (e) => {
      if (e.key === "Escape" && !enProceso) onCancelar?.();
    };
    document.addEventListener("keydown", alTeclear);
    return () => document.removeEventListener("keydown", alTeclear);
  }, [enProceso, onCancelar]);

  const puedeBorrar = !cargando && !enProceso && !bloqueado && (!exigirEntendido || entendido);

  return (
    <div
      className="confirmar-fondo"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !enProceso) onCancelar?.();
      }}
    >
      <div className="confirmar-caja" role="alertdialog" aria-modal="true" aria-labelledby="confirmar-titulo">
        <h2 id="confirmar-titulo" className="confirmar-titulo">{titulo}</h2>

        <div className="confirmar-cuerpo">
          {cargando ? <p className="confirmar-cargando">Calculando qué se pierde…</p> : children}
        </div>

        {error && (
          <p className="confirmar-error" role="alert">
            {error}
          </p>
        )}

        {exigirEntendido && !bloqueado && !cargando && (
          <label className="confirmar-entendido">
            <input
              type="checkbox"
              checked={entendido}
              onChange={(e) => setEntendido(e.target.checked)}
              disabled={enProceso}
            />
            Entiendo que esto no se puede deshacer
          </label>
        )}

        <div className="confirmar-acciones">
          <button
            type="button"
            ref={cancelar}
            className="confirmar-cancelar"
            onClick={onCancelar}
            disabled={enProceso}
          >
            {bloqueado ? "Cerrar" : "Cancelar"}
          </button>
          {!bloqueado && (
            <button
              type="button"
              className="confirmar-borrar"
              onClick={onConfirmar}
              disabled={!puedeBorrar}
            >
              {enProceso ? "Borrando…" : textoConfirmar}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfirmarBorrado;
