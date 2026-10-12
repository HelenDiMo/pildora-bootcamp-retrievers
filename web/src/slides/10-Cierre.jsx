import { REPO_URL } from "../components/Autora.jsx";

const COLAB =
  "https://colab.research.google.com/github/HelenDiMo/pildora-bootcamp-retrievers/blob/main/notebooks/";

// Los .ipynb se copian a public/material al arrancar o compilar la web (scripts/copiar-material.mjs).
const MATERIAL = [
  {
    archivo: "01_live_coding.ipynb",
    nombre: "Notebook de explicaciones",
    que: "El live coding de hoy, con los cuatro retrievers paso a paso.",
  },
  {
    archivo: "02_reto_TODO.ipynb",
    nombre: "Notebook del reto",
    que: "Las cinco pistas para resolver con tus propios retrievers.",
  },
];

export default function Cierre() {
  return (
    <div className="diapositiva entra cierre">
      <header>
        <h2>Qué retriever uso cuando</h2>
        <p>
          Empieza por el híbrido y mide con preguntas reales. Ningún retriever
          vale para todo.
        </p>
      </header>
      <div className="dos">
        <dl className="decide">
          <div>
            <dt>
              Mis usuarios preguntan con otras palabras que mis documentos
            </dt>
            <dd>similitud</dd>
          </div>
          <div>
            <dt>Buscan nombres, códigos o términos poco comunes</dt>
            <dd>BM25</dd>
          </div>
          <div>
            <dt>Mis resultados se repiten entre sí</dt>
            <dd>MMR</dd>
          </div>
          <div>
            <dt>Pasa de todo un poco</dt>
            <dd>híbrido (RRF)</dd>
          </div>
          <div>
            <dt>Algo falla</dt>
            <dd>mira qué devolvió el retriever antes de culpar al LLM</dd>
          </div>
        </dl>
        <div className="apartados">
          <section>
            <h3 className="apartado">Material de la sesión</h3>
            <ul className="material">
              {MATERIAL.map((m) => (
                <li key={m.archivo}>
                  <div>
                    <span className="nombre">{m.nombre}</span>
                    <span className="que">{m.que}</span>
                  </div>
                  <div className="acciones">
                    <a
                      href={COLAB + m.archivo}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Abrir en Colab
                    </a>
                    <a href={`material/${m.archivo}`} download>
                      Descargar
                    </a>
                  </div>
                </li>
              ))}
            </ul>
            <p className="nota-codigo">
              Para ejecutarlos en tu ordenador hace falta el repositorio entero:{" "}
              <a href={`${REPO_URL}/archive/refs/heads/main.zip`}>
                descargar todo (.zip)
              </a>
              .
            </p>
          </section>

          <section className="seccion-espaciada">
            <h3 className="apartado">Recursos para seguir aprendiendo</h3>
            <ul className="recursos">
              <li>
                <a
                  href="https://www.youtube.com/playlist?list=PLfaIDFEXuae2LXbO1_PKyVJiQ23ZztA0x"
                  target="_blank"
                  rel="noreferrer"
                >
                  RAG From Scratch, vídeos cortos de LangChain (en inglés)
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/langchain-ai/rag-from-scratch"
                  target="_blank"
                  rel="noreferrer"
                >
                  Los notebooks de esa serie
                </a>
              </li>
              <li>
                <a
                  href="https://developers.llamaindex.ai/python/framework/module_guides/querying/retriever/retrievers/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Módulos de retrievers de LlamaIndex
                </a>
              </li>
              <li>
                <a
                  href="https://js.langchain.com/docs/concepts/retrievers"
                  target="_blank"
                  rel="noreferrer"
                >
                  Conceptos de retrievers en LangChain
                </a>
              </li>
            </ul>
            <p className="nota-codigo siguiente">
              Siguiente nivel: <strong>multi-query</strong>,{" "}
              <strong>HyDE</strong> y <strong>rerankers</strong>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
