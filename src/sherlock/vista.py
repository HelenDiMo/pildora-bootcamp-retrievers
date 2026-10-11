"""Funciones para ver bonito lo que devuelve un retriever.

Funcionan con los resultados de LangChain (Document, o la tupla (Document,
puntuación)) y con los de LlamaIndex (NodeWithScore).
"""

from __future__ import annotations


def _desempaquetar(item):
    """Devuelve (metadatos, texto, puntuación o None) de cualquier resultado."""
    puntuacion = None
    if isinstance(item, tuple):  # (Document, score) de LangChain
        item, puntuacion = item
    if hasattr(item, "node"):  # NodeWithScore de LlamaIndex
        puntuacion = item.score if puntuacion is None else puntuacion
        return item.node.metadata, item.node.get_content(), puntuacion
    metadatos = getattr(item, "metadata", {})
    if puntuacion is None:
        puntuacion = metadatos.get("score")  # el BM25ConCorte la guarda aquí
    return metadatos, item.page_content, puntuacion


def ids(resultado) -> list[str]:
    """Lista con el id de cada documento devuelto (para comparar de un vistazo)."""
    return [_desempaquetar(r)[0]["id"] for r in resultado]


def mostrar(resultado, titulo: str | None = None, ancho: int = 78, puntuaciones: bool = True) -> None:
    """Imprime los documentos recuperados, uno por línea, con su puntuación.

    Pon `puntuaciones=False` con retrievers híbridos: ahí las puntuaciones de
    cada método no se pueden comparar y mostrarlas confunde.
    """
    if titulo:
        print(titulo)
    if not len(resultado):
        print("   (no ha devuelto ningún documento)")
        return
    for posicion, item in enumerate(resultado, start=1):
        meta, texto, puntuacion = _desempaquetar(item)
        mostrar_numero = puntuaciones and isinstance(puntuacion, (int, float))
        marca = f"{puntuacion:7.3f}" if mostrar_numero else "      -"
        resumen = " ".join(texto.split())
        resumen = resumen if len(resumen) <= ancho else resumen[: ancho - 1] + "…"
        print(f"  {posicion}. [{meta['id']:<10}] puntuación {marca} | {resumen}")
