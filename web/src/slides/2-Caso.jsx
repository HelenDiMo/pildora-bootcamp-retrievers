import { motor } from "../motor.js";

export default function Caso() {
  return (
    <div className="diapositiva entra caso">
      <header>
        <h2>Un crimen y once papeles</h2>
      </header>
      <div className="dos">
        <div>
          <div className="relato">
            <p>
              La noche del 14 de noviembre de 1894, Lord Edmund Aldridge aparece
              muerto en la biblioteca de Marlowe Hall. Sin heridas, con la
              puerta cerrada por dentro.
            </p>
            <p>
              Scotland Yard ha reunido un expediente: informes, testimonios, un
              recibo, una carta... Holmes no puede leerlo todo cada vez que
              alguien le haga una pregunta. Necesita un ayudante que salga a
              buscar justo las pruebas que hacen falta.
            </p>
            <p>
              Ese ayudante es un <em>retriever</em>. Y esto es exactamente lo
              que hace un sistema RAG.
            </p>
          </div>
          <ul className="expediente" aria-label="Documentos del expediente">
            {motor.docs.map((d) => (
              <li key={d.id}>{d.titulo}</li>
            ))}
          </ul>
        </div>
        <ol className="pasos">
          <li>
            <strong>Indexar</strong>
            <span>
              Se trocean los documentos y se guardan de forma que se puedan
              buscar.
            </span>
            <span className="hilo-sale" aria-hidden="true">
              <b className="etiqueta">documentos guardados</b>
            </span>
          </li>
          <li className="protagonista">
            <strong>Recuperar</strong>
            <span>
              Dada una pregunta, el retriever trae las pruebas más útiles.
            </span>
            <span className="hilo-sale" aria-hidden="true">
              <b className="etiqueta">las pruebas más útiles</b>
            </span>
          </li>
          <li>
            <strong>Generar</strong>
            <span>El LLM responde usando solo esas pruebas.</span>
          </li>
        </ol>
      </div>
    </div>
  );
}
