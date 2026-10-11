import Carta from "./Carta.jsx";
import { motor } from "../motor.js";

/** Lista vertical de pruebas ordenadas, con barra de puntuación. */
export default function Lista({ resultados, formato = (p) => p.toFixed(2), marcar = {}, vacio }) {
  if (!resultados.length) return <p className="vacio">{vacio ?? "No ha devuelto ninguna prueba."}</p>;
  const maximo = Math.max(...resultados.map((r) => Math.abs(r.p)), 1e-9);
  return (
    <ol className="lista">
      {resultados.map((r, n) => {
        const doc = motor.docs[r.i];
        const extra = marcar[doc.id];
        return (
          <li key={doc.id}>
            <article className={`carta ${extra === "nueva" ? "nueva" : ""} ${extra === "sale" ? "sale" : ""}`}>
              <span className="puesto" aria-hidden="true">{n + 1}</span>
              <h4>
                {doc.titulo}
                {extra === "nueva" ? <span className="etiqueta-cambio">entra</span> : null}
                {extra === "sale" ? <span className="etiqueta-cambio">sale</span> : null}
              </h4>
              <p className="texto">{doc.texto}</p>
              <div className="barra" aria-hidden="true"><i style={{ width: `${Math.max(4, (Math.abs(r.p) / maximo) * 100)}%` }} /></div>
              <p className="meta" style={{ marginTop: "0.25rem", marginBottom: 0 }}>puntuación {formato(r.p)}</p>
            </article>
          </li>
        );
      })}
    </ol>
  );
}
