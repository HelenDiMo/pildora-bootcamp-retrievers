import Tablon from "../components/Tablon.jsx";

export default function TablonSlide({ texto, setTexto }) {
  return (
    <div className="diapositiva denso entra">
      <header>
        <h2>El tablón del detective</h2>
        <p>Cambia el retriever, la pregunta o k. Los hilos rojos unen la pregunta con las pruebas que el retriever trae.</p>
      </header>
      <Tablon texto={texto} setTexto={setTexto} />
    </div>
  );
}
