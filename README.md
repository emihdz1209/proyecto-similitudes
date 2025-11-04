# Proyecto: Búsqueda de Similitudes entre Textos

## Arquitectura

```
Frontend (React + Vite + Tailwind) <-> Backend (Node.js + Express) <-> WebAssembly (C++ / Emscripten)
```

Este sistema compara textos literarios aplicando cuatro algoritmos de similitud, integrando un flujo completo de C++ compilado a WebAssembly, ejecutado desde un backend en Node.js y visualizado mediante un frontend en React.

---

## Estructura del Proyecto

```
proyecto-similitudes/
├── cpp/                    # Código C++ y compilación a WASM
│   ├── original/           # Implementaciones base
│   ├── wasm/               # Versión adaptada para WebAssembly
│   └── tests/              # Pruebas unitarias y benchmarks
├── backend/                # Servidor Node.js + Express
│   ├── src/                # Código fuente del servidor
│   ├── wasm/               # Módulos WASM compilados (.wasm / .mjs)
│   └── uploads/            # Archivos temporales
├── frontend/               # Aplicación React
│   ├── src/                # Código fuente de la interfaz
│   │   ├── pages/
│   │   │   └── HomePage.jsx          # Selector de algoritmos y configuración
│   │   └── components/
│   │       └── ComparisonResults.jsx # Resultados comparativos 2x2
│   └── public/             # Archivos estáticos
├── data/                   # Textos de prueba
└── docs/                   # Documentación técnica y académica
```

---

## Requisitos Previos

- Node.js v16 o superior
- npm o yarn
- Emscripten SDK configurado (`emsdk_env.ps1`)
- Git

---

## Instalación

1. **Backend**

   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Frontend**

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. Acceder en el navegador  
   [http://localhost:5173](http://localhost:5173)

---

## Compilación de C++ a WebAssembly

1. Copiar el archivo actualizado:

   ```powershell
   Copy-Item text_comparison_wasm_enhanced.cpp cpp/wasm/
   ```

2. Activar entorno Emscripten:

   ```powershell
   C:\Users\<usuario>\emsdk\emsdk_env.ps1
   ```

3. Compilar el módulo:

   ```powershell
   emcc text_comparison_wasm_enhanced.cpp -o wasm_output/text_comparison.mjs [opciones...]
   ```

4. Copiar el resultado al backend:
   ```powershell
   Copy-Item wasm_output\* ..\..\backend\wasm\ -Force
   ```

---

## Etapas del Proyecto

| Etapa | Descripción                                    | Estado     |
| ----- | ---------------------------------------------- | ---------- |
| 1     | Selección de textos                            | Completada |
| 2     | Preprocesamiento                               | Completada |
| 3     | Longest Common Substring (LCSstr)              | Completada |
| 4     | Longest Common Subsequence (LCSseq)            | Completada |
| 5     | Algoritmos alternativos (Levenshtein, Jaccard) | Completada |
| 6     | Comparación de resultados                      | Completada |

---

## Algoritmos Implementados

| Algoritmo          | Paradigma             | Color UI               | Complejidad | Descripción                                                         |
| ------------------ | --------------------- | ---------------------- | ----------- | ------------------------------------------------------------------- |
| LCS Substring      | Programación dinámica | Azul (`blue-600`)      | O(n·m)      | Busca la cadena continua más larga compartida entre textos.         |
| LCS Subsequence    | Programación dinámica | Morado (`purple-600`)  | O(n·m)      | Busca la subsecuencia común más larga (no necesariamente continua). |
| Levenshtein        | Distancia de edición  | Verde (`green-600`)    | O(n·m)      | Mide las operaciones necesarias para convertir un texto en otro.    |
| Jaccard (n-gramas) | Teoría de conjuntos   | Naranja (`orange-600`) | O(n)        | Compara conjuntos de fragmentos (n-gramas) para medir coincidencia. |

---

## Configuración Recomendada

Configuración óptima para textos largos (novelas):

```
Chunk Size:      5,000 caracteres
N-grama:         5 palabras
Max Length:      10,000 caracteres
Algoritmos:      Todos activos (4/4)
```

Esta configuración ofrece un balance ideal entre rendimiento y precisión.

---

## Solución de Problemas

| Problema                | Causa Común                        | Solución                                                     |
| ----------------------- | ---------------------------------- | ------------------------------------------------------------ |
| “Función no disponible” | No se compiló el C++ actualizado   | Recompilar y copiar los archivos `.wasm` y `.mjs` al backend |
| Componente no renderiza | Archivos JSX desactualizados       | Verificar imports y estructura en `frontend/src`             |
| Resultados vacíos       | Configuración o textos incorrectos | Usar parámetros recomendados y revisar los logs              |

---

## Documentación Relacionada

- `INSTRUCCIONES_COMPILACION.md` – Guía paso a paso y troubleshooting
- `RESUMEN_TECNICO.md` – Complejidad, análisis y referencias académicas
- `docs/` – Entregables complementarios

---

## Tecnologías Utilizadas

- **Frontend:** React + Vite + Tailwind
- **Backend:** Node.js + Express + Multer
- **Core algorítmico:** C++ compilado a WebAssembly (Emscripten)
- **Testing:** Jest (backend) y Vitest (frontend)
- **Visualización:** Gráficas comparativas, métricas y panel interpretativo

---

## Autor y Estado

**Autor:** emili  
**Fecha:** Noviembre 2025  
**Última actualización:** 4 de noviembre de 2025  
**Estado:** Listo para producción
