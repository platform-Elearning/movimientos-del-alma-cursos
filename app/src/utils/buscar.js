/**
 * Buscar sin que importen mayúsculas ni acentos: "maria" encuentra "María" y
 * "MARÍA". Es como se busca un nombre que se escuchó por teléfono.
 */
export const normalizarTexto = (v) =>
  String(v ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();

/**
 * Filtra por texto en varios campos a la vez. Cada palabra buscada tiene que
 * aparecer en alguno: "ana jazz" encuentra a Ana en el profesorado de Jazz.
 * `campos` es una función que devuelve los textos de cada elemento.
 */
export const filtrarPorTexto = (elementos, busqueda, campos) => {
  const palabras = normalizarTexto(busqueda).split(/\s+/).filter(Boolean);
  if (palabras.length === 0) return elementos;
  return elementos.filter((e) => {
    const texto = normalizarTexto(campos(e).filter((x) => x !== null && x !== undefined).join(" "));
    return palabras.every((p) => texto.includes(p));
  });
};

/** Mueve el elemento de la posición `desde` a la posición `hacia`, sin tocar el original. */
export const moverEnLista = (lista, desde, hacia) => {
  if (desde === hacia || desde < 0 || hacia < 0 || desde >= lista.length || hacia >= lista.length) {
    return lista;
  }
  const copia = [...lista];
  const [movido] = copia.splice(desde, 1);
  copia.splice(hacia, 0, movido);
  return copia;
};
