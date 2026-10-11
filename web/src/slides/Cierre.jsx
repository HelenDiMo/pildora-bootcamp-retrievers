export default function Cierre() {
  return (
    <div className="diapositiva entra">
      <header>
        <h2>Qué retriever uso cuando</h2>
        <p>Empieza por el híbrido y mide con preguntas reales. Ningún retriever vale para todo.</p>
      </header>
      <div className="dos">
        <dl className="decide">
          <div><dt>Mis usuarios preguntan con otras palabras que mis documentos</dt><dd>similitud</dd></div>
          <div><dt>Buscan nombres, códigos o términos poco comunes</dt><dd>BM25</dd></div>
          <div><dt>Mis resultados se repiten entre sí</dt><dd>MMR</dd></div>
          <div><dt>Pasa de todo un poco</dt><dd>híbrido (RRF)</dd></div>
          <div><dt>Algo falla</dt><dd>mira qué devolvió el retriever antes de culpar al LLM</dd></div>
        </dl>
        <div>
          <ul className="recursos">
            <li><a href="https://www.youtube.com/playlist?list=PLfaIDFEXuae2LXbO1_PKyVJiQ23ZztA0x" target="_blank" rel="noreferrer">RAG From Scratch, vídeos cortos de LangChain (en inglés)</a></li>
            <li><a href="https://github.com/langchain-ai/rag-from-scratch" target="_blank" rel="noreferrer">Los notebooks de esa serie</a></li>
            <li><a href="https://developers.llamaindex.ai/python/framework/module_guides/querying/retriever/retrievers/" target="_blank" rel="noreferrer">Módulos de retrievers de LlamaIndex</a></li>
            <li><a href="https://js.langchain.com/docs/concepts/retrievers" target="_blank" rel="noreferrer">Conceptos de retrievers en LangChain</a></li>
          </ul>
          <p className="nota-codigo" style={{ marginTop: "1.4rem" }}>
            Siguiente nivel: <strong>multi-query</strong>, <strong>HyDE</strong> y <strong>rerankers</strong>.
          </p>
          <p className="nota-codigo" style={{ marginTop: "1rem", fontFamily: "var(--maquina)" }}>Elena Díaz - @HelenDiMo</p>
        </div>
      </div>
    </div>
  );
}
