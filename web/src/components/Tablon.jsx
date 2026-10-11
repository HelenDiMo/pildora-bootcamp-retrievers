import { useLayoutEffect, useMemo, useRef, useState } from "react";
import Carta from "./Carta.jsx";
import Ficha from "./Ficha.jsx";
import Selector from "./Selector.jsx";
import { motor } from "../motor.js";
import { NOMBRE_METODO, FRASE_METODO } from "../lib/hooks.js";

const METODOS = ["similitud", "bm25", "mmr", "hibrido"];

/** El tablón del detective: la pregunta se une con hilos rojos a las pruebas que trae el retriever. */
export default function Tablon({ texto, setTexto }) {
  const [metodo, setMetodo] = useState("hibrido");
  const [k, setK] = useState(motor.P.k);
  const [lambda, setLambda] = useState(motor.P.mmrLambda);
  const [peso, setPeso] = useState(motor.P.pesosHibrido[0]);
  const [abierta, setAbierta] = useState(null);
  const [hilos, setHilos] = useState([]);

  const corchoRef = useRef(null);
  const notaRef = useRef(null);
  const nudoRef = useRef(null);
  const cartas = useRef({});

  const pregunta = useMemo(() => motor.resolverPregunta(texto), [texto]);
  const resultados = useMemo(
    () => motor.buscar(metodo, pregunta, { k, lambda, peso }),
    [metodo, pregunta, k, lambda, peso]
  );
  const puestoDe = useMemo(() => Object.fromEntries(resultados.map((r, n) => [r.i, n + 1])), [resultados]);
  const puntosDe = useMemo(() => Object.fromEntries(resultados.map((r) => [r.i, r.p])), [resultados]);
  const formato = (p) => (metodo === "hibrido" ? p.toFixed(4) : p.toFixed(2));

  let aviso = null;
  if (!pregunta.sem && metodo !== "bm25")
    aviso = "Los embeddings no se calculan en el navegador. Elige una de las preguntas del caso para ver este método, o prueba BM25 con tu texto.";
  else if (metodo === "bm25" && !resultados.length)
    aviso = "Ninguna palabra de la pregunta aparece en el expediente. BM25 con corte no devuelve nada en lugar de rellenar con pruebas sin relación.";
  else if ((metodo === "similitud" || metodo === "mmr") && pregunta.desconocidas?.length)
    aviso = `El modelo no conoce «${pregunta.desconocidas.join("», «")}»: los nombres propios raros no tienen significado para él. Sin nada que comparar, el orden sale casi al azar. Para buscar una palabra exacta, mejor BM25.`;

  // Los hilos salen de la chincheta de la nota y llegan a la de cada carta iluminada.
  const claveResultados = resultados.map((r) => r.i).join(",");
  useLayoutEffect(() => {
    const calcular = () => {
      const corcho = corchoRef.current, nudo = nudoRef.current;
      if (!corcho || !nudo) return;
      const base = corcho.getBoundingClientRect();
      const n = nudo.getBoundingClientRect();
      const x0 = n.left + n.width / 2 - base.left;
      const y0 = n.top + n.height / 2 - base.top;
      const nuevos = resultados.map((r) => {
        const el = cartas.current[r.i];
        if (!el) return null;
        const c = el.getBoundingClientRect();
        // la carta puede estar girada y escalada: usamos su centro superior
        const x1 = c.left + c.width / 2 - base.left;
        const y1 = c.top - base.top + 2;
        const caida = 8 + Math.abs(x1 - x0) * 0.04;
        return { id: motor.docs[r.i].id, d: `M ${x0} ${y0} Q ${(x0 + x1) / 2} ${Math.max(y0, y1) + caida} ${x1} ${y1}` };
      });
      setHilos(nuevos.filter(Boolean));
    };
    calcular();
    const ro = new ResizeObserver(calcular);
    ro.observe(corchoRef.current);
    return () => ro.disconnect();
  }, [claveResultados, texto, metodo]);

  return (
    <div className="tablon">
      <div className="fila-controles">
        <div className="pestanas" role="tablist" aria-label="Retriever">
          {METODOS.map((m) => (
            <button key={m} role="tab" className="pestana" aria-selected={metodo === m} onClick={() => setMetodo(m)}>
              {NOMBRE_METODO[m]}
            </button>
          ))}
        </div>
        <label className="control">
          k
          <input type="range" min="1" max="6" value={k} onChange={(e) => setK(+e.target.value)} />
          <output>{k}</output>
        </label>
        {metodo === "mmr" && (
          <label className="control">
            variedad
            <input type="range" min="0" max="1" step="0.1" value={1 - lambda} onChange={(e) => setLambda(1 - +e.target.value)} />
            <output>{(1 - lambda).toFixed(1)}</output>
          </label>
        )}
        {metodo === "hibrido" && (
          <label className="control">
            peso de BM25
            <input type="range" min="0" max="1" step="0.1" value={peso} onChange={(e) => setPeso(+e.target.value)} />
            <output>{peso.toFixed(1)}</output>
          </label>
        )}
        <input
          className="escribe" type="text" value={texto} onChange={(e) => setTexto(e.target.value)}
          aria-label="Escribe tu propia pregunta" placeholder="…o escribe tu pregunta"
        />
      </div>
      <p className="explica">{FRASE_METODO[metodo]}</p>
      <Selector valor={texto} onCambio={setTexto} />
      {aviso ? <p className="aviso aviso-ancho" role="status">{aviso}</p> : null}

      <div className="corcho" ref={corchoRef}>
        <div className="nota-pregunta" ref={notaRef}>
          <span className="chincheta" aria-hidden="true" />
          «{texto || "…"}»
          <span className="nudo" ref={nudoRef} aria-hidden="true" />
        </div>
        <svg className="hilos" aria-hidden="true">
          {hilos.map((h) => (
            <path key={`${h.id}-${metodo}-${texto}-${k}`} className="hilo" d={h.d} pathLength="1" />
          ))}
        </svg>
        <div className="rejilla">
          {motor.docs.map((doc, i) => {
            const dentro = i in puestoDe;
            return (
              <Carta
                key={doc.id}
                doc={doc}
                puesto={dentro ? puestoDe[i] : null}
                puntos={dentro ? formato(puntosDe[i]) : null}
                estado={resultados.length ? (dentro ? "encendida" : "apagada") : "apagada"}
                onAbrir={setAbierta}
                cartaRef={(el) => (cartas.current[i] = el)}
              />
            );
          })}
          <p className="pista-clic">Haz clic en una prueba para leerla entera.</p>
        </div>
      </div>
      {abierta ? (
        <Ficha
          doc={abierta}
          puesto={abierta && motor.indiceDe[abierta.id] in puestoDe ? puestoDe[motor.indiceDe[abierta.id]] : null}
          puntos={abierta && motor.indiceDe[abierta.id] in puntosDe ? formato(puntosDe[motor.indiceDe[abierta.id]]) : null}
          k={k}
          onCerrar={() => setAbierta(null)}
        />
      ) : null}
    </div>
  );
}
