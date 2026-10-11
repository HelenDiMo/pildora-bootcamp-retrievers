"""Retrievers a medida de la píldora.

Un retriever es, en esencia, "una pregunta entra, una lista de documentos sale".
Aquí hay uno muy pequeño para cada framework: un BM25 que solo devuelve los
documentos que de verdad comparten palabras con la pregunta.

¿Por qué hace falta?  El BM25 de serie devuelve SIEMPRE k documentos, aunque
ninguno contenga ni una sola palabra de la pregunta (con puntuación 0). Cuando
lo mezclas con otro retriever, esos documentos "de relleno" cuentan igual que
los buenos y estropean el resultado híbrido.
"""

from __future__ import annotations

from typing import List

from .texto import tokenizar


# --------------------------------------------------------------------------
# LangChain
# --------------------------------------------------------------------------

def crear_bm25_langchain(documentos, k: int = 3):
    """BM25 para LangChain que descarta los documentos con puntuación 0."""
    from langchain_core.callbacks import CallbackManagerForRetrieverRun
    from langchain_core.documents import Document
    from langchain_core.retrievers import BaseRetriever
    from rank_bm25 import BM25Okapi

    class BM25ConCorte(BaseRetriever):
        documentos: List[Document]
        k: int = 3
        indice: object = None

        def model_post_init(self, _contexto) -> None:
            self.indice = BM25Okapi([tokenizar(d.page_content) for d in self.documentos])

        def _get_relevant_documents(
            self, query: str, *, run_manager: CallbackManagerForRetrieverRun
        ) -> List[Document]:
            puntuaciones = self.indice.get_scores(tokenizar(query))
            orden = sorted(range(len(puntuaciones)), key=lambda i: -puntuaciones[i])
            resultado = []
            for i in orden[: self.k]:
                if puntuaciones[i] <= 0:  # el corte: sin coincidencias, fuera
                    break
                doc = self.documentos[i]
                resultado.append(
                    Document(
                        page_content=doc.page_content,
                        metadata={**doc.metadata, "score": float(puntuaciones[i])},
                    )
                )
            return resultado

    return BM25ConCorte(documentos=documentos, k=k)


# --------------------------------------------------------------------------
# LlamaIndex
# --------------------------------------------------------------------------

def crear_bm25_llamaindex(nodos, k: int = 3):
    """BM25 para LlamaIndex (stemmer español) que descarta puntuaciones 0."""
    import Stemmer
    from llama_index.core.retrievers import BaseRetriever
    from llama_index.core.schema import NodeWithScore, QueryBundle
    from llama_index.retrievers.bm25 import BM25Retriever

    class BM25ConCorte(BaseRetriever):
        def __init__(self) -> None:
            self._bm25 = BM25Retriever.from_defaults(
                nodes=nodos,
                similarity_top_k=k,
                stemmer=Stemmer.Stemmer("spanish"),
                language="es",
            )
            super().__init__()

        def _retrieve(self, query_bundle: QueryBundle) -> List[NodeWithScore]:
            nodos_puntuados = self._bm25.retrieve(query_bundle)
            return [n for n in nodos_puntuados if (n.score or 0) > 0]

    return BM25ConCorte()
