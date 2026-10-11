// BM25Okapi, igual que `rank_bm25.BM25Okapi` de Python.
// Referencia: https://github.com/dorianbrown/rank_bm25

export class BM25Okapi {
  /**
   * @param {string[][]} corpus  documentos ya tokenizados
   * @param {{k1?:number,b?:number,epsilon?:number}} params
   */
  constructor(corpus, { k1 = 1.5, b = 0.75, epsilon = 0.25 } = {}) {
    this.k1 = k1;
    this.b = b;
    this.epsilon = epsilon;
    this.tamano = corpus.length;
    this.longitudes = corpus.map((d) => d.length);
    this.avgdl = this.longitudes.reduce((a, c) => a + c, 0) / this.tamano;

    // Frecuencia de cada palabra en cada documento y en cuántos documentos aparece.
    this.frecuencias = corpus.map((doc) => {
      const f = new Map();
      for (const t of doc) f.set(t, (f.get(t) || 0) + 1);
      return f;
    });
    const nDocs = new Map();
    for (const f of this.frecuencias) {
      for (const t of f.keys()) nDocs.set(t, (nDocs.get(t) || 0) + 1);
    }
    this.idf = this.#calcularIdf(nDocs);
  }

  // idf(t) = ln((N - n + 0.5) / (n + 0.5)).
  // Las palabras que aparecen en más de la mitad de los documentos salen con idf
  // negativo; rank_bm25 las sustituye por epsilon * idf_medio, donde idf_medio
  // se calcula con TODAS las palabras (incluidas las negativas) antes de sustituir.
  #calcularIdf(nDocs) {
    const idf = new Map();
    let suma = 0;
    const negativas = [];
    for (const [t, n] of nDocs) {
      const v = Math.log(this.tamano - n + 0.5) - Math.log(n + 0.5);
      idf.set(t, v);
      suma += v;
      if (v < 0) negativas.push(t);
    }
    const idfMedio = suma / idf.size;
    const eps = this.epsilon * idfMedio;
    for (const t of negativas) idf.set(t, eps);
    return idf;
  }

  /** Puntuación BM25 de cada documento para una consulta ya tokenizada. */
  puntuar(consulta) {
    const { k1, b, avgdl } = this;
    return this.frecuencias.map((f, i) => {
      let total = 0;
      // Si una palabra se repite en la consulta, cuenta cada vez (como rank_bm25).
      for (const q of consulta) {
        const idf = this.idf.get(q) || 0; // fuera del vocabulario: aporta 0
        const freq = f.get(q) || 0;
        total += (idf * (freq * (k1 + 1))) / (freq + k1 * (1 - b + (b * this.longitudes[i]) / avgdl));
      }
      return total;
    });
  }
}
