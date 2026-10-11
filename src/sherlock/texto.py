"""Tokenización sencilla para BM25 (búsqueda por palabras exactas).

Mismo criterio en Python y en la web (web/src/lib/bm25.js), para que los
resultados de BM25 coincidan en los dos sitios:

1. minúsculas
2. sin tildes (la ñ se conserva)
3. solo letras y números
4. se descartan las palabras vacías (artículos, preposiciones...)
"""

import re
import unicodedata

PALABRAS_VACIAS = frozenset(
    """
    a al algo ante aquel aquella aqui asi aun aunque bajo cada como con contra
    cual cuando de del desde donde dos el ella ellas ello ellos en entre era
    eran es esa esas ese eso esos esta estaba estaban estado estan este esto
    estos fue fueron ha habia han hasta hay la las le les lo los mas me mi mis
    muy na ni no nos nosotros o os otra otras otro otros para pero poco por
    porque que quien quienes se sea segun ser si sin sobre son su sus tambien
    te tenia tras tu tus un una unas uno unos usted y ya yo
    """.split()
)


def quitar_tildes(texto: str) -> str:
    """Quita las tildes pero conserva la ñ."""
    texto = texto.replace("ñ", "\u0001").replace("Ñ", "\u0002")
    descompuesto = unicodedata.normalize("NFD", texto)
    sin_marcas = "".join(c for c in descompuesto if unicodedata.category(c) != "Mn")
    return sin_marcas.replace("\u0001", "ñ").replace("\u0002", "Ñ")


def tokenizar(texto: str) -> list[str]:
    """Convierte un texto en una lista de palabras limpias para BM25."""
    texto = quitar_tildes(texto.lower())
    palabras = re.findall(r"[a-z0-9ñ]+", texto)
    return [p for p in palabras if p not in PALABRAS_VACIAS]
