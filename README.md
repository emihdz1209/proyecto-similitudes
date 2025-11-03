# Proyecto: Busqueda de Similitudes entre Textos

## Arquitectura

```
Frontend (React) <-> Backend (Node.js + Express) <-> WebAssembly (C++)
```

## Estructura del Proyecto

```
proyecto-similitudes/
├── cpp/                    # Codigo C++ y compilacion WASM
│   ├── original/          # Codigo C++ original de clase
│   ├── wasm/             # Adaptacion para WebAssembly
│   └── tests/            # Tests unitarios
├── backend/               # Servidor Node.js + Express
│   ├── src/              # Codigo fuente
│   ├── wasm/             # Modulos WASM compilados
│   └── uploads/          # Archivos temporales
├── frontend/              # Aplicacion React
│   ├── src/              # Codigo fuente React
│   └── public/           # Archivos estaticos
├── data/                  # Textos de prueba
└── docs/                  # Documentacion del proyecto
```

## Requisitos Previos

- Node.js (v16 o superior)
- npm o yarn
- Emscripten SDK (para compilar C++ a WASM)
- Git

## Instalacion

Ver instrucciones detalladas en cada directorio:
- Backend: `backend/README.md`
- Frontend: `frontend/README.md`
- C++/WASM: `cpp/README.md`

## Inicio Rapido

1. **Backend**:
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Frontend** (en otra terminal):
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. Acceder a: http://localhost:5173

## Etapas del Proyecto

- [OK] Etapa 1: Seleccion de textos
- [OK] Etapa 2: Preprocesamiento
- [ ] Etapa 3: Longest Common Substring
- [ ] Etapa 4: Longest Common Subsequence
- [ ] Etapa 5: Algoritmos alternativos
- [ ] Etapa 6: Comparacion de resultados

## Tecnologias

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express + Multer
- **Algoritmos**: C++ compilado a WebAssembly
- **Testing**: Jest (backend), Vitest (frontend)
