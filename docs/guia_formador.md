# Guía del formador

Plan minuto a minuto de la píldora de 60 minutos (incluye el rato de práctica del alumnado). Autora: Elena Díaz - @HelenDiMo.

## Antes de la sesión (el día anterior)

- [ ] Instalar el entorno y comprobar que todo arranca (ver el README, apartado «Puesta en marcha»).
- [ ] `pytest` en la raíz: deben pasar los 17 tests.
- [ ] `npm run check` dentro de `web/`: debe decir «Todo coincide ✓».
- [ ] Abrir `notebooks/01_live_coding.ipynb` y ejecutarlo entero (Run All). Si algún import falla, es un cambio de versión: se arregla antes de la sesión, no durante.
- [ ] Probar la web en el proyector real (`npm run build` y abrir `dist/index.html`, o `npm run dev`). Pulsar `F` para pantalla completa. Si el proyector es de 720p, comprobar que el tablón (diapositiva 4) cabe entero.
- [ ] Decidir si el detective será Claude o la simulación. Con clave: definir `ANTHROPIC_API_KEY` e instalar `langchain-anthropic`. Sin clave funciona igual, pero «el detective» solo enumera las pruebas. Esa opción con clave **no se ha probado** al preparar el material.
- [ ] Dejar `02_reto_TODO.ipynb` sin ejecutar (los TODO vacíos son lo que verá el alumnado) y **no compartir** `03_solucion.ipynb` hasta el bloque 4.

## Plan de la sesión

| Min | Bloque | Qué se usa |
|---|---|---|
| 0-10 | 1. Contextualización | Web, diapositivas 1 a 4 |
| 10-30 | 2. Live coding | Notebook 01 (con las diapositivas 5 a 8 como apoyo) |
| 30-50 | 3. Reto de aplicación | Web, diapositiva 9 (calentamiento) + notebook 02 |
| 50-60 | 4. Code review y cierre | Notebook 03 + web, diapositiva 10 |

### Bloque 1 · Contextualización (10 min)

| Min | Diapositiva | Qué decir |
|---|---|---|
| 0-1 | 1. Portada | Dejar que la lupa barra el título. Presentarse. |
| 1-4 | 2. El caso | El crimen en una frase. «Holmes no puede leerlo todo cada vez»: ese ayudante es el retriever. Señalar el paso 2 de RAG. |
| 4-7 | 3. Qué es un retriever | La idea en una frase: *una pregunta entra, salen pruebas*. Si trae las pruebas equivocadas, Holmes se equivoca. |
| 7-10 | 4. El tablón | Demo guiada: pregunta «Whitcombe y el sabueso» con **Híbrido**, luego cambiar a **Similitud** y **BM25** y ver cómo cambian los hilos. Mover `k`. |

### Bloque 2 · Live coding (20 min)

Se sigue el notebook 01, parte por parte. Entre paréntesis, la diapositiva que se puede enseñar 1 minuto antes de cada parte para fijar la idea.

| Min | Parte | Mensaje clave |
|---|---|---|
| 10-12 | 0. Preparación y expediente | Ejecutar la celda de preparación (ya lanzada de antemano). Enseñar los 11 documentos. |
| 12-17 | 1. Similitud | «el sabueso» no aparece en ningún documento y aun así sale el jardinero. Enseñar la tabla LangChain frente a LlamaIndex (diapositiva 8, pestaña Similitud). Jugar con `k`. |
| 17-21 | 2. BM25 (diapositiva 5) | «Whitcombe» y «el sabueso» con los dos métodos: cada uno falla donde el otro acierta. **El relleno de BM25**: devuelve 3 documentos con puntuación 0. |
| 21-24 | 3. MMR (diapositiva 6) | Tres testigos que dicen lo mismo. Cambiar `lambda_mult`. |
| 24-28 | 4. Híbrido (diapositiva 7) | RRF a mano con la función `rrf`. Avisar del import `langchain_classic` y de que devuelve más de `k`. |
| 28-30 | 5. Cadena completa | Cadena con `\|`. «Mira qué contexto recibió antes de culpar al LLM». |

**Si vas con retraso**, se puede cortar sin perder el hilo: «¿Y si quiero hacer mi propio retriever?» (parte 2), el MMR de LlamaIndex (parte 3), los pesos del final de la parte 4 y la parte 5 entera (se menciona de palabra).

### Bloque 3 · Reto (20 min)

| Min | Qué | Notas |
|---|---|---|
| 30-33 | Diapositiva 9 en el proyector | Todos a la vez, sin código: elegir qué retriever resuelve cada pista. Es el calentamiento. Al resolver las cinco aparece el veredicto. |
| 33-50 | Notebook 02 | Parejas. Primero la Parte A (4 retrievers), luego la Parte B (5 pistas). `comprobar()` da pistas si fallan. El bonus de LlamaIndex es para quien termine antes. |

Qué esperar:

- **P3 (MMR)** es la que más se atasca: casi siempre es porque `lambda_mult` es demasiado alto. Con 1.0 es idéntico a la similitud.
- **P5** se resuelve con el híbrido por defecto; si falla, mirar que los pesos sumen 1 y que `retriever_hibrido` use `retriever_bm25` y `retriever_sim`.
- Quien tenga un `None` sin sustituir verá «todavía no has completado el TODO»: es el comportamiento normal.
- El veredicto (`veredicto()`) solo se revela con las cinco pistas resueltas.

### Bloque 4 · Code review y cierre (10 min)

| Min | Qué | Notas |
|---|---|---|
| 50-54 | Notebook 03: tabla de aciertos | Qué retriever acierta qué. **Ningún retriever vale para todo**: el híbrido saca 4/5 y falla justo en lo que resuelve MMR. Recordar que son preguntas trampa y no una medida general. |
| 54-57 | Errores típicos | Repasar la tabla del notebook. Insistir en dos: mirar el contexto antes de culpar al LLM, y no comparar puntuaciones entre métodos. |
| 57-60 | Diapositiva 10 | «Qué retriever uso cuando» y recursos. Pregunta de comprobación (está en el notebook 03). |

## Preguntas frecuentes del alumnado

**¿Por qué «Whitcombe» a veces trae la carta con la similitud?**
Porque las puntuaciones son ruido. Mira los números: ~0.08 frente a ~0.46 de una pregunta con sentido. Si aparece la carta, es casualidad, y además el telegrama sale antes.

**¿Por qué BM25 devuelve documentos con «el sabueso» si no hay ninguna coincidencia?**
Porque el BM25 de serie siempre devuelve `k` resultados. Por eso en el repositorio hay un BM25 «con corte».

**¿Por qué el MMR de LlamaIndex da resultados distintos al de LangChain?**
Porque solo compara cada candidato con el último elegido, no con todos. Es un detalle de implementación de LlamaIndex.

**¿Esto funciona con documentos reales?**
Sí, pero con documentos largos hay que trocearlos primero (`RecursiveCharacterTextSplitter` en LangChain, `SentenceSplitter` en LlamaIndex) y con muchas más preguntas de prueba antes de fiarse.

**¿Y los embeddings de verdad?**
Aquí se usan vectores de palabras de spaCy para que todo funcione sin claves ni descargas grandes. Un modelo como `paraphrase-multilingual-MiniLM-L12-v2` (opción `EMBEDDINGS_BACKEND=hf`) entiende mejor las frases, pero esa opción no se ha probado.

## Si algo falla durante la sesión

| Síntoma | Causa probable | Arreglo |
|---|---|---|
| `Falta el modelo de spaCy` | No se descargó el modelo | `python -m spacy download es_core_news_md` |
| `ModuleNotFoundError` con `EnsembleRetriever` | Import antiguo | `from langchain_classic.retrievers import EnsembleRetriever` |
| `ModuleNotFoundError: sherlock` | El notebook no está en `notebooks/` | Abrirlo desde la carpeta `notebooks/` o desde la raíz |
| Pantalla de la web desbordada | Proyector de baja resolución | Zoom del navegador al 80 % (`Ctrl` y `-`) |
| La lupa de la portada no aparece | Pantalla táctil o «reducir movimiento» activado | Es intencionado: el título se ve completo |
