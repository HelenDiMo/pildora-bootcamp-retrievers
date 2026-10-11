from sherlock.expediente import a_documentos_langchain, a_documentos_llamaindex, cargar_expediente
from sherlock.retrievers import crear_bm25_langchain, crear_bm25_llamaindex
from sherlock.vista import ids


def test_bm25_langchain_no_rellena_con_documentos_sin_coincidencias():
    bm25 = crear_bm25_langchain(a_documentos_langchain(cargar_expediente()), k=3)
    assert bm25.invoke("el sabueso") == []


def test_bm25_langchain_encuentra_el_nombre_raro():
    bm25 = crear_bm25_langchain(a_documentos_langchain(cargar_expediente()), k=3)
    assert ids(bm25.invoke("Whitcombe")) == ["carta"]


def test_bm25_llamaindex_no_rellena_y_encuentra_el_nombre_raro():
    from llama_index.core.node_parser import SentenceSplitter

    docs = a_documentos_llamaindex(cargar_expediente())
    nodos = SentenceSplitter(chunk_size=1024).get_nodes_from_documents(docs)
    bm25 = crear_bm25_llamaindex(nodos, k=3)
    assert bm25.retrieve("el sabueso") == []
    assert ids(bm25.retrieve("Whitcombe")) == ["carta"]
