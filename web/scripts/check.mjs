// Comprobación: ¿la web hace lo mismo que los notebooks?
//
//   npm run check
//
// 1. BM25 de JavaScript == rank_bm25 de Python (puntuaciones, 5 decimales).
// 2. Similitud, BM25, MMR e híbrido de JavaScript == retrievers reales de
//    LangChain (guardados en expediente.json por precompute_scores.py).
// 3. Las reglas del reto de la web dan la misma tabla que el notebook 03.

import { readFileSync } from "node:fs";
import { crearMotor } from "../src/lib/retrieval.js";
import { evaluarPista, PISTAS } from "../src/lib/reto.js";

const datos = JSON.parse(readFileSync(new URL("../src/data/expediente.json", import.meta.url), "utf-8"));
const motor = crearMotor(datos);
const ids = (r) => r.map((x) => motor.docs[x.i].id);
let fallos = 0;
const mal = (msg) => { fallos++; console.error("  ✗", msg); };

console.log("1. BM25 (JavaScript vs rank_bm25)");
for (const p of datos.preguntas) {
  const mio = motor.bm25Corte(p.texto, motor.docs.length);
  const python = p.bm25.map((s, i) => [i, s]).filter(([, s]) => s > 0);
  if (mio.length !== python.length) mal(`${p.id}: ${mio.length} resultados con puntuación > 0, Python ${python.length}`);
  for (const { i, p: puntos } of mio) {
    if (Math.abs(puntos - p.bm25[i]) > 1e-5) mal(`${p.id}/${motor.docs[i].id}: ${puntos} vs ${p.bm25[i]}`);
  }
}

console.log("2. Retrievers (JavaScript vs LangChain)");
const ref = datos.referenciaLangchain;
for (const p of datos.preguntas) {
  const q = motor.resolverPregunta(p.texto);
  const casos = {
    similitud: ids(motor.buscar("similitud", q)),
    bm25: ids(motor.buscar("bm25", q)),
    mmr: ids(motor.buscar("mmr", q)),
    hibrido: ids(motor.hibrido(q, motor.P.k, motor.P.pesosHibrido[0]).fusion),
  };
  for (const [metodo, obtenido] of Object.entries(casos)) {
    const esperado = ref[p.id][metodo];
    if (JSON.stringify(obtenido) !== JSON.stringify(esperado))
      mal(`${p.id} · ${metodo}: web ${JSON.stringify(obtenido)} ≠ LangChain ${JSON.stringify(esperado)}`);
  }
}

console.log("3. Reglas del reto (web vs notebook 03)");
// Tabla del notebook 03 (similitud, BM25, MMR, híbrido) para P1..P5
const esperada = { similitud: [1, 0, 0, 0, 0], bm25: [0, 1, 0, 0, 1], mmr: [1, 0, 1, 0, 0], hibrido: [1, 1, 0, 1, 1] };
for (const [metodo, fila] of Object.entries(esperada)) {
  PISTAS.forEach((pista, n) => {
    const q = motor.resolverPregunta(pista.pregunta);
    const ok = evaluarPista(pista.clave, ids(motor.buscar(metodo, q))).ok ? 1 : 0;
    if (ok !== fila[n]) mal(`${pista.clave} · ${metodo}: web ${ok}, notebook ${fila[n]}`);
  });
}

if (fallos) { console.error(`\n${fallos} diferencias. Revisa la implementación.`); process.exit(1); }
console.log("\nTodo coincide ✓");
