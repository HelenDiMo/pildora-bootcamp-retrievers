/** Sello rojo de «caso resuelto». */
export default function Sello({ texto = "Caso resuelto" }) {
  return (
    <div className="sello" role="img" aria-label={texto}>
      <span>{texto}</span>
    </div>
  );
}
