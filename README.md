# El caso de los Retrievers: Orquestación de flujos con LangChain y LlamaIndex

Píldora extendida del bootcamp de AI & Data Science Engineering (Somos F5).

**Autora:** Elena Díaz - [@HelenDiMo](https://github.com/HelenDiMo)
**Duración:** 60 minutos (incluye el rato de estudio y práctica del alumnado)
**Temática:** Sherlock Holmes. El expediente es el corpus, el retriever es el ayudante que busca pruebas y el LLM es el detective que deduce.
**Presentación:** [pildora-bootcamp-retrievers.vercel.app](https://pildora-bootcamp-retrievers.vercel.app/)

---

## Índice

1. [Objetivos de aprendizaje](#objetivos-de-aprendizaje)
2. [Estructura de la sesión (60 min)](#estructura-de-la-sesión-60-min)
3. [Teoría](#teoría)
4. [Cómo abrir los notebooks](#cómo-abrir-los-notebooks)
5. [Contenido del repositorio](#contenido-del-repositorio)
6. [Recursos para practicar](#recursos-para-practicar)
7. [Pregunta de comprobación](#pregunta-de-comprobación)
8. [Notas y avisos](#notas-y-avisos)

---

Lord Edmund Aldridge ha aparecido muerto en su biblioteca. Holmes tiene un expediente de 11 documentos y necesita un ayudante que encuentre las pruebas adecuadas: ese ayudante es el **retriever**. Durante la sesión, el alumnado compara distintas formas de búsqueda y observa cómo la selección de pruebas condiciona las deducciones del detective.

El caso de Sherlock Holmes sirve de hilo conductor para explicar RAG: el expediente es el corpus, los retrievers recuperan fragmentos relevantes y el LLM razona a partir del contexto recuperado. La misma investigación se explora con LangChain y LlamaIndex.

## Objetivos de aprendizaje

Al terminar la píldora, el alumnado sabrá:

- Explicar qué es un retriever y qué papel tiene dentro de un sistema RAG.
- Crear retrievers básicos en LangChain y en LlamaIndex y ver qué devuelven.
- Diferenciar la búsqueda por similitud (significado) de la búsqueda léxica BM25 (palabras exactas).
- Entender qué hacen `k` y MMR, y por qué importa combinar retrievers (búsqueda híbrida).
- Conectar un retriever a una cadena completa pregunta → retriever → prompt → LLM.

---

## Estructura de la sesión (60 min)

| Bloque                  | Tiempo orientativo | Entregable                                                                  |
| ----------------------- | ------------------ | --------------------------------------------------------------------------- |
| 1. Contextualización    | 0-10 min           | Presentación web: caso, concepto de retriever y demo del tablón interactivo |
| 2. Live coding          | 10-30 min          | Notebook 01: similitud, BM25, MMR, búsqueda híbrida y cadena RAG            |
| 3. Reto de aplicación   | 30-50 min          | Calentamiento en la web y Notebook 02 en parejas                            |
| 4. Code review y cierre | 50-60 min          | Notebook 03: resultados, errores típicos, elección de retrievers y recursos |

La sesión alterna explicación visual, demostración de código y práctica. El caso incluye preguntas diseñadas para mostrar que cada método tiene fortalezas y límites; la solución no es asumir que un único retriever sirve para todo.

---

## Teoría

### 1. La idea base: RAG en 3 pasos

Un LLM no conoce tus documentos. RAG (_Retrieval-Augmented Generation_) lo soluciona en tres pasos:

1. **Indexar:** se trocean los documentos y se guardan de forma que se puedan buscar.
2. **Recuperar:** dada una pregunta, se buscan los trozos más relevantes. **Aquí trabaja el retriever.**
3. **Generar:** se pasan esos trozos al LLM para que responda usándolos.

### 2. ¿Qué es un retriever?

Es una interfaz que recibe una consulta en texto y devuelve una lista de documentos. Es más general que un vector store: no necesita almacenar nada, solo devolver resultados. Cualquier vector store se puede convertir en retriever.

**Con Sherlock:** el retriever es el ayudante que sale a buscar pruebas al expediente. El LLM es Holmes, que solo razona con lo que el ayudante le trae.

**¿Por qué importa?** Si el ayudante trae pruebas equivocadas, Holmes deducirá mal aunque sea un genio. Muchos fallos de un RAG vienen del retriever, no del LLM.

### 3. Tipos de retriever

- **Por similitud (embeddings):** busca por significado. El parámetro `k` decide cuántas pruebas se traen. En LlamaIndex, `similarity_top_k` es un máximo, no una garantía: pueden llegar menos resultados si hay filtros o pocos datos.
- **Léxico (BM25):** busca por palabras exactas. Es muy útil con nombres propios y términos raros (por ejemplo, "Whitcombe", el abogado del caso), donde los embeddings pueden fallar.
- **MMR (_Maximal Marginal Relevance_):** variante de la búsqueda por similitud que penaliza resultados repetidos para traer pruebas más variadas.
- **Híbrido:** combina varios retrievers. En LangChain, `EnsembleRetriever` las combina con Reciprocal Rank Fusion ponderado: mira el puesto de cada documento en cada lista, no su puntuación. En LlamaIndex, `QueryFusionRetriever` fusiona retrievers vectoriales y BM25 con Reciprocal Rerank Fusion.
- **Avanzados (fuera de esta píldora):** multi-query (un LLM reformula la pregunta de varias formas), HyDE (un LLM convierte la pregunta en un documento hipotético que la responde) y rerankers (un segundo modelo reordena los resultados con más cuidado).

### 4. LangChain vs LlamaIndex, lado a lado

|           | LangChain                                          | LlamaIndex                               |
| --------- | -------------------------------------------------- | ---------------------------------------- |
| Crear     | `vectorstore.as_retriever(search_kwargs={"k": 3})` | `index.as_retriever(similarity_top_k=3)` |
| Consultar | `retriever.invoke(pregunta)`                       | `retriever.retrieve(pregunta)`           |
| Devuelve  | lista de `Document`                                | lista de `NodeWithScore`                 |

Diferencias prácticas:

- En LangChain el retriever es un _runnable_, así que encaja directamente en una cadena con `|` (LCEL).
- En LlamaIndex, `retrieve()` devuelve nodos con su metadata y su puntuación de similitud, así que el _score_ se ve sin esfuerzo.

### 5. Ejemplo mínimo de cadena en LangChain (esquema)

```python
# Esquema. La versión completa y probada está en el notebook 01, parte 5
retriever = vectorstore.as_retriever(search_kwargs={"k": 3})

chain = (
    {"context": retriever | format_docs, "question": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)

respuesta = chain.invoke("¿Quién visitó la casa la noche del crimen?")
```

---

## Cómo abrir los notebooks

**En Google Colab (sin instalar nada).** Abre el notebook directamente desde GitHub:

- [01 · Live coding](https://colab.research.google.com/github/HelenDiMo/pildora-bootcamp-retrievers/blob/main/notebooks/01_live_coding.ipynb)
- [02 · Reto](https://colab.research.google.com/github/HelenDiMo/pildora-bootcamp-retrievers/blob/main/notebooks/02_reto_TODO.ipynb)
- [03 · Solución](https://colab.research.google.com/github/HelenDiMo/pildora-bootcamp-retrievers/blob/main/notebooks/03_solucion.ipynb)

La primera celda de código detecta Colab, descarga este repositorio (para tener `src/` y los documentos del caso), instala `requirements-colab.txt` y el modelo de spaCy. Tarda uno o dos minutos. En tu ordenador esa celda no hace nada.

**En tu ordenador.** Con Python 3.11 o superior:

```bash
python -m venv .venv
source .venv/bin/activate        # en Windows: .venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m spacy download es_core_news_md
```

---

## Contenido del repositorio

Materiales de la sesión y código de apoyo:

```text
.
├── README.md
├── requirements.txt               dependencias principales
├── requirements-opcional.txt      integraciones opcionales
├── requirements-lock.txt          versiones fijadas
├── requirements-colab.txt         lo mínimo para Google Colab
├── notebooks/
│   ├── 01_live_coding.ipynb       demostración guiada
│   ├── 02_reto_TODO.ipynb         práctica del alumnado
│   └── 03_solucion.ipynb          solución y puesta en común
├── data/
│   └── expediente/                corpus del caso: 11 documentos
├── scripts/
│   ├── generar_docs.py            generación de documentación
│   └── precompute_scores.py       puntuaciones para la presentación web
├── src/sherlock/                  implementación Python de los retrievers y utilidades
├── tests/                         pruebas automatizadas
└── web/                           presentación interactiva React/Vite
```

### La presentación web

Está publicada en [pildora-bootcamp-retrievers.vercel.app](https://pildora-bootcamp-retrievers.vercel.app/). Se navega con las flechas del teclado y `F` activa la pantalla completa.

- **Tablón del detective:** las pruebas son tarjetas con chinchetas. Al hacer una pregunta, las `k` más relevantes se iluminan y unos hilos rojos las unen a la pregunta. Al hacer clic en una tarjeta se lee entera.
- **Dos detectives:** la misma pregunta con BM25 a un lado y similitud al otro.
- **MMR e híbrido:** controles de variedad y de peso para ver en vivo cómo cambian los resultados.
- **El reto:** cinco pistas para resolver eligiendo retriever; al resolverlas se revela el veredicto con efecto de máquina de escribir y el sello de «CASO RESUELTO».
- **Cierre:** qué retriever usar en cada caso, los notebooks para abrir en Colab o descargar, y recursos.

BM25, MMR y el híbrido se calculan en el navegador. Las puntuaciones de similitud van precalculadas en Python para las preguntas del caso (`scripts/precompute_scores.py`), y la web avisa cuando una pregunta escrita a mano no las tiene. Para comprobar que la web da los mismos resultados que LangChain: `npm run check` dentro de `web/`.

---

## Recursos para practicar

**Vídeos (en inglés)**

- [RAG From Scratch (lista de LangChain)](https://www.youtube.com/playlist?list=PLfaIDFEXuae2LXbO1_PKyVJiQ23ZztA0x): vídeos cortos con notebooks. Empezar por las partes 1 a 4.
- [Notebooks de RAG From Scratch](https://github.com/langchain-ai/rag-from-scratch)
- [Curso completo en freeCodeCamp](https://www.youtube.com/watch?v=sVcwVQRHIc8) (unas 2,5 horas)

**Documentación y práctica**

- [Conceptos de retrievers en LangChain (versión JS)](https://js.langchain.com/docs/concepts/retrievers): los conceptos son los mismos que en Python.
- [Guía de módulos de retrievers de LlamaIndex](https://developers.llamaindex.ai/python/framework/module_guides/querying/retriever/retrievers/)
- [BM25 Retriever en LlamaIndex](https://developers.llamaindex.ai/python/framework/integrations/retrievers/bm25_retriever/)
- [Crear un retriever en LlamaIndex sin API keys](https://www.simplified.guide/llamaindex/retriever-similarity-top-k-set): usa `MockEmbedding`; sirve para ver cómo funciona el código, no para comparar relevancia.

---

## Pregunta de comprobación

Preguntas por **"Whitcombe"** y el retriever por similitud devuelve el telegrama de Lestrade antes que la carta dirigida a Whitcombe. ¿Por qué pasa y qué retriever usarías?

<details><summary>Ver respuesta</summary>

El modelo de embeddings no conoce la palabra "Whitcombe": no tiene significado que comparar y el orden sale casi al azar. BM25 busca la palabra exacta y pone la carta primera. Si la pregunta tiene además una parte de significado (por ejemplo, "Whitcombe y el sabueso"), un retriever híbrido.
</details>

---

## Notas y avisos

- El código se ha probado en octubre de 2026 con las versiones de `requirements-lock.txt`. LangChain y LlamaIndex cambian rápido: si un import falla tras actualizar, usa ese archivo para reproducir el entorno probado. Ejemplo ya vivido: en LangChain 1.x, `EnsembleRetriever` está en `langchain_classic.retrievers`.
- Los vídeos de LangChain son de 2024. Los conceptos siguen siendo válidos, pero algunos imports o nombres pueden haber cambiado.
- Se enlaza la página de conceptos de retrievers de LangChain en su versión JS; los conceptos son los mismos que en Python.
