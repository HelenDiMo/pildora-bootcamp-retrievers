import { useState } from "react";
import Codigo from "../components/Codigo.jsx";
import { NOMBRE_METODO } from "../lib/hooks.js";

const CODIGO = {
  similitud: {
    lc: `retriever = vectorstore.as_retriever(search_kwargs={"k": 3})

pruebas = retriever.invoke("el sabueso")`,
    li: `retriever = index.as_retriever(similarity_top_k=3)

nodos = retriever.retrieve("el sabueso")
# cada nodo trae su puntuación: nodos[0].score`,
    nota: "LangChain devuelve <strong>Document</strong> sin puntuación; LlamaIndex devuelve <strong>NodeWithScore</strong>. Si quieres las puntuaciones en LangChain, usa <strong>vectorstore.similarity_search_with_score</strong>.",
  },
  bm25: {
    lc: `from langchain_community.retrievers import BM25Retriever

retriever = BM25Retriever.from_documents(docs, k=3)`,
    li: `import Stemmer
from llama_index.retrievers.bm25 import BM25Retriever

retriever = BM25Retriever.from_defaults(
    nodes=nodos, similarity_top_k=3,
    stemmer=Stemmer.Stemmer("spanish"), language="es",
)`,
    nota: "<strong>Cuidado:</strong> el BM25 de serie siempre devuelve k documentos, aunque ninguno comparta una palabra con tu pregunta. Estropea los híbridos. En el repositorio hay una versión «con corte» (<strong>sherlock/retrievers.py</strong>).",
  },
  mmr: {
    lc: `retriever = vectorstore.as_retriever(
    search_type="mmr",
    search_kwargs={"k": 3, "fetch_k": 6, "lambda_mult": 0.5},
)`,
    li: `retriever = index.as_retriever(
    similarity_top_k=3,
    vector_store_query_mode="mmr",
    vector_store_kwargs={"mmr_threshold": 0.6},
)`,
    nota: "En LangChain, <strong>lambda_mult</strong> va de 0 (solo variedad) a 1 (solo relevancia). El MMR de LlamaIndex es una versión simplificada: solo compara con la última prueba elegida, así que no esperes los mismos resultados.",
  },
  hibrido: {
    lc: `# En LangChain 1.x ya no está en langchain.retrievers
from langchain_classic.retrievers import EnsembleRetriever

retriever = EnsembleRetriever(
    retrievers=[bm25, similitud],
    weights=[0.5, 0.5],
)
pruebas = retriever.invoke(pregunta)[:3]`,
    li: `from llama_index.core.retrievers import QueryFusionRetriever

retriever = QueryFusionRetriever(
    [similitud, bm25],
    similarity_top_k=3,
    num_queries=1,              # 1 = sin LLM
    mode="reciprocal_rerank",
    use_async=False,
)`,
    nota: "Los dos usan <strong>Reciprocal Rank Fusion</strong>. El de LangChain devuelve la unión de las listas, no k: hay que recortar con <strong>[:3]</strong>.",
  },
};

export default function CodigoSlide() {
  const [metodo, setMetodo] = useState("hibrido");
  const c = CODIGO[metodo];
  return (
    <div className="diapositiva entra">
      <header>
        <h2>El mismo retriever, en dos idiomas</h2>
        <p>LangChain y LlamaIndex hacen lo mismo con nombres distintos. Elige el método.</p>
      </header>
      <div className="pestanas" role="tablist" aria-label="Método">
        {Object.keys(CODIGO).map((m) => (
          <button key={m} role="tab" className="pestana" aria-selected={metodo === m} onClick={() => setMetodo(m)}>{NOMBRE_METODO[m]}</button>
        ))}
      </div>
      <div className="columnas">
        <Codigo titulo="LangChain" codigo={c.lc} />
        <Codigo titulo="LlamaIndex" codigo={c.li} />
      </div>
      <p className="nota-codigo" dangerouslySetInnerHTML={{ __html: c.nota }} />
    </div>
  );
}
