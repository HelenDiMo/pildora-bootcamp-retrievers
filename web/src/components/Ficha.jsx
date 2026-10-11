import { useEffect, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { giroDe } from "../lib/hooks.js";

const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const fechaLarga = (iso) => {
  const [a, m, d] = iso.split("-").map(Number);
  return `${d} de ${MESES[m - 1]} de ${a}`;
};

/** Una prueba ampliada: hoja de papel con el texto entero escrito a mano. Se cierra con Esc, con la X o pulsando fuera. */
export default function Ficha({ doc, puesto, puntos, k, onCerrar }) {
  const botonRef = useRef(null);
  const papelRef = useRef(null);
  const cerrarRef = useRef(onCerrar);
  cerrarRef.current = onCerrar;

  // La hoja se adapta al texto: primero se ensancha y, si aún no cabe, la letra se reduce. Nunca hay scroll.
  useLayoutEffect(() => {
    const ajustar = () => {
      const papel = papelRef.current;
      if (!papel) return;
      const cabe = () => papel.offsetHeight <= window.innerHeight * 0.9; // offsetHeight ignora el giro y el zoom de la animación
      papel.style.setProperty("--escala", "1");
      for (const ancho of [46, 54, 62, 70]) {
        papel.style.setProperty("--ancho", `${ancho}rem`);
        if (cabe()) return;
      }
      for (let esc = 0.96; esc >= 0.4; esc -= 0.04) {
        papel.style.setProperty("--escala", esc.toFixed(2));
        if (cabe()) return;
      }
    };
    ajustar();
    document.fonts?.load('20px "La Belle Aurore"').then(ajustar);
    window.addEventListener("resize", ajustar);
    return () => window.removeEventListener("resize", ajustar);
  }, [doc]);

  useEffect(() => {
    const previo = document.activeElement;
    botonRef.current?.focus();
    const alTeclear = (e) => {
      if (e.key === "Escape") { e.stopPropagation(); cerrarRef.current(); }
      else if (e.key === "Tab") { e.preventDefault(); botonRef.current?.focus(); }
      // las flechas no deben cambiar de diapositiva por detrás de la hoja
      else if (["ArrowLeft", "ArrowRight", "PageUp", "PageDown", "Home", "End"].includes(e.key)) e.stopPropagation();
    };
    window.addEventListener("keydown", alTeclear, true);
    return () => { window.removeEventListener("keydown", alTeclear, true); previo?.focus?.(); };
  }, []);

  return createPortal(
    <div className="ficha-fondo" onClick={(e) => { if (e.target === e.currentTarget) onCerrar(); }}>
      <article ref={papelRef} className="ficha-papel" role="dialog" aria-modal="true" aria-labelledby="ficha-titulo"
               style={{ "--giro": `${giroDe(doc.id) * 0.5 - 0.6}deg` }}>
        <span className="chincheta" aria-hidden="true" />
        {puesto ? (
          <div className="sello-puesto" aria-label={`Puesto ${puesto}`}>
            <b>Puesto {puesto}</b>
            {puntos != null ? <span>puntuación {puntos}</span> : null}
          </div>
        ) : (
          <div className="sello-puesto fuera" aria-label={`Fuera de las ${k} pruebas`}>
            <b>Se queda fuera</b>
            <span>con k = {k}</span>
          </div>
        )}
        <h3 id="ficha-titulo">{doc.titulo}</h3>
        <p className="quien">{doc.autor}, {fechaLarga(doc.fecha)}</p>
        <p className="cuerpo">{doc.texto}</p>
      </article>
      <button ref={botonRef} className="ficha-cerrar" aria-label="Cerrar la prueba" onClick={onCerrar}>×</button>
    </div>,
    document.body
  );
}
