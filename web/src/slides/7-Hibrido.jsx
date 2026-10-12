import { useMemo, useState } from "react";
import Selector from "../components/Selector.jsx";
import { motor } from "../motor.js";

function Columna({ titulo, quien, filas, pesoTexto }) {
  return (
    <section className="columna">
      <h3>{titulo}</h3>
      <p className="quien">{quien}</p>
      {filas.length ? (
        <ol className="fusion">
          {filas.map((f, n) => (
            <li key={f.id}>
              <span className="n">{n + 1}</span>
              <span className="nom">{f.titulo}</span>
              <span className="pts">+{f.pts.toFixed(4)}</span>
            </li>
          ))}
        </ol>
      ) : <p className="vacio">{pesoTexto}</p>}
    </section>
  );
}

export default function Hibrido({ texto, setTexto }) {
  const [peso, setPeso] = useState(motor.P.pesosHibrido[0]);
  const pregunta = useMemo(() => motor.resolverPregunta(texto), [texto]);
  const { listaBM25, listaSim, pesos, fusion } = motor.hibrido(pregunta, motor.P.k, peso);
  const c = motor.P.rrfC;
  const conPuntos = (lista, w) => lista.map((r, n) => ({ id: motor.docs[r.i].id, titulo: motor.docs[r.i].titulo, pts: w / (n + 1 + c) }));

  return (
    <div className="diapositiva entra">
      <header>
        <h2>Lo mejor de los dos mundos</h2>
        <p>El híbrido no suma puntuaciones, porque las de BM25 y las de similitud no son comparables. Solo mira en qué puesto queda cada prueba en cada lista.</p>
      </header>
      <div className="fila-controles">
        <Selector valor={texto} onCambio={setTexto} />
        <label className="control">
          peso de BM25
          <input type="range" min="0" max="1" step="0.1" value={peso} onChange={(e) => setPeso(+e.target.value)} />
          <output>{peso.toFixed(1)}</output>
        </label>
      </div>
      <p className="formula">cada lista da  peso / (puesto + {c})  a cada prueba, y se suman</p>
      <div className="columnas tres">
        <Columna titulo="BM25" quien={`Peso ${pesos[0].toFixed(1)}`} filas={conPuntos(listaBM25, pesos[0])}
                 pesoTexto="No encuentra ninguna palabra en común." />
        <Columna titulo="Similitud" quien={`Peso ${pesos[1].toFixed(1)}`} filas={conPuntos(listaSim, pesos[1])}
                 pesoTexto="Esta pregunta no tiene embeddings precalculados." />
        <section className="columna">
          <h3>Resultado</h3>
          <p className="quien">Se queda con las {motor.P.k} primeras: el retriever híbrido devuelve más y hay que cortar.</p>
          {fusion.length ? (
            <ol className="fusion">
              {fusion.map((f, n) => (
                <li key={f.i} className={n < motor.P.k ? "entra-top" : "fuera"}>
                  <span className="n">{n + 1}</span>
                  <span className="nom">{motor.docs[f.i].titulo}</span>
                  <span className="pts">{f.p.toFixed(4)}</span>
                </li>
              ))}
            </ol>
          ) : <p className="vacio">Sin resultados.</p>}
        </section>
      </div>
    </div>
  );
}
