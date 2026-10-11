import { motor } from "../motor.js";

/** Fichas con las preguntas del caso (las que tienen embeddings precalculados). */
export default function Selector({ valor, onCambio, preguntas = motor.preguntas, etiqueta = "Pregunta del caso" }) {
  return (
    <div role="group" aria-label={etiqueta} className="pestanas">
      {preguntas.map((p) => (
        <button key={p.id} className="ficha" aria-pressed={valor === p.texto} onClick={() => onCambio(p.texto)}>
          {p.texto}
        </button>
      ))}
    </div>
  );
}
