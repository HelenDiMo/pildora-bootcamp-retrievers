"""Carga del expediente del caso (los documentos de data/expediente)."""

from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]
RUTA_EXPEDIENTE = RAIZ / "data" / "expediente"


def _leer_documento(ruta: Path) -> dict:
    """Lee un .md con cabecera tipo '---\\nclave: valor\\n---\\ntexto'."""
    contenido = ruta.read_text(encoding="utf-8")
    _, cabecera, cuerpo = contenido.split("---", 2)
    meta = {}
    for linea in cabecera.strip().splitlines():
        clave, valor = linea.split(":", 1)
        meta[clave.strip()] = valor.strip()
    meta["texto"] = cuerpo.strip()
    meta["archivo"] = ruta.name
    return meta


def cargar_expediente(ruta: Path | str | None = None) -> list[dict]:
    """Devuelve la lista de documentos del expediente, ordenados por archivo."""
    carpeta = Path(ruta) if ruta else RUTA_EXPEDIENTE
    return [_leer_documento(p) for p in sorted(carpeta.glob("*.md"))]


def a_documentos_langchain(expediente: list[dict]):
    """Convierte el expediente en objetos Document de LangChain."""
    from langchain_core.documents import Document

    return [
        Document(
            page_content=d["texto"],
            metadata={k: v for k, v in d.items() if k != "texto"},
        )
        for d in expediente
    ]


def a_documentos_llamaindex(expediente: list[dict]):
    """Convierte el expediente en objetos Document de LlamaIndex."""
    from llama_index.core import Document

    # Por defecto LlamaIndex mete los metadatos (título, autor...) dentro del
    # texto que se convierte en embedding y que indexa BM25. Los excluimos para
    # que solo cuente el texto del documento (igual que en LangChain y en la web).
    documentos = []
    for d in expediente:
        metadatos = {k: v for k, v in d.items() if k != "texto"}
        documentos.append(
            Document(
                text=d["texto"],
                metadata=metadatos,
                doc_id=d["id"],
                excluded_embed_metadata_keys=list(metadatos),
            )
        )
    return documentos
