import "./BotonIcono.css";

/**
 * Botón cuadrado con solo un ícono.
 *
 * Es el único estilo de botón de ícono del sitio: antes cada pantalla usaba
 * emojis (▶️ 🔗 ✏️ 🗑️), que se dibujan distinto en cada sistema, en tamaños y
 * colores que no tienen que ver con la paleta, y quedaban a distinta altura.
 * Con íconos vectoriales, del mismo tamaño y con los colores del sitio, una fila
 * de acciones se ve ordenada.
 *
 * Sin texto no dice qué hace, así que `etiqueta` es obligatoria: va en aria-label
 * (lectores de pantalla) y en title (el tooltip).
 *
 * @param icono    componente de react-icons (por ejemplo FaPen)
 * @param variante "neutro" (contorno dorado), "principal" (dorado lleno, la acción
 *                 más importante de la fila) o "borrar" (rojo)
 * @param href     si viene, es un enlace que abre en otra pestaña; si no, un botón
 */
const BotonIcono = ({ icono: Icono, etiqueta, onClick, href, variante = "neutro", disabled = false }) => {
  const clase = `boton-icono boton-icono--${variante}`;

  if (href) {
    return (
      <a className={clase} href={href} target="_blank" rel="noopener noreferrer" aria-label={etiqueta} title={etiqueta}>
        <Icono aria-hidden="true" />
      </a>
    );
  }

  return (
    <button type="button" className={clase} onClick={onClick} disabled={disabled} aria-label={etiqueta} title={etiqueta}>
      <Icono aria-hidden="true" />
    </button>
  );
};

export default BotonIcono;
