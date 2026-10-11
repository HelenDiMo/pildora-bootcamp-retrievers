import { useCallback, useEffect, useState } from "react";
import Portada from "./slides/1-Portada.jsx";
import Autora from "./components/Autora.jsx";
import Caso from "./slides/Caso.jsx";
import QueEs from "./slides/QueEs.jsx";
import TablonSlide from "./slides/TablonSlide.jsx";
import DosDetectives from "./slides/DosDetectives.jsx";
import MMRSlide from "./slides/MMRSlide.jsx";
import Hibrido from "./slides/Hibrido.jsx";
import CodigoSlide from "./slides/CodigoSlide.jsx";
import Reto from "./slides/Reto.jsx";
import Cierre from "./slides/Cierre.jsx";

// Cada diapositiva con pregunta guarda la suya y arranca con una pregunta que enseña algo.
function ConPregunta({ inicial, children }) {
  const [texto, setTexto] = useState(inicial);
  return children(texto, setTexto);
}

const DIAPOSITIVAS = [
  { nombre: "Portada", ver: () => <Portada /> },
  { nombre: "El caso", ver: () => <Caso /> },
  { nombre: "Qué es un retriever", ver: () => <QueEs /> },
  { nombre: "El tablón del detective", ver: () => (
    <ConPregunta inicial="Whitcombe y el sabueso">{(t, s) => <TablonSlide texto={t} setTexto={s} />}</ConPregunta>) },
  { nombre: "Dos detectives", ver: () => (
    <ConPregunta inicial="el sabueso">{(t, s) => <DosDetectives texto={t} setTexto={s} />}</ConPregunta>) },
  { nombre: "MMR", ver: () => (
    <ConPregunta inicial="¿Quién vio luz en la biblioteca?">{(t, s) => <MMRSlide texto={t} setTexto={s} />}</ConPregunta>) },
  { nombre: "Híbrido", ver: () => (
    <ConPregunta inicial="Whitcombe y el sabueso">{(t, s) => <Hibrido texto={t} setTexto={s} />}</ConPregunta>) },
  { nombre: "Código", ver: () => <CodigoSlide /> },
  { nombre: "El reto", ver: () => <Reto /> },
  { nombre: "Cierre", ver: () => <Cierre /> },
];

const desdeHash = () => {
  const n = parseInt(window.location.hash.replace("#/", ""), 10);
  return Number.isInteger(n) ? Math.min(Math.max(n - 1, 0), DIAPOSITIVAS.length - 1) : 0;
};

export default function App() {
  const [actual, setActual] = useState(desdeHash);

  const ir = useCallback((n) => {
    const destino = Math.min(Math.max(n, 0), DIAPOSITIVAS.length - 1);
    setActual(destino);
    window.history.replaceState(null, "", `#/${destino + 1}`);
  }, []);

  useEffect(() => {
    const alTeclear = (e) => {
      const enCampo = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName);
      if (enCampo || e.metaKey || e.ctrlKey || e.altKey) return;
      if (["ArrowRight", "PageDown"].includes(e.key)) { e.preventDefault(); ir(actual + 1); }
      else if (["ArrowLeft", "PageUp"].includes(e.key)) { e.preventDefault(); ir(actual - 1); }
      else if (e.key === "Home") ir(0);
      else if (e.key === "End") ir(DIAPOSITIVAS.length - 1);
      else if (e.key === "f" || e.key === "F") {
        if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen?.();
      }
    };
    const alCambiarHash = () => setActual(desdeHash());
    window.addEventListener("keydown", alTeclear);
    window.addEventListener("hashchange", alCambiarHash);
    return () => { window.removeEventListener("keydown", alTeclear); window.removeEventListener("hashchange", alCambiarHash); };
  }, [actual, ir]);

  useEffect(() => { document.title = `${DIAPOSITIVAS[actual].nombre} · El caso de los Retrievers`; }, [actual]);

  return (
    <div className="deck">
      <main className="escena" key={actual}>{DIAPOSITIVAS[actual].ver()}</main>
      <footer className="pie">
        <Autora className="autora" />
        <nav aria-label="Diapositivas">
          <button className="flecha" onClick={() => ir(actual - 1)} disabled={actual === 0} aria-label="Anterior">‹</button>
          {DIAPOSITIVAS.map((d, n) => (
            <button key={d.nombre} className="punto" aria-current={n === actual} aria-label={`${n + 1}. ${d.nombre}`} title={d.nombre} onClick={() => ir(n)} />
          ))}
          <button className="flecha" onClick={() => ir(actual + 1)} disabled={actual === DIAPOSITIVAS.length - 1} aria-label="Siguiente">›</button>
        </nav>
      </footer>
    </div>
  );
}
