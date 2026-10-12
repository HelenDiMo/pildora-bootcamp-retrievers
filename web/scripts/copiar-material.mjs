// Copia los notebooks de la sesión a public/material para que la diapositiva de cierre los pueda descargar.
// Se ejecuta solo antes de `npm run dev` y `npm run build`, así la web siempre ofrece la versión actual.
import { copyFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const web = join(dirname(fileURLToPath(import.meta.url)), "..");
const origen = join(web, "..", "notebooks");
const destino = join(web, "public", "material");
mkdirSync(destino, { recursive: true });
for (const nb of ["01_live_coding.ipynb", "02_reto_TODO.ipynb"]) {
  copyFileSync(join(origen, nb), join(destino, nb));
}
console.log("Material copiado en public/material");
