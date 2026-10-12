import { useMemo } from "react";
import Selector from "../components/Selector.jsx";
import Lista from "../components/Lista.jsx";
import { motor } from "../motor.js";

export default function DosDetectives({ texto, setTexto }) {
  const pregunta = useMemo(() => motor.resolverPregunta(texto), [texto]);
  const bm = motor.buscar("bm25", pregunta);
  const sim = motor.buscar("similitud", pregunta);
  const comunes = bm.filter((b) => sim.some((s) => s.i === b.i)).length;
  const desconocidas = pregunta.desconocidas ?? [];

  let comentario;
  if (!bm.length && sim.length) comentario = "BM25 no encuentra ni una palabra en común; la similitud sí trae pruebas.";
  else if (desconocidas.length) comentario = `El modelo de embeddings no conoce «${desconocidas.join("», «")}»: la similitud devuelve ruido y BM25 es quien acierta.`;
  else comentario = `Coinciden en ${comunes} de ${Math.max(bm.length, sim.length)} pruebas. Lo que no comparten, lo ve solo uno de los dos.`;

  return (
    <div className="diapositiva entra">
      <header>
        <h2>Dos detectives, una pregunta</h2>
        <p>Cada método falla donde el otro acierta. Prueba «el sabueso» y luego «Whitcombe».</p>
      </header>
      <Selector valor={texto} onCambio={setTexto} />
      <p className="aviso" role="status">{comentario}</p>
      <div className="columnas">
        <section className="columna">
          <h3>BM25, el de las palabras exactas</h3>
          <p className="quien">Cuenta cuántas palabras de tu pregunta aparecen en cada documento y premia las raras.</p>
          <Lista resultados={bm} vacio="No encuentra ninguna palabra en común, así que no devuelve nada." />
        </section>
        <section className="columna">
          <h3>La similitud, la del significado</h3>
          <p className="quien">Compara lo que quiere decir tu pregunta con lo que dice cada documento.</p>
          {pregunta.sem
            ? <Lista resultados={sim} />
            : <p className="vacio">Esta pregunta no tiene embeddings precalculados. Elige una de las fichas.</p>}
        </section>
      </div>
    </div>
  );
}
