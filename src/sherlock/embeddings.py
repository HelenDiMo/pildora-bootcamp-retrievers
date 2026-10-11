"""Embeddings intercambiables para la píldora.

Tres 'backends' (se elige con el argumento `backend` o con la variable de
entorno EMBEDDINGS_BACKEND):

- "spacy"  (por defecto): vectores de palabras en español de spaCy
           (es_core_news_md), promediados por texto. Funciona sin internet
           una vez instalado el modelo y es muy ligero. Son embeddings
           ESTÁTICOS: capturan sinónimos y temas, pero no el orden de las
           palabras.
- "hf":    sentence-transformers multilingüe (paraphrase-multilingual-
           MiniLM-L12-v2) vía Hugging Face. Mejor calidad. Necesita
           descargar el modelo la primera vez (unos 470 MB).
- "fake":  vectores pseudoaleatorios deterministas. SOLO para pruebas de
           que el código funciona; no sirven para comparar relevancia.
"""

from __future__ import annotations

import hashlib
import os

import numpy as np

BACKEND_POR_DEFECTO = "spacy"
MODELO_SPACY = "es_core_news_md"
MODELO_HF = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"

_nlp_cache = {}


def _backend(backend: str | None) -> str:
    elegido = (backend or os.getenv("EMBEDDINGS_BACKEND") or BACKEND_POR_DEFECTO).lower()
    if elegido not in {"spacy", "hf", "fake"}:
        raise ValueError(f"Backend desconocido: {elegido!r}. Usa 'spacy', 'hf' o 'fake'.")
    return elegido


def _cargar_spacy():
    if "nlp" not in _nlp_cache:
        import spacy

        try:
            _nlp_cache["nlp"] = spacy.load(
                MODELO_SPACY,
                exclude=[
                    "tok2vec", "morphologizer", "parser", "attribute_ruler",
                    "lemmatizer", "ner", "senter",
                ],
            )
        except OSError as error:
            raise RuntimeError(
                f"Falta el modelo de spaCy. Instálalo con:\n"
                f"    python -m spacy download {MODELO_SPACY}"
            ) from error
    return _nlp_cache["nlp"]


def _vector_spacy(texto: str) -> np.ndarray:
    """Media de los vectores de las palabras con significado del texto."""
    nlp = _cargar_spacy()
    vectores = [
        t.vector
        for t in nlp(texto)
        if t.has_vector and not t.is_stop and not t.is_punct and not t.is_space
    ]
    if not vectores:
        # Ninguna palabra es conocida (p. ej. "Whitcombe"). Un vector de ceros
        # daría similitudes NaN (0/0), así que usamos un vector "aleatorio pero
        # estable": apunta a una dirección sin relación con ningún documento,
        # que es lo que significa "el modelo no sabe qué es esto".
        return _vector_fake(texto, nlp.vocab.vectors.shape[1])
    media = np.mean(vectores, axis=0)
    norma = np.linalg.norm(media)
    return (media / norma).astype(np.float32) if norma else media.astype(np.float32)


def _vector_fake(texto: str, dimension: int = 64) -> np.ndarray:
    semilla = int.from_bytes(hashlib.sha256(texto.encode("utf-8")).digest()[:8], "big")
    vector = np.random.default_rng(semilla).normal(size=dimension)
    return (vector / np.linalg.norm(vector)).astype(np.float32)


def palabras_desconocidas(texto: str) -> list[str]:
    """Palabras del texto que el modelo de spaCy no conoce (sin vector).

    Sirve para explicar por qué los embeddings fallan con nombres raros como
    "Whitcombe". Con otros backends no se puede saber, y devuelve [].
    """
    if _backend(None) != "spacy":
        return []
    nlp = _cargar_spacy()
    return [
        t.text
        for t in nlp(texto)
        if not t.has_vector and not t.is_stop and not t.is_punct and not t.is_space
    ]


def embeber_textos(textos: list[str], backend: str | None = None) -> np.ndarray:
    """Devuelve una matriz (n_textos x dimensión) con un embedding por texto."""
    backend = _backend(backend)
    if backend == "spacy":
        return np.vstack([_vector_spacy(t) for t in textos])
    if backend == "fake":
        return np.vstack([_vector_fake(t) for t in textos])
    modelo = _modelo_hf()
    return np.asarray(modelo.encode(textos, normalize_embeddings=True), dtype=np.float32)


def _modelo_hf():
    if "hf" not in _nlp_cache:
        from sentence_transformers import SentenceTransformer

        _nlp_cache["hf"] = SentenceTransformer(MODELO_HF)
    return _nlp_cache["hf"]


# --------------------------------------------------------------------------
# Adaptadores para LangChain y LlamaIndex
# --------------------------------------------------------------------------

def crear_embeddings_langchain(backend: str | None = None):
    """Devuelve un objeto Embeddings de LangChain según el backend elegido."""
    backend = _backend(backend)
    if backend == "hf":
        from langchain_huggingface import HuggingFaceEmbeddings

        return HuggingFaceEmbeddings(
            model_name=MODELO_HF, encode_kwargs={"normalize_embeddings": True}
        )

    from langchain_core.embeddings import Embeddings

    class EmbeddingsLocales(Embeddings):
        def embed_documents(self, texts: list[str]) -> list[list[float]]:
            return embeber_textos(texts, backend).tolist()

        def embed_query(self, text: str) -> list[float]:
            return embeber_textos([text], backend)[0].tolist()

    return EmbeddingsLocales()


def crear_embeddings_llamaindex(backend: str | None = None):
    """Devuelve un modelo de embeddings de LlamaIndex según el backend elegido."""
    backend = _backend(backend)
    if backend == "hf":
        from llama_index.embeddings.huggingface import HuggingFaceEmbedding

        return HuggingFaceEmbedding(model_name=MODELO_HF)

    from llama_index.core.embeddings import BaseEmbedding

    class EmbeddingsLocales(BaseEmbedding):
        def _get_query_embedding(self, query: str) -> list[float]:
            return embeber_textos([query], backend)[0].tolist()

        def _get_text_embedding(self, text: str) -> list[float]:
            return embeber_textos([text], backend)[0].tolist()

        async def _aget_query_embedding(self, query: str) -> list[float]:
            return self._get_query_embedding(query)

    return EmbeddingsLocales(model_name=f"locales-{backend}")


def describir_backend(backend: str | None = None) -> str:
    """Texto corto para mostrar en pantalla qué embeddings se están usando."""
    return {
        "spacy": f"spaCy {MODELO_SPACY} (vectores de palabras promediados)",
        "hf": f"sentence-transformers {MODELO_HF}",
        "fake": "vectores falsos (solo para probar el código)",
    }[_backend(backend)]
