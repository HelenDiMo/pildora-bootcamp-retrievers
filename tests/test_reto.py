import pytest

from sherlock.embeddings import crear_embeddings_langchain
from sherlock.expediente import a_documentos_langchain, cargar_expediente
from sherlock.reto import PISTAS, evaluar
from sherlock.retrievers import crear_bm25_langchain
from sherlock.vista import ids


@pytest.fixture(scope="module")
def retrievers():
    from langchain_classic.retrievers import EnsembleRetriever
    from langchain_core.vectorstores import InMemoryVectorStore

    docs = a_documentos_langchain(cargar_expediente())
    try:
        almacen = InMemoryVectorStore.from_documents(docs, crear_embeddings_langchain("spacy"))
    except RuntimeError:
        pytest.skip("Falta el modelo es_core_news_md de spaCy")
    sim = almacen.as_retriever(search_kwargs={"k": 3})
    bm25 = crear_bm25_langchain(docs, k=3)
    mmr = almacen.as_retriever(search_type="mmr", search_kwargs={"k": 3, "fetch_k": 6, "lambda_mult": 0.5})
    hib = EnsembleRetriever(retrievers=[bm25, sim], weights=[0.5, 0.5])
    return {"similitud": sim, "bm25": bm25, "mmr": mmr, "hibrido": hib}


# La tabla que se ve en el notebook de solución (1 = la pista queda resuelta)
ESPERADA = {
    "similitud": [1, 0, 0, 0, 0],
    "bm25": [0, 1, 0, 0, 1],
    "mmr": [1, 0, 1, 0, 0],
    "hibrido": [1, 1, 0, 1, 1],
}


@pytest.mark.parametrize("metodo", ESPERADA)
def test_tabla_de_aciertos(retrievers, metodo):
    obtenida = [
        int(evaluar(clave, ids(retrievers[metodo].invoke(pista["pregunta"])))[0])
        for clave, pista in PISTAS.items()
    ]
    assert obtenida == ESPERADA[metodo]


def test_ninguna_pista_es_trivial(retrievers):
    """Cada pista se resuelve con algún retriever y se falla con otro."""
    for n, (clave, pista) in enumerate(PISTAS.items()):
        resultados = [ESPERADA[m][n] for m in ESPERADA]
        assert 0 in resultados and 1 in resultados, clave
