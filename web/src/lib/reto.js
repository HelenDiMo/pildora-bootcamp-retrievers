// Las cinco pistas del reto (mismas reglas que src/sherlock/reto.py).

const TESTIMONIOS_DE_LUZ = ["cocinera", "doncella", "cochero"];

export const PISTAS = [
  { clave: "P1", titulo: "El veneno", pregunta: "sustancia tóxica",
    enunciado: "Alguien compró la sustancia, pero ningún documento la llama así." },
  { clave: "P2", titulo: "El móvil", pregunta: "Whitcombe",
    enunciado: "Un apellido raro. La carta tiene que salir la primera." },
  { clave: "P3", titulo: "Los testigos repetidos", pregunta: "¿Quién vio luz en la biblioteca?",
    enunciado: "Tres testimonios casi iguales. No quiero gastar mis tres resultados en repetir lo mismo." },
  { clave: "P4", titulo: "El perro que no ladró", pregunta: "Whitcombe y el sabueso",
    enunciado: "Una mitad es un apellido raro y la otra un concepto. Hacen falta la carta y el jardinero." },
  { clave: "P5", titulo: "La coartada rota", pregunta: "¿Dónde pasó la noche Hale?",
    enunciado: "Hay que traer a la vez el registro del club y el telegrama." },
];

const tiene = (lista, ...ids) => ids.every((id) => lista.includes(id));

/** ¿Resuelve esta lista de ids la pista? Devuelve { ok, ayuda }. */
export function evaluarPista(clave, encontrados) {
  const top3 = encontrados.slice(0, 3);
  switch (clave) {
    case "P1": {
      const ok = top3.includes("botica");
      return { ok, ayuda: "Falta el recibo de la botica: ninguna palabra de la pregunta aparece en él. Hace falta buscar por significado." };
    }
    case "P2": {
      const ok = encontrados[0] === "carta";
      return { ok, ayuda: "La carta no sale la primera. Los embeddings no conocen «Whitcombe»: hace falta buscar la palabra exacta." };
    }
    case "P3": {
      const repetidos = TESTIMONIOS_DE_LUZ.filter((id) => encontrados.includes(id));
      const ok = encontrados.length === 3 && repetidos.length <= 1;
      return { ok, ayuda: `Salen ${repetidos.length} testimonios casi idénticos. Hace falta un método que penalice lo repetido.` };
    }
    case "P4": {
      const ok = tiene(top3, "carta", "jardinero");
      return { ok, ayuda: "Una mitad pide palabras exactas y la otra significado. Hace falta combinar los dos tipos de búsqueda." };
    }
    case "P5": {
      const ok = tiene(top3, "club", "telegrama");
      return { ok, ayuda: "Falta alguna de las dos pruebas entre las tres primeras." };
    }
    default:
      throw new Error(`Pista desconocida: ${clave}`);
  }
}
