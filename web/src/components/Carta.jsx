import { giroDe } from "../lib/hooks.js";

/** Una prueba del expediente, como ficha de papel clavada en el tablón. */
export default function Carta({ doc, puesto, puntos, estado, onVer, cartaRef }) {
  const clase = ["carta", estado === "encendida" && "encendida", estado === "apagada" && "apagada"]
    .filter(Boolean)
    .join(" ");
  return (
    <article
      ref={cartaRef}
      className={clase}
      style={{ "--giro": `${giroDe(doc.id)}deg` }}
      tabIndex={0}
      aria-label={`${doc.titulo}${puesto ? `, puesto ${puesto}` : ""}`}
      onMouseEnter={() => onVer?.(doc)}
      onFocus={() => onVer?.(doc)}
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
