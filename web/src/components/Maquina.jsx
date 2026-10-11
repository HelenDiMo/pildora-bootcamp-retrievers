import { useMaquina } from "../lib/hooks.js";

/**
 * Párrafo que se escribe solo. Una copia invisible del texto completo reserva
 * el tamaño desde el principio, así la caja no crece mientras se escribe.
 * El texto completo está disponible para lectores de pantalla.
 */
export default function Maquina({ texto, activo = true, velocidad = 14 }) {
  const visible = useMaquina(texto, activo, velocidad);
  return (
    <>
      <div className="maquina-caja" aria-hidden="true">
        <pre className="maquina oculto">{texto}</pre>
        <pre className="maquina escrito">{visible}<span className="cursor" /></pre>
      </div>
      <p className="solo-lectores">{texto}</p>
    </>
  );
}
