// Los cuatro retrievers de la píldora, reimplementados en JavaScript.
//
// Son los MISMOS algoritmos que usan los notebooks (LangChain), y
// `npm run check` comprueba que devuelven exactamente lo mismo que ellos.
// Lo único que NO se calcula aquí son los embeddings: vienen precalculados
// en src/data/expediente.json (scripts/precompute_scores.py).

import { BM25Okapi } from "./bm25.js";
import { crearTokenizador } from "./tokenizar.js";

export function crearMotor(datos) {
  const { docs, preguntas, similitudDocs, meta } = datos;
  const P = meta.parametros;
  const tokenizar = crearTokenizador(meta.palabrasVacias);
  const bm25 = new BM25Okapi(docs.map((d) => tokenizar(d.texto)), meta.bm25);
  const indiceDe = Object.fromEntries(docs.map((d, i) => [d.id, i]));

  // Índices de mayor a menor puntuación. El orden es estable: en un empate
  // gana el documento que aparece antes (igual que `sorted` en Python).
  const ordenar = (puntos) =>
    puntos.map((_, i) => i).sort((a, b) => puntos[b] - puntos[a]);

  /** Une una pregunta escrita con sus datos precalculados (si los hay). */
  function resolverPregunta(texto) {
    const limpio = texto.trim().toLowerCase();
    const guardada = preguntas.find((p) => p.texto.toLowerCase() === limpio);
    if (guardada) return { texto: guardada.texto, id: guardada.id, sem: guardada.semantica, desconocidas: guardada.desconocidas };
    return { texto: texto.trim(), id: null, sem: null, desconocidas: null };
  }

  function similitud(sem, k) {
    return ordenar(sem).slice(0, k).map((i) => ({ i, p: sem[i] }));
  }

  /** BM25 "con corte": solo devuelve documentos con alguna palabra en común. */
  function bm25Corte(texto, k) {
    const puntos = bm25.puntuar(tokenizar(texto));
    return ordenar(puntos).slice(0, k).filter((i) => puntos[i] > 0).map((i) => ({ i, p: puntos[i] }));
  }

  /** MMR estándar (el de LangChain): candidatos = los `fetchK` más parecidos. */
  function mmr(sem, k, fetchK, lambda) {
    const candidatos = ordenar(sem).slice(0, fetchK);
    if (!candidatos.length) return [];
    const elegidos = [candidatos[0]];
    const total = Math.min(k, candidatos.length);
    while (elegidos.length < total) {
      let mejor = -Infinity;
      let siguiente = -1;
      for (const i of candidatos) {
        if (elegidos.includes(i)) continue;
        const redundancia = Math.max(...elegidos.map((j) => similitudDocs[i][j]));
        const valor = lambda * sem[i] - (1 - lambda) * redundancia;
        if (valor > mejor) { mejor = valor; siguiente = i; }
      }
      elegidos.push(siguiente);
    }
    return elegidos.map((i) => ({ i, p: sem[i] }));
  }

  /** Reciprocal Rank Fusion ponderado (EnsembleRetriever / QueryFusionRetriever). */
  function rrf(listas, pesos, c = P.rrfC) {
    const puntos = new Map();
    const vistos = [];
    listas.forEach((lista, l) =>
      lista.forEach((i, r) => {
        if (!puntos.has(i)) { puntos.set(i, 0); vistos.push(i); }
        puntos.set(i, puntos.get(i) + pesos[l] / (r + 1 + c));
      })
    );
    return vistos.sort((a, b) => puntos.get(b) - puntos.get(a)).map((i) => ({ i, p: puntos.get(i) }));
  }

  /** Híbrido = BM25 con corte + similitud, fusionados con RRF. Devuelve todo el detalle. */
  function hibrido(pregunta, k, pesoBM25) {
    const listaBM25 = bm25Corte(pregunta.texto, k);
    const listaSim = pregunta.sem ? similitud(pregunta.sem, k) : [];
    const pesos = [pesoBM25, 1 - pesoBM25];
    const fusion = rrf([listaBM25.map((x) => x.i), listaSim.map((x) => x.i)], pesos);
    return { listaBM25, listaSim, pesos, fusion };
  }

  /** Cuánto se parecen entre sí las pruebas elegidas (0 = nada, 1 = idénticas). */
  function parecidoMedio(indices) {
    if (indices.length < 2) return 0;
    let suma = 0, pares = 0;
    for (let a = 0; a < indices.length; a++)
      for (let b = a + 1; b < indices.length; b++) { suma += similitudDocs[indices[a]][indices[b]]; pares++; }
    return suma / pares;
  }

  /** Ejecuta un método con los parámetros dados. Devuelve [{i, p}]. */
  function buscar(metodo, pregunta, { k = P.k, lambda = P.mmrLambda, peso = P.pesosHibrido[0] } = {}) {
    switch (metodo) {
      case "bm25": return bm25Corte(pregunta.texto, k);
      case "similitud": return pregunta.sem ? similitud(pregunta.sem, k) : [];
      case "mmr": return pregunta.sem ? mmr(pregunta.sem, k, Math.max(P.mmrFetchK, k), lambda) : [];
      case "hibrido": return hibrido(pregunta, k, peso).fusion.slice(0, k);
      default: throw new Error(`Método desconocido: ${metodo}`);
    }
  }

  return { docs, preguntas, P, meta, indiceDe, resolverPregunta, similitud, bm25Corte, mmr, rrf, hibrido, parecidoMedio, buscar };
}
