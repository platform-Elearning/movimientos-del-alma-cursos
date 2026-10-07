import { FaTrashAlt } from "react-icons/fa";
import BotonIcono from "../botonIcono/BotonIcono";

/**
 * Botón de borrar: el tacho, en rojo.
 *
 * Es de ícono para que entre en la fila junto a los demás botones: con el texto
 * "Eliminar curso" la fila se partía en dos y, con varios cursos, la tabla
 * quedaba desordenada. Es el botón de ícono del sitio (ver BotonIcono) con la
 * variante de peligro, así que mide lo mismo que los demás de su fila.
 */
const BotonBorrar = ({ onClick, etiqueta = "Eliminar", disabled = false }) => (
  <BotonIcono icono={FaTrashAlt} variante="borrar" etiqueta={etiqueta} onClick={onClick} disabled={disabled} />
);

export default BotonBorrar;
