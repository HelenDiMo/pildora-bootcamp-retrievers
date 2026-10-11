import { giroDe } from "../lib/hooks.js";

/** Una prueba del expediente, como ficha de papel clavada en el tablón. */
export default function Carta({ doc, puesto, puntos, estado, onAbrir, cartaRef }) {
  const clase = ["carta", onAbrir && "abrible", estado === "encendida" && "encendida", estado === "apagada" && "apagada"]
    .filter(Boolean)
    .join(" ");
  return (
    <article
      ref={cartaRef}
      className={clase}
      style={{ "--giro": `${giroDe(doc.id)}deg` }}
      tabIndex={0}
      role={onAbrir ? "button" : undefined}
      aria-label={`${doc.titulo}${puesto ? `, puesto ${puesto}` : ""}${onAbrir ? ". Pulsa Intro para leerla entera" : ""}`}
      onClick={onAbrir ? () => onAbrir(doc) : undefined}
      onKeyDown={onAbrir ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onAbrir(doc); } } : undefined}
      data-id={doc.id}
    >
      <span className="chincheta" aria-hidden="true" />
      {puesto ? <span className="puesto" aria-hidden="true">{puesto}</span> : null}
      <h4>{doc.titulo}</h4>
      <p className="meta">{doc.fecha}</p>
      <p className="texto">{doc.texto}</p>
      {puntos != null ? <span className="puntos">{puntos}</span> : null}
    </article>
  );
}
