# El caso de los Retrievers

**Orquestación de flujos con LangChain y LlamaIndex: Retrievers**

Píldora extendida del bootcamp de AI & Data Science Engineering (Somos F5).
Autora: Elena Díaz - [@HelenDiMo](https://github.com/HelenDiMo)

**Duración:** 60 minutos (incluye el rato de práctica del alumnado).

Lord Edmund Aldridge ha aparecido muerto en su biblioteca. Holmes tiene un expediente de 11 documentos y necesita un ayudante que sepa **traerle las pruebas correctas**. Ese ayudante es el **retriever**. En esta píldora se aprende a elegir y configurar uno: por similitud, por palabras exactas (BM25), con variedad (MMR) o híbrido, tanto en LangChain como en LlamaIndex.

## Qué incluye

| Entregable | Dónde | Para qué |
|---|---|---|
| Presentación web interactiva | [`web/`](web/) | Contextualización y demos en vivo (tablón del detective con hilos rojos) |
| Notebook de live coding | [`notebooks/01_live_coding.ipynb`](notebooks/01_live_coding.ipynb) | La clase, con las salidas ya ejecutadas |
| Notebook del reto (con TODO) | [`notebooks/02_reto_TODO.ipynb`](notebooks/02_reto_TODO.ipynb) | Lo que resuelve el alumnado |
| Notebook con la solución | [`notebooks/03_solucion.ipynb`](notebooks/03_solucion.ipynb) | Code review y cierre |
| Teoría | [`docs/teoria.md`](docs/teoria.md) (también en `.docx` y `.pdf`) | Material de estudio |
| Guía del formador | [`docs/guia_formador.md`](docs/guia_formador.md) | Plan minuto a minuto, preguntas frecuentes, qué hacer si algo falla |
| El expediente | [`data/expediente/`](data/expediente/) | 11 documentos originales, pensados con «trampas» para cada método |

## Aprendizajes

Al terminar, el alumnado sabrá:

- Explicar qué es un retriever y qué papel tiene dentro de un sistema RAG.
- Crear retrievers en LangChain y en LlamaIndex y ver qué devuelven.
- Diferenciar la búsqueda por similitud (significado) de BM25 (palabras exactas), y saber cuándo falla cada una.
- Entender qué hacen `k` y MMR, y por qué combinar retrievers (búsqueda híbrida con RRF).
- Conectar un retriever a una cadena completa (pregunta, retriever, prompt, LLM).

## Estructura de la sesión

| Min | Bloque | Entregable |
|---|---|---|
| 0-10 | Contextualización | Web (diapositivas 1 a 4) |
| 10-30 | Live coding | Notebook 01 |
| 30-50 | Reto de aplicación | Web (diapositiva 9) y notebook 02 |
| 50-60 | Code review y cierre | Notebook 03 y web (diapositiva 10) |

El detalle está en la [guía del formador](docs/guia_formador.md).

## Puesta en marcha

Hace falta Python 3.11 o superior y Node 18 o superior (solo para la web).

### Python (notebooks y tests)

En PowerShell (Windows):

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m spacy download es_core_news_md
```

En macOS o Linux:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python -m spacy download es_core_news_md
```

Después, abre los notebooks en VS Code o con `jupyter lab`. Para comprobar que todo funciona:

```bash
pytest
```

### Web

```bash
cd web
npm install
npm run dev        # http://localhost:5173
npm run check      # comprueba que la web da lo mismo que los notebooks
```

Más detalles (teclas, qué está precalculado) en [`web/README.md`](web/README.md).

## Opciones

| Variable de entorno | Efecto |
|---|---|
| `EMBEDDINGS_BACKEND` | `spacy` (por defecto), `hf` (Hugging Face) o `fake` (solo prueba que el código corre) |
| `ANTHROPIC_API_KEY` | Si está definida y tienes `langchain-anthropic` instalado, el «detective» de la cadena final es Claude. Si no, es una simulación que solo enumera las pruebas |
| `ANTHROPIC_MODEL` | Modelo que usa el detective (por defecto `claude-sonnet-5-5`) |

Las opciones de Hugging Face y de LLM real necesitan los paquetes de `requirements-opcional.txt`.

## Qué se ha verificado y qué no

**Verificado** (11 de octubre de 2026, Python 3.13, `langchain-core` 1.6.9, `langchain-classic` 1.0.8, `llama-index-core` 0.14.25, spaCy 3.8.16; versiones exactas en `requirements-lock.txt`):

- Los tres notebooks se ejecutan de principio a fin.
- Los 17 tests de Python pasan.
- La web reproduce exactamente los resultados de los retrievers reales de LangChain (7 preguntas × 4 métodos) y su BM25 coincide con `rank_bm25`.

**No verificado:**

- `EMBEDDINGS_BACKEND=hf`: el entorno de construcción no tenía acceso a Hugging Face.
- El detective con un LLM real: no se probó con una clave de API.
- Los embeddings por defecto son vectores de palabras de spaCy promediados. Funcionan sin claves ni descargas grandes, pero con un modelo distinto algunos resultados cambiarán.

LangChain y LlamaIndex cambian rápido. Si un import falla tras actualizar, la causa más probable es un cambio de nombres; usa `requirements-lock.txt` para reproducir el entorno probado. Ejemplo ya vivido: en LangChain 1.x, `EnsembleRetriever` ya no está en `langchain.retrievers`, sino en `langchain_classic.retrievers`.

## Estructura del repositorio

```text
.
├── README.md
├── requirements.txt            dependencias (rangos)
├── requirements-lock.txt       versiones exactas probadas
├── requirements-opcional.txt   Hugging Face y LLM real (sin probar)
├── data/expediente/            los 11 documentos del caso (Markdown con cabecera)
├── notebooks/
│   ├── 01_live_coding.ipynb
│   ├── 02_reto_TODO.ipynb
│   └── 03_solucion.ipynb
├── src/sherlock/               utilidades que usan los notebooks y los scripts
│   ├── expediente.py           carga del expediente (LangChain y LlamaIndex)
│   ├── embeddings.py           backends de embeddings intercambiables
│   ├── retrievers.py           BM25 «con corte» para los dos frameworks
│   ├── reto.py                 las 5 pistas, comprobación y veredicto
│   ├── vista.py                impresión de resultados
│   ├── llm.py                  el detective (Claude o simulado)
│   ├── texto.py                tokenizador de BM25 (igual que en la web)
│   └── preguntas.py            las preguntas del caso
├── scripts/precompute_scores.py   genera el JSON de la web (embeddings y referencia de LangChain)
├── tests/                      17 tests de Python
├── docs/                       teoría (md, docx, pdf) y guía del formador
└── web/                        presentación React + Vite
```

## Regenerar los datos de la web

Si cambias el expediente, las preguntas o el modelo de embeddings, hay que regenerar el JSON que usa la web y volver a comprobarla:

```bash
python scripts/precompute_scores.py
cd web && npm run check
```

## Regenerar la teoría en Word y PDF

`docs/teoria.md` es la fuente. Si la modificas, regenera el `.docx` y el `.pdf` (necesita `pandoc`, LibreOffice y `python-docx`):

```bash
python scripts/generar_docs.py
```

## Créditos

Idea y autoría: Elena Díaz - [@HelenDiMo](https://github.com/HelenDiMo). El expediente, los personajes secundarios y el caso son originales; Sherlock Holmes, el doctor Watson y el inspector Lestrade son personajes de dominio público de Arthur Conan Doyle.
