# El caso de los Retrievers: Orquestación de flujos con LangChain y LlamaIndex

Píldora extendida del bootcamp de AI & Data Science Engineering (Somos F5).

**Autora:** Elena Díaz - [@HelenDiMo](https://github.com/HelenDiMo)
**Duración:** 60 minutos (incluye el rato de estudio y práctica del alumnado)
**Temática:** Sherlock Holmes. El expediente es el corpus, el retriever es el ayudante que busca pruebas y el LLM es el detective que deduce.

> Estado: borrador inicial. Los apartados marcados con **(pendiente)** se completarán en las próximas iteraciones.

---

## Índice

1. [Objetivos de aprendizaje](#objetivos-de-aprendizaje)
2. [Estructura de la sesión (60 min)](#estructura-de-la-sesión-60-min)
3. [Teoría](#teoría)
4. [Contenido del repositorio](#contenido-del-repositorio)
5. [Recursos para practicar](#recursos-para-practicar)
6. [Pregunta de comprobación](#pregunta-de-comprobación)
7. [Notas y avisos](#notas-y-avisos)

---

## Objetivos de aprendizaje

Al terminar la píldora, el alumnado sabrá:

- Explicar qué es un retriever y qué papel tiene dentro de un sistema RAG.
- Crear retrievers básicos en LangChain y en LlamaIndex y ver qué devuelven.
- Diferenciar la búsqueda por similitud (significado) de la búsqueda léxica BM25 (palabras exactas).
- Entender qué hacen `k` y MMR, y por qué importa combinar retrievers (búsqueda híbrida).
- Conectar un retriever a una cadena completa pregunta → retriever → prompt → LLM.

---

## Estructura de la sesión (60 min)

| Bloque | Tiempo orientativo | Entregable |
|---|---|---|
| 1. Contextualización | 10 min | Presentación web (Sherlock) |
| 2. Live coding | 20 min | Notebook docente |
| 3. Reto de aplicación | 20 min | Notebook TODO (el alumnado practica) |
| 4. Code review y cierre | 10 min | Notebook con solución + puesta en común |

Los tiempos son una propuesta y se ajustarán tras probar la sesión completa. **(pendiente)**

---

## Teoría

### 1. La idea base: RAG en 3 pasos

Un LLM no conoce tus documentos. RAG (*Retrieval-Augmented Generation*) lo soluciona en tres pasos:

1. **Indexar:** se trocean los documentos y se guardan de forma que se puedan buscar.
2. **Recuperar:** dada una pregunta, se buscan los trozos más relevantes. **Aquí trabaja el retriever.**
3. **Generar:** se pasan esos trozos al LLM para que responda usándolos.

### 2. ¿Qué es un retriever?

Es una interfaz que recibe una consulta en texto y devuelve una lista de documentos. Es más general que un vector store: no necesita almacenar nada, solo devolver resultados. Cualquier vector store se puede convertir en retriever.

**Con Sherlock:** el retriever es el ayudante que sale a buscar pruebas al expediente. El LLM es Holmes, que solo razona con lo que el ayudante le trae.

**¿Por qué importa?** Si el ayudante trae pruebas equivocadas, Holmes deducirá mal aunque sea un genio. Muchos fallos de un RAG vienen del retriever, no del LLM.

### 3. Tipos de retriever

- **Por similitud (embeddings):** busca por significado. El parámetro `k` decide cuántas pruebas se traen. En LlamaIndex, `similarity_top_k` es un máximo, no una garantía: pueden llegar menos resultados si hay filtros o pocos datos.
- **Léxico (BM25):** busca por palabras exactas. Es muy útil con nombres propios y términos raros (por ejemplo, "Baskerville"), donde los embeddings pueden fallar.
- **MMR (*Maximal Marginal Relevance*):** variante de la búsqueda por similitud que penaliza resultados repetidos para traer pruebas más variadas.
- **Híbrido:** combina varios retrievers. En LangChain, el ensemble retriever los combina con puntuaciones ponderadas. En LlamaIndex, `QueryFusionRetriever` fusiona retrievers vectoriales y BM25 con Reciprocal Rerank Fusion.
- **Avanzados (fuera de esta píldora):** multi-query (reformular la pregunta) y HyDE (un LLM convierte la pregunta en un documento hipotético que la responde).

### 4. LangChain vs LlamaIndex, lado a lado

| | LangChain | LlamaIndex |
|---|---|---|
| Crear | `vectorstore.as_retriever(search_kwargs={"k": 3})` | `index.as_retriever(similarity_top_k=3)` |
| Consultar | `retriever.invoke(pregunta)` | `retriever.retrieve(pregunta)` |
| Devuelve | lista de `Document` | lista de `NodeWithScore` |

Diferencias prácticas:

- En LangChain el retriever es un *runnable*, así que encaja directamente en una cadena con `|` (LCEL).
- En LlamaIndex, `retrieve()` devuelve nodos con su metadata y su puntuación de similitud, así que el *score* se ve sin esfuerzo.

### 5. Ejemplo mínimo de cadena en LangChain (esquema)

````python
# ESQUEMA orientativo: verificar imports y nombres contra la versión instalada
retriever = vectorstore.as_retriever(search_kwargs={"k": 3})

chain = (
    {"context": retriever | format_docs, "question": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)

respuesta = chain.invoke("¿Quién visitó la casa la noche del crimen?")
````

---

## Contenido del repositorio

Estructura prevista (se irá completando):

````text
.
├── README.md                      <- este archivo
├── notebooks/
│   ├── 01_live_coding.ipynb       (pendiente)
│   ├── 02_reto_TODO.ipynb         (pendiente)
│   └── 03_solucion.ipynb          (pendiente)
├── data/
│   └── expediente/                corpus de pistas (6-8 documentos cortos)  (pendiente)
├── docs/
│   └── teoria.pdf                 (pendiente)
└── web/                           presentación React/Vite con tablón del detective  (pendiente)
````

### Ideas para la presentación web

- **Tablón del detective:** pistas como tarjetas con chinchetas. Al hacer una pregunta, las `k` pruebas más relevantes se iluminan y unos hilos rojos animados las unen a la pregunta, con su puntuación.
- **Modo "dos detectives":** misma pregunta, BM25 a un lado y embeddings al otro.
- **Slider de `k`** para ver en vivo cómo se encienden y apagan las pistas.
- **Lupa y niebla de Londres** en la portada.
- **Veredicto final** con efecto de máquina de escribir y sello de "CASO RESUELTO".
- **Nota técnica:** BM25 puede calcularse en vivo en el navegador; las puntuaciones semánticas irán precalculadas desde el notebook real y se indicará claramente en la presentación.

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

Le preguntas al sistema por "el sabueso" y el retriever por similitud trae pruebas sobre perros en general, pero ninguna del caso Baskerville. ¿Qué retriever probarías para arreglarlo y por qué?

---

## Notas y avisos

- Los vídeos de LangChain son de 2024 y ambos frameworks cambian rápido. Los conceptos siguen siendo válidos, pero algunos imports o nombres pueden haber cambiado. **Antes de la sesión hay que verificar todo el código contra las versiones actuales.**
- No se ha localizado un vídeo en español que pueda recomendarse con confianza. **(pendiente)**
- La página de conceptos de retrievers de LangChain en Python no se pudo comprobar durante la búsqueda; se enlaza la versión JS.
