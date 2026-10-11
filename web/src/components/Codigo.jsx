import Prism from "prismjs";
import "prismjs/components/prism-python";

/** Bloque de código con colores de lámpara de gas. */
export default function Codigo({ codigo, titulo }) {
  const html = Prism.highlight(codigo.trim(), Prism.languages.python, "python");
  return (
    <figure className="codigo">
      {titulo ? <figcaption>{titulo}</figcaption> : null}
      <pre><code dangerouslySetInnerHTML={{ __html: html }} /></pre>
    </figure>
  );
}
