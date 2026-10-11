import Codigo from "../components/Codigo.jsx";

export default function QueEs() {
  return (
    <div className="diapositiva entra">
      <header>
        <h2>Una pregunta entra, salen pruebas</h2>
        <p>Si el ayudante trae las pruebas equivocadas, el mejor detective del mundo se equivoca.</p>
      </header>
      <div className="flujo" role="img" aria-label="Pregunta, retriever, pruebas, LLM, respuesta">
        <div className="nodo"><strong>Pregunta</strong>«¿Quién conocía la casa?»</div>
        <span className="flecha-flujo" aria-hidden="true">→</span>
        <div className="nodo este"><strong>Retriever</strong>busca en el expediente</div>
        <span className="flecha-flujo" aria-hidden="true">→</span>
        <div className="nodo"><strong>Pruebas</strong>los k documentos más útiles</div>
        <span className="flecha-flujo" aria-hidden="true">→</span>
        <div className="nodo"><strong>LLM</strong>Holmes razona con ellas</div>
        <span className="flecha-flujo" aria-hidden="true">→</span>
        <div className="nodo"><strong>Respuesta</strong>con las pruebas delante</div>
      </div>
      <div className="tres-col">
        <div>
          <h3>Qué es</h3>
          <p>Una interfaz muy simple: recibe un texto y devuelve una lista de documentos. No necesita guardar nada; solo saber dónde buscar.</p>
        </div>
        <div>
          <h3>Por qué importa</h3>
          <p>El LLM solo ve lo que le pasa el retriever. Muchos fallos de un sistema RAG no son del modelo: son de una búsqueda que trajo las pruebas equivocadas.</p>
        </div>
        <div>
          <h3>Cómo se usa</h3>
          <p>Se crea desde un vector store y se encadena con el resto del flujo. El mando principal es <strong>k</strong>: cuántas pruebas quieres.</p>
        </div>
      </div>
      <Codigo titulo="LangChain · retriever.py" codigo={`retriever = vectorstore.as_retriever(search_kwargs={"k": 3})

pruebas = retriever.invoke("el sabueso")   # lista de Document`} />
    </div>
  );
}
