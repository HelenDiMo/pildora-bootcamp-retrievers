"""Las cinco pistas del reto y la comprobación de las respuestas.

El alumnado pasa a `comprobar` lo que devuelve su retriever y recibe un
✅ / ❌ con una pista. Cuando resuelve las cinco, `veredicto()` revela el caso.
"""

from __future__ import annotations

from .vista import ids

TESTIMONIOS_DE_LUZ = {"cocinera", "doncella", "cochero"}

PISTAS = {
    "P1": {
        "titulo": "El veneno",
        "pregunta": "sustancia tóxica",
        "necesita": "Trae el recibo de la botica (dónde se compró el veneno).",
    },
    "P2": {
        "titulo": "El móvil",
        "pregunta": "Whitcombe",
        "necesita": "La carta al abogado tiene que ser el PRIMER resultado.",
    },
    "P3": {
        "titulo": "Los testigos repetidos",
        "pregunta": "¿Quién vio luz en la biblioteca?",
        "necesita": "3 resultados, con como mucho 1 de los 3 testimonios de la luz.",
    },
    "P4": {
        "titulo": "El perro que no ladró",
        "pregunta": "Whitcombe y el sabueso",
        "necesita": "La carta Y el testimonio del jardinero, entre los 3 primeros.",
    },
    "P5": {
        "titulo": "La coartada rota",
        "pregunta": "¿Dónde pasó la noche Hale?",
        "necesita": "El registro del club Y el telegrama, entre los 3 primeros.",
    },
}

_resueltas: set[str] = set()


def evaluar(clave: str, encontrados: list[str]) -> tuple[bool, str]:
    top3 = encontrados[:3]
    if clave == "P1":
        ok = "botica" in top3
        return ok, "" if ok else (
            "Falta el recibo de la botica. Ninguna palabra de la pregunta aparece "
            "en él: ¿qué retriever busca por significado y no por palabras?"
        )
    if clave == "P2":
        ok = bool(encontrados) and encontrados[0] == "carta"
        return ok, "" if ok else (
            "La carta no es lo primero. 'Whitcombe' es un apellido raro que los "
            "embeddings no conocen: ¿qué retriever busca palabras exactas?"
        )
    if clave == "P3":
        repetidos = TESTIMONIOS_DE_LUZ & set(encontrados)
        ok = len(encontrados) == 3 and len(repetidos) <= 1
        return ok, "" if ok else (
            f"Salen {len(repetidos)} testimonios casi idénticos ({sorted(repetidos)}). "
            "Pide variedad: ¿qué tipo de búsqueda penaliza lo repetido?"
        )
    if clave == "P4":
        faltan = {"carta", "jardinero"} - set(top3)
        ok = not faltan
        return ok, "" if ok else (
            f"Faltan {sorted(faltan)}. La pregunta tiene una mitad de palabras "
            "exactas y otra de significado: ¿qué retriever combina las dos?"
        )
    if clave == "P5":
        faltan = {"club", "telegrama"} - set(top3)
        ok = not faltan
        return ok, "" if ok else (
            f"Faltan {sorted(faltan)}. Mira los pesos de tu híbrido o el valor de k."
        )
    raise KeyError(f"Pista desconocida: {clave}")


def comprobar(clave: str, resultado) -> bool:
    """Comprueba la respuesta a una pista. Devuelve True si está resuelta."""
    pista = PISTAS[clave]
    cabecera = f"{clave} · {pista['titulo']}"
    if resultado is None:
        print(f"⏳ {cabecera}: todavía no has completado el TODO.")
        return False
    encontrados = ids(resultado)
    ok, ayuda = evaluar(clave, encontrados)
    print(f"{'✅' if ok else '❌'} {cabecera}  →  {encontrados}")
    if ok:
        _resueltas.add(clave)
    else:
        _resueltas.discard(clave)
        print(f"   Pista: {ayuda}")
        print(f"   Objetivo: {pista['necesita']}")
    return ok


def progreso() -> None:
    marcas = " ".join(f"{k}{'✅' if k in _resueltas else '⬜'}" for k in PISTAS)
    print(f"Progreso del caso: {len(_resueltas)}/{len(PISTAS)}   {marcas}")


def veredicto() -> None:
    """Revela el desenlace cuando las cinco pistas están resueltas."""
    progreso()
    if len(_resueltas) < len(PISTAS):
        faltan = [k for k in PISTAS if k not in _resueltas]
        print(f"\n🔒 El veredicto sigue sellado. Te faltan: {', '.join(faltan)}")
        return
    print(
        """
╔══════════════════════════════════════════════════════════════════╗
║                         C A S O   R E S U E L T O                ║
╚══════════════════════════════════════════════════════════════════╝

 El culpable es el secretario, R. Hale.

  · MÓVIL     Lord Aldridge había descubierto que falsificaba las cuentas y
              iba a cambiar su testamento (la carta a Whitcombe).
  · MEDIOS    Hale compró diez gramos de belladona cinco días antes (recibo del 9/11).
  · ACCESO    Alguien que el perro conocía y que sabía la rutina de la casa
              envenenó la licorera (jardinero y diario de Watson).
  · COARTADA  Dijo que pasó la noche en el club, pero el registro prueba que
              salió a las 20:45 hacia Marlowe Hall (telegrama vs. club), y el
              mayordomo lo vio salir pálido del despacho tras discutir a gritos.

 Ningún LLM ha sido necesario para resolver el caso: solo traer las pruebas
 correctas. Esa es la lección de los retrievers.
"""
    )
