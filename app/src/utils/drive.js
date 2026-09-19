/**
 * Convierte un link de Google Drive en una URL que se puede usar como imagen.
 *
 * Los links que comparte Drive (/view, ?usp=sharing) no sirven como src de un
 * <img>: devuelven la pagina del visor, no el archivo. El formato thumbnail si.
 *
 * Ante cualquier formato inesperado devuelve la URL original en lugar de fallar:
 * si no es un link de Drive, probablemente ya sea una imagen directa.
 */
export function obtenerLinkDirecto(urlOriginal) {
  try {
    const match = urlOriginal.match(/[-\w]{25,}/);
    if (match && match[0]) {
      return `https://drive.google.com/thumbnail?id=${match[0]}`;
    }
    return urlOriginal;
  } catch (error) {
    return urlOriginal;
  }
}
