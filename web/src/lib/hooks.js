import { useEffect, useState } from "react";

/** ¿Prefiere la persona menos movimiento? */
export function useMenosMovimiento() {
  const [menos, setMenos] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    const alCambiar = () => setMenos(m.matches);
    m.addEventListener("change", alCambiar);
    return () => m.removeEventListener("change", alCambiar);
  }, []);
  return menos;
}

/** Texto que se escribe letra a letra, como una máquina de escribir. */
export function useMaquina(texto, activo, velocidad = 16) {
  const menos = useMenosMovimiento();
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!activo) { setN(0); return; }
    if (menos) { setN(texto.length); return; }
    setN(0);
    const id = setInterval(() => setN((x) => (x >= texto.length ? (clearInterval(id), x) : x + 1)), velocidad);
    return () => clearInterval(id);
  }, [texto, activo, menos, velocidad]);
  return texto.slice(0, n);
}

/** Giro pequeño y estable para cada carta (siempre el mismo para el mismo id). */
export function giroDe(id) {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) % 997;
  return ((h % 41) - 20) / 10; // entre -2 y +2 grados
}

export const NOMBRE_METODO = {
  similitud: "Similitud",
  bm25: "BM25",
  mmr: "MMR",
  hibrido: "Híbrido",
};

export const FRASE_METODO = {
  similitud: "Busca por significado: encuentra «lebrel» aunque preguntes por «sabueso».",
  bm25: "Busca palabras exactas: clava los nombres raros, pero no entiende sinónimos.",
  mmr: "Como la similitud, pero evita traer pruebas que se parezcan demasiado entre sí.",
  hibrido: "Combina BM25 y similitud mirando solo la posición de cada prueba en cada lista.",
};
