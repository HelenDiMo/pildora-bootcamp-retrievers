import { useEffect, useRef, useState } from "react";
import { useMenosMovimiento } from "../lib/hooks.js";
import Carta from "../components/Carta.jsx";
import { motor } from "../motor.js";

const TITULO = "El caso de los Retrievers";

/** Portada: el título está entre la niebla y una lupa lo revela. Al llegar, la lupa barre el título una vez. */
export default function Portada() {
  const ref = useRef(null);
  const menos = useMenosMovimiento();
  const [tactil] = useState(() => window.matchMedia("(pointer: coarse)").matches);
  const sinLupa = menos || tactil;
  const [pos, setPos] = useState({ x: -400, y: -400 });
  const manual = useRef(false);
  const titulo = useRef(null);

  useEffect(() => {
    if (sinLupa) return;
    // El barrido recorre el título de verdad: de su esquina izquierda a la derecha.
    const marco = ref.current.getBoundingClientRect();
    const t = titulo.current.querySelector(".nitido").getBoundingClientRect();
    const izq = t.left - marco.left, ancho = t.width, arriba = t.top - marco.top, alto = t.height;
    const t0 = performance.now();
    let id;
    const barrer = (t) => {
      if (manual.current) return;
      const f = Math.min(1, (t - t0) / 2600);
      const suave = f < 0.5 ? 2 * f * f : 1 - Math.pow(-2 * f + 2, 2) / 2;
      setPos({ x: izq + ancho * (0.02 + 0.96 * suave), y: arriba + alto * (0.5 + 0.34 * Math.sin(f * Math.PI * 3)) });
      if (f < 1) id = requestAnimationFrame(barrer);
    };
    id = requestAnimationFrame(barrer);
    return () => cancelAnimationFrame(id);
  }, [sinLupa]);

  const mover = (e) => {
    if (sinLupa) return;
    manual.current = true;
    const r = ref.current.getBoundingClientRect();
    setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
  };

  return (
    <div className="diapositiva entra">
      <div ref={ref} className={`portada ${sinLupa ? "sin-lupa" : ""}`} onPointerMove={mover}
           style={{ "--x": `${pos.x}px`, "--y": `${pos.y}px` }}>
        <h1 className="solo-lectores">{TITULO}</h1>
        <div className="capas" ref={titulo} aria-hidden="true">
          <h1 className="borroso">{TITULO}</h1>
          <h1 className="nitido">{TITULO}</h1>
        </div>
        <p className="sub">Orquestación de flujos con LangChain y LlamaIndex: cómo buscar las pruebas correctas.</p>
        <p className="firma">Elena Díaz - @HelenDiMo</p>
        <div className="abanico" aria-hidden="true">
          {["carta", "jardinero", "club"].map((id, n) => (
            <Carta key={id} doc={motor.docs[motor.indiceDe[id]]} />
          ))}
        </div>
        {!sinLupa && (
          <svg className="lupa" viewBox="0 0 250 250" aria-hidden="true">
            <circle cx="105" cy="105" r="78" fill="rgba(232,223,194,0.05)" stroke="#c49a45" strokeWidth="9" />
            <circle cx="105" cy="105" r="70" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="2" />
            <path d="M162 162 L228 228" stroke="#6b4a1e" strokeWidth="18" strokeLinecap="round" />
            <path d="M162 162 L190 190" stroke="#c49a45" strokeWidth="11" strokeLinecap="round" />
          </svg>
        )}
      </div>
    </div>
  );
}
