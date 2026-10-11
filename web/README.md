# Web de la píldora: El caso de los Retrievers

Presentación interactiva (React + Vite) de 10 diapositivas. Autora: Elena Díaz - [@HelenDiMo](https://github.com/HelenDiMo).

## Arrancar

```bash
npm install
npm run dev        # desarrollo: http://localhost:5173
npm run build      # genera la carpeta dist/ (se puede abrir desde cualquier carpeta o subir a GitHub Pages)
npm run check      # comprueba que la web da los mismos resultados que los notebooks
```

## Cómo manejarla

| Tecla | Acción |
|---|---|
| `→` / `AvPág` | Siguiente diapositiva |
| `←` / `RePág` | Anterior |
| `Inicio` / `Fin` | Primera / última |
| `F` | Pantalla completa |

También funcionan los puntos de abajo, y la URL guarda la diapositiva (`#/4` es el tablón).

## Qué es real y qué está precalculado

* **BM25, MMR e híbrido (RRF) se calculan en vivo** en el navegador (`src/lib/retrieval.js`), con los mismos algoritmos que LangChain.
* **Los embeddings NO se calculan en la web**: vienen precalculados en `src/data/expediente.json` para las 7 preguntas del caso. Con una pregunta nueva, BM25 funciona pero la similitud, MMR y el híbrido avisan de que no tienen datos.
* Para regenerar ese JSON (por ejemplo, si cambias el expediente o el modelo de embeddings), desde la raíz del repositorio:

```bash
python scripts/precompute_scores.py
```

## `npm run check`

Comprueba tres cosas y falla si algo no coincide:

1. El BM25 de JavaScript da las mismas puntuaciones que `rank_bm25` de Python.
2. Similitud, BM25, MMR e híbrido dan los mismos documentos que los **retrievers reales de LangChain** (guardados en el JSON).
3. Las reglas del reto de la web dan la misma tabla de aciertos que el notebook de solución.

## Estructura

```text
src/
├── App.jsx            marco de la presentación, teclado y navegación
├── motor.js           crea el motor de búsqueda con los datos
├── lib/
│   ├── retrieval.js   similitud, BM25, MMR, híbrido (RRF)
│   ├── bm25.js        BM25Okapi igual que rank_bm25
│   ├── tokenizar.js   mismo tokenizador que Python
│   ├── reto.js        las 5 pistas y sus reglas
│   └── hooks.js
├── components/        Tablon, Carta, Lista, Selector, Codigo, Maquina, Sello
├── slides/            una diapositiva por archivo
├── styles/
└── data/expediente.json   expediente + puntuaciones precalculadas
```

## Accesibilidad

Se respeta `prefers-reduced-motion` (sin barrido de lupa ni animaciones), hay foco visible, y el veredicto se anuncia como texto completo a lectores de pantalla. En pantallas táctiles la lupa de la portada se desactiva y el título se ve completo.
