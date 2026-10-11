"""Preguntas del caso. Las usan los notebooks, el script de precálculo y la web.

Cada pregunta está pensada para enseñar algo distinto:

- "el sabueso": el expediente habla de "lebrel" y "perro", nunca de "sabueso".
  BM25 (palabras exactas) no encuentra nada; los embeddings sí.
- "Whitcombe": un apellido raro. BM25 lo clava; los embeddings no lo conocen.
- "sustancia tóxica": ningún documento usa esas palabras, pero varios hablan
  de belladona, dosis y veneno.
- "¿Quién vio luz en la biblioteca?": tres testimonios casi idénticos. Con
  búsqueda por similitud llegan los tres; MMR busca variedad.
- "Whitcombe y el sabueso": una mitad léxica y otra semántica. Pide un
  retriever híbrido.
"""

PREGUNTAS = [
    {"id": "q-sabueso", "texto": "el sabueso"},
    {"id": "q-whitcombe", "texto": "Whitcombe"},
    {"id": "q-toxica", "texto": "sustancia tóxica"},
    {"id": "q-luz", "texto": "¿Quién vio luz en la biblioteca?"},
    {"id": "q-mixta", "texto": "Whitcombe y el sabueso"},
    {"id": "q-noche", "texto": "¿Dónde pasó la noche Hale?"},
    {"id": "q-casa", "texto": "¿Quién conocía bien la casa?"},
]
