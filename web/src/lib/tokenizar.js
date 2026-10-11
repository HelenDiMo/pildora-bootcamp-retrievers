// Tokenizador idéntico al de Python (src/sherlock/texto.py).
// Si cambias algo aquí, cambia también el script de Python: los dos tienen
// que producir las mismas palabras para que BM25 dé las mismas puntuaciones.

/** Minúsculas y sin tildes, pero conservando la ñ. */
export function quitarTildes(texto) {
  // Protegemos la ñ con un carácter de control antes de descomponer (NFD),
  // porque NFD separaría "ñ" en "n" + una marca que luego borraríamos.
  const protegido = texto.replace(/ñ/g, "\u0001").replace(/Ñ/g, "\u0002");
  const sinMarcas = protegido.normalize("NFD").replace(/[̀-ͯ]/g, "");
  return sinMarcas.replace(/\u0001/g, "ñ").replace(/\u0002/g, "Ñ");
}

/**
 * Devuelve una función `tokenizar(texto) -> string[]`
 * que usa la lista de palabras vacías del expediente.
 */
export function crearTokenizador(palabrasVacias) {
  const vacias = new Set(palabrasVacias);
  return function tokenizar(texto) {
    const limpio = quitarTildes(String(texto).toLowerCase());
    const palabras = limpio.match(/[a-z0-9ñ]+/g) || [];
    return palabras.filter((p) => !vacias.has(p));
  };
}
