import { FaTrashAlt } from "react-icons/fa";
import "./BotonBorrar.css";

/**
 * Botón de borrar, solo con el ícono del tacho.
 *
 * Es de ícono para que entre en la fila junto a los demás botones: con el texto
 * "Eliminar curso" la fila se partía en dos y, con varios cursos, la tabla
 * quedaba desordenada. Sin texto el botón no dice qué hace, así que el nombre
 * va en aria-label (lo leen los lectores de pantalla) y en title (el tooltip).
 */
const BotonBorrar = ({ onClick, etiqueta = "Eliminar", disabled = false }) => (
  <button
    type="button"
    className="boton-borrar-icono"
    onClick={onClick}
    disabled={disabled}
    aria-label={etiqueta}
    title={etiqueta}
  >
    <FaTrashAlt aria-hidden="true" />
  </button>
);

export default BotonBorrar;
