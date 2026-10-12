import { useEffect, useRef, useState } from "react";
import Maquina from "../components/Maquina.jsx";
import Sello from "../components/Sello.jsx";
import { motor } from "../motor.js";
import { PISTAS, evaluarPista } from "../lib/reto.js";
import { NOMBRE_METODO, useMenosMovimiento } from "../lib/hooks.js";

const VEREDICTO = `El culpable es el secretario, R. Hale.

Móvil. Lord Aldridge había descubierto que falsificaba las cuentas e iba a cambiar su testamento (la carta a Whitcombe).

Medios. Hale compró diez gramos de belladona cinco días antes (recibo del 9 de noviembre).

Acceso. Quien envenenó la licorera era alguien a quien el perro conocía y que sabía la rutina de la casa (el jardinero y el diario de Watson).

Coartada. Dijo que pasó la noche en el club, pero el registro prueba que salió a las 20:45 hacia Marlowe Hall (telegrama contra club), y el mayordomo lo vio salir pálido del despacho tras discutir a gritos.

Ningún LLM ha hecho falta: solo traer las pruebas correctas.`;

export default function Reto() {
  const [intentos, setIntentos] = useState({});
  const resueltas = PISTAS.filter((p) => intentos[p.clave]?.ok).length;
  const completo = resueltas === PISTAS.length;
  const veredictoRef = useRef(null);
  const menos = useMenosMovimiento();

  // Al resolver la última pista, llevamos la vista al veredicto para que nadie se lo pierda.
  useEffect(() => {
    if (!completo) return;
    const id = setTimeout(() => veredictoRef.current?.scrollIntoView({ behavior: menos ? "auto" : "smooth", block: "end" }), 350);
    return () => clearTimeout(id);
  }, [completo, menos]);

  const probar = (pista, metodo) => {
    const q = motor.resolverPregunta(pista.pregunta);
    const encontrados = motor.buscar(metodo, q).map((r) => motor.docs[r.i].id);
    const { ok, ayuda } = evaluarPista(pista.clave, encontrados);
    setIntentos((a) => ({ ...a, [pista.clave]: { metodo, ok, ayuda, encontrados } }));
  };

  return (
    <div className="diapositiva entra">
      <header>
        <h2>Cinco pistas, cuatro retrievers</h2>
        <p>Para cada pista, elige el retriever que trae las pruebas que faltan. Al resolver las cinco se revela el caso. Después, hazlo con código en el notebook del reto.</p>
      </header>
      <p className="aviso" role="status">Pistas resueltas: {resueltas} de {PISTAS.length}</p>
      <ul className="pistas">
        {PISTAS.map((p) => {
          const r = intentos[p.clave];
          return (
            <li key={p.clave} className={`pista ${r?.ok ? "resuelta" : ""}`}>
              <div>
                <h3>{p.titulo}{r?.ok ? <span className="hecho" aria-label="resuelta">✓</span> : null}</h3>
                <p className="pregunta">«{p.pregunta}»</p>
                <p className="enunciado">{p.enunciado}</p>
              </div>
              <div>
                <div className="pestanas" role="group" aria-label={`Retriever para ${p.titulo}`}>
                  {Object.keys(NOMBRE_METODO).map((m) => (
                    <button key={m} className="ficha" aria-pressed={r?.metodo === m} onClick={() => probar(p, m)}>{NOMBRE_METODO[m]}</button>
                  ))}
                </div>
                {r ? (
                  <p className={`respuesta ${r.ok ? "bien" : "mal"}`}>
                    {r.ok ? "Resuelta. " : `${r.ayuda} `}
                    Trae: {r.encontrados.length ? r.encontrados.slice(0, 3).join(", ") : "nada"}.
                  </p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
      {completo && (
        <section className="veredicto" aria-label="Veredicto" ref={veredictoRef}>
          <Sello />
          <Maquina texto={VEREDICTO} />
        </section>
      )}
    </div>
  );
}
