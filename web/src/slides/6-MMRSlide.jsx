import { useMemo, useState } from "react";
import Selector from "../components/Selector.jsx";
import Lista from "../components/Lista.jsx";
import { motor } from "../motor.js";

export default function MMRSlide({ texto, setTexto }) {
  const [variedad, setVariedad] = useState(0.5);
  const pregunta = useMemo(() => motor.resolverPregunta(texto), [texto]);
  const lambda = 1 - variedad;
  const sim = motor.buscar("similitud", pregunta);
  const mmr = motor.buscar("mmr", pregunta, { lambda });
  const idsSim = new Set(sim.map((r) => motor.docs[r.i].id));
  const idsMmr = new Set(mmr.map((r) => motor.docs[r.i].id));
  const marcasSim = Object.fromEntries([...idsSim].filter((id) => !idsMmr.has(id)).map((id) => [id, "sale"]));
  const marcasMmr = Object.fromEntries([...idsMmr].filter((id) => !idsSim.has(id)).map((id) => [id, "nueva"]));
  const antes = motor.parecidoMedio(sim.map((r) => r.i));
  const despues = motor.parecidoMedio(mmr.map((r) => r.i));

  return (
    <div className="diapositiva entra">
      <header>
        <h2>Tres testigos que dicen lo mismo</h2>
        <p>Con la similitud, los tres primeros resultados pueden ser casi idénticos. MMR se salta los que repiten lo ya elegido.</p>
      </header>
      <div className="fila-controles">
        <Selector valor={texto} onCambio={setTexto} />
        <label className="control">
          variedad
          <input type="range" min="0" max="1" step="0.1" value={variedad} onChange={(e) => setVariedad(+e.target.value)} />
          <output>{variedad.toFixed(1)}</output>
        </label>
      </div>
      {pregunta.sem && (
        <p className="aviso" role="status">
          Parecido medio entre las pruebas elegidas: {antes.toFixed(2)} con similitud, {despues.toFixed(2)} con MMR.
          {variedad === 0 ? " Con variedad 0, MMR es igual que la similitud." : ""}
        </p>
      )}
      <div className="columnas">
        <section className="columna">
          <h3>Similitud</h3>
          <p className="quien">Las {motor.P.k} pruebas más parecidas a la pregunta.</p>
          {pregunta.sem ? <Lista resultados={sim} marcar={marcasSim} /> : <p className="vacio">Elige una de las fichas.</p>}
        </section>
        <section className="columna">
          <h3>MMR</h3>
          <p className="quien">Mismas {motor.P.k} plazas, pero cada nueva prueba debe aportar algo distinto.</p>
          {pregunta.sem ? <Lista resultados={mmr} marcar={marcasMmr} /> : <p className="vacio">Elige una de las fichas.</p>}
        </section>
      </div>
    </div>
  );
}
