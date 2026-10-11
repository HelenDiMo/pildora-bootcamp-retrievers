"""Precalcula las puntuaciones que usa la web de la presentación.

Los embeddings no se pueden calcular dentro del navegador de forma sencilla,
así que la web carga un JSON con:

- los documentos del expediente,
- la similitud semántica (coseno) de cada pregunta con cada documento,
- la similitud entre documentos (para MMR),
- las puntuaciones BM25 de referencia (la web recalcula BM25 en vivo y se
  compara con estas para comprobar que coinciden),
- lo que devuelven los retrievers REALES de LangChain (similitud, BM25, MMR e
  híbrido) para cada pregunta. La web reimplementa esos algoritmos en
  JavaScript y `npm run check` comprueba que dan exactamente lo mismo.

Uso (desde la raíz del repositorio):

    python scripts/precompute_scores.py                  # backend por defecto (spacy)
    python scripts/precompute_scores.py --backend hf     # sentence-transformers

Salida: web/src/data/expediente.json
"""

import argparse
import json
import sys
from datetime import date
from pathlib import Path

import numpy as np
from rank_bm25 import BM25Okapi

RAIZ = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(RAIZ / "src"))

from sherlock.embeddings import describir_backend, embeber_textos, palabras_desconocidas  # noqa: E402
from sherlock.expediente import cargar_expediente  # noqa: E402
from sherlock.preguntas import PREGUNTAS  # noqa: E402
from sherlock.texto import PALABRAS_VACIAS, tokenizar  # noqa: E402
from sherlock.vista import ids  # noqa: E402

BM25_K1, BM25_B, BM25_EPSILON = 1.5, 0.75, 0.25  # valores por defecto de rank_bm25


def redondear(matriz, decimales=6):
    return np.round(np.asarray(matriz, dtype=float), decimales).tolist()


# Parámetros que la web usa por defecto (los mismos que los notebooks)
K = 3
MMR_FETCH_K, MMR_LAMBDA = 6, 0.5
PESOS_HIBRIDO = [0.5, 0.5]  # [BM25, similitud]


def referencia_langchain(expediente, backend):
    """Resultados de los retrievers reales de LangChain para cada pregunta."""
    from langchain_classic.retrievers import EnsembleRetriever
    from langchain_core.vectorstores import InMemoryVectorStore

    from sherlock.embeddings import crear_embeddings_langchain
    from sherlock.expediente import a_documentos_langchain
    from sherlock.retrievers import crear_bm25_langchain

    docs = a_documentos_langchain(expediente)
    almacen = InMemoryVectorStore.from_documents(docs, crear_embeddings_langchain(backend))
    similitud = almacen.as_retriever(search_kwargs={"k": K})
    mmr = almacen.as_retriever(
        search_type="mmr",
        search_kwargs={"k": K, "fetch_k": MMR_FETCH_K, "lambda_mult": MMR_LAMBDA},
    )
    bm25 = crear_bm25_langchain(docs, k=K)
    hibrido = EnsembleRetriever(retrievers=[bm25, similitud], weights=PESOS_HIBRIDO)

    return {
        p["id"]: {
            "similitud": ids(similitud.invoke(p["texto"])),
            "bm25": ids(bm25.invoke(p["texto"])),
            "mmr": ids(mmr.invoke(p["texto"])),
            "hibrido": ids(hibrido.invoke(p["texto"])),  # lista completa, sin recortar
        }
        for p in PREGUNTAS
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    parser.add_argument("--backend", default=None, help="spacy | hf | fake")
    parser.add_argument(
        "--salida", default=str(RAIZ / "web" / "src" / "data" / "expediente.json")
    )
    args = parser.parse_args()

    expediente = cargar_expediente()
    textos = [d["texto"] for d in expediente]

    embeddings_docs = embeber_textos(textos, args.backend)
    similitud_docs = embeddings_docs @ embeddings_docs.T

    bm25 = BM25Okapi([tokenizar(t) for t in textos], k1=BM25_K1, b=BM25_B, epsilon=BM25_EPSILON)

    preguntas = []
    for p in PREGUNTAS:
        embedding_q = embeber_textos([p["texto"]], args.backend)[0]
        preguntas.append(
            {
                "id": p["id"],
                "texto": p["texto"],
                "semantica": redondear(embeddings_docs @ embedding_q),
                "bm25": redondear(bm25.get_scores(tokenizar(p["texto"]))),
                "desconocidas": palabras_desconocidas(p["texto"]),
            }
        )

    salida = {
        "meta": {
            "titulo": "El caso de los Retrievers",
            "autora": "Elena Díaz - @HelenDiMo",
            "embeddings": describir_backend(args.backend),
            "generado": date.today().isoformat(),
            "bm25": {"k1": BM25_K1, "b": BM25_B, "epsilon": BM25_EPSILON},
            "palabrasVacias": sorted(PALABRAS_VACIAS),
            "parametros": {
                "k": K,
                "mmrFetchK": MMR_FETCH_K,
                "mmrLambda": MMR_LAMBDA,
                "pesosHibrido": PESOS_HIBRIDO,
                "rrfC": 60,
            },
        },
        "docs": expediente,
        "preguntas": preguntas,
        "similitudDocs": redondear(similitud_docs),
        "referenciaLangchain": referencia_langchain(expediente, args.backend),
    }

    ruta = Path(args.salida)
    ruta.parent.mkdir(parents=True, exist_ok=True)
    ruta.write_text(json.dumps(salida, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"Escrito {ruta} ({len(expediente)} documentos, {len(preguntas)} preguntas)")
    print(f"Embeddings: {salida['meta']['embeddings']}")


if __name__ == "__main__":
    main()
