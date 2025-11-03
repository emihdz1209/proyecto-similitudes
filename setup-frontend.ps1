# ============================================================================
# Script de Configuración del Frontend - React + Vite
# Para Windows PowerShell
# ============================================================================

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  Configurando Frontend (React + Vite)" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "frontend")) {
    Write-Host "❌ Error: No se encuentra el directorio 'frontend'" -ForegroundColor Red
    Write-Host "   Ejecuta primero setup-proyecto.ps1" -ForegroundColor Yellow
    exit 1
}

# Verificar Node.js
Write-Host "🔍 Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "  ✓ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Node.js no está instalado" -ForegroundColor Red
    exit 1
}
Write-Host ""

# ============================================================================
# Eliminar carpeta frontend si ya existe contenido de Vite
# ============================================================================
Write-Host "🗑️  Limpiando directorio frontend..." -ForegroundColor Yellow
Set-Location "frontend"

if (Test-Path "package.json") {
    Write-Host "  ⚠️  Ya existe un proyecto en este directorio" -ForegroundColor Yellow
    $respuesta = Read-Host "  ¿Deseas sobrescribirlo? (s/n)"
    if ($respuesta -ne "s") {
        Write-Host "  Operación cancelada" -ForegroundColor Gray
        exit 0
    }
}

Set-Location ..

# ============================================================================
# Crear proyecto React con Vite
# ============================================================================
Write-Host "⚛️  Creando proyecto React con Vite..." -ForegroundColor Yellow
Write-Host "   (Esto puede tomar unos minutos...)" -ForegroundColor Gray
Write-Host ""

# Eliminar directorio frontend y recrear
Remove-Item -Path "frontend" -Recurse -Force -ErrorAction SilentlyContinue
npm create vite@latest frontend -- --template react

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "  ❌ Error al crear proyecto React" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "  ✅ Proyecto React creado" -ForegroundColor Green
Write-Host ""

Set-Location "frontend"

# ============================================================================
# Instalar dependencias base
# ============================================================================
Write-Host "📥 Instalando dependencias base..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "  ❌ Error al instalar dependencias base" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "  ✅ Dependencias base instaladas" -ForegroundColor Green
Write-Host ""

# ============================================================================
# Instalar dependencias adicionales
# ============================================================================
Write-Host "📦 Instalando dependencias adicionales..." -ForegroundColor Yellow

$dependencias = @(
    "axios",           # HTTP client
    "react-router-dom", # Routing
    "lucide-react"     # Iconos
)

foreach ($dep in $dependencias) {
    Write-Host "  Instalando $dep..." -ForegroundColor Gray
    npm install $dep --silent
}

Write-Host ""
Write-Host "  ✅ Dependencias adicionales instaladas" -ForegroundColor Green
Write-Host ""

# ============================================================================
# Configurar Tailwind CSS
# ============================================================================
Write-Host "🎨 Configurando Tailwind CSS..." -ForegroundColor Yellow

npm install -D tailwindcss postcss autoprefixer --silent
npx tailwindcss init -p

$tailwindConfig = @"
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
      },
    },
  },
  plugins: [],
}
"@

Set-Content -Path "tailwind.config.js" -Value $tailwindConfig -Encoding UTF8

$cssContent = @"
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-gray-50 text-gray-900;
  }
}

@layer components {
  .btn-primary {
    @apply bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200;
  }
  
  .btn-secondary {
    @apply bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors duration-200;
  }
  
  .card {
    @apply bg-white rounded-lg shadow-md p-6;
  }
}
"@

Set-Content -Path "src\index.css" -Value $cssContent -Encoding UTF8
Write-Host "  ✓ Tailwind CSS configurado" -ForegroundColor Green
Write-Host ""

# ============================================================================
# Actualizar vite.config.js
# ============================================================================
Write-Host "⚙️  Configurando Vite..." -ForegroundColor Yellow

$viteConfig = @"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  }
})
"@

Set-Content -Path "vite.config.js" -Value $viteConfig -Encoding UTF8
Write-Host "  ✓ vite.config.js configurado" -ForegroundColor Green
Write-Host ""

# ============================================================================
# Crear estructura de carpetas adicionales
# ============================================================================
Write-Host "📁 Creando estructura de carpetas..." -ForegroundColor Yellow

$carpetas = @(
    "src\components",
    "src\pages",
    "src\services",
    "src\utils",
    "src\hooks"
)

foreach ($carpeta in $carpetas) {
    New-Item -ItemType Directory -Force -Path $carpeta | Out-Null
    Write-Host "  ✓ $carpeta" -ForegroundColor Green
}
Write-Host ""

# ============================================================================
# Crear servicio de API
# ============================================================================
Write-Host "🔌 Creando servicio de API..." -ForegroundColor Yellow

$apiServiceContent = @"
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Sube archivos de texto al servidor
 * @param {File[]} files - Archivos a subir
 * @returns {Promise} Respuesta del servidor
 */
export const uploadFiles = async (files) => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });

  const response = await api.post('/api/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

/**
 * Preprocesa un texto
 * @param {string} text - Texto a preprocesar
 * @param {Object} options - Opciones de preprocesamiento
 * @returns {Promise} Texto preprocesado y estadísticas
 */
export const preprocessText = async (text, options = {}) => {
  const response = await api.post('/api/preprocess', { text, options });
  return response.data;
};

/**
 * Compara dos textos usando Longest Common Substring
 * @param {string} text1 - Primer texto
 * @param {string} text2 - Segundo texto
 * @returns {Promise} Resultado de la comparación
 */
export const compareLCSstr = async (text1, text2) => {
  const response = await api.post('/api/compare/lcstr', { text1, text2 });
  return response.data;
};

/**
 * Compara dos textos usando Longest Common Subsequence
 * @param {string} text1 - Primer texto
 * @param {string} text2 - Segundo texto
 * @returns {Promise} Resultado de la comparación
 */
export const compareLCS = async (text1, text2) => {
  const response = await api.post('/api/compare/lcs', { text1, text2 });
  return response.data;
};

/**
 * Verifica el estado del servidor
 * @returns {Promise} Estado del servidor
 */
export const checkHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

export default api;
"@

Set-Content -Path "src\services\api.js" -Value $apiServiceContent -Encoding UTF8
Write-Host "  ✓ src/services/api.js creado" -ForegroundColor Green
Write-Host ""

# ============================================================================
# Crear componente de carga de archivos
# ============================================================================
Write-Host "📤 Creando componente FileUploader..." -ForegroundColor Yellow

$fileUploaderContent = @"
import { useState, useRef } from 'react';
import { Upload, X, File } from 'lucide-react';

export default function FileUploader({ onFilesSelected }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    addFiles(files);
  };

  const addFiles = (newFiles) => {
    const txtFiles = newFiles.filter(file => 
      file.name.endsWith('.txt') || file.type === 'text/plain'
    );
    
    if (txtFiles.length !== newFiles.length) {
      alert('Solo se permiten archivos .txt');
    }
    
    setSelectedFiles(prev => [...prev, ...txtFiles]);
    if (onFilesSelected) {
      onFilesSelected([...selectedFiles, ...txtFiles]);
    }
  };

  const removeFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    if (onFilesSelected) {
      onFilesSelected(newFiles);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={\`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-all duration-200
          \${isDragging 
            ? 'border-primary-500 bg-primary-50' 
            : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
          }
        \`}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          Arrastra archivos aquí o haz clic para seleccionar
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Solo archivos .txt (máximo 50MB)
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".txt,text/plain"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700">
            Archivos seleccionados ({selectedFiles.length})
          </h3>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <File className="h-5 w-5 text-primary-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className="ml-4 text-red-500 hover:text-red-700 flex-shrink-0"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
"@

Set-Content -Path "src\components\FileUploader.jsx" -Value $fileUploaderContent -Encoding UTF8
Write-Host "  ✓ src/components/FileUploader.jsx creado" -ForegroundColor Green
Write-Host ""

# ============================================================================
# Crear página principal
# ============================================================================
Write-Host "🏠 Creando página principal..." -ForegroundColor Yellow

$homePageContent = @"
import { useState } from 'react';
import FileUploader from '../components/FileUploader';
import { uploadFiles, compareLCSstr } from '../services/api';
import { FileText, Zap, BarChart3 } from 'lucide-react';

export default function HomePage() {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadedTexts, setUploadedTexts] = useState([]);
  const [comparing, setComparing] = useState(false);
  const [results, setResults] = useState(null);

  const handleUpload = async () => {
    if (files.length < 2) {
      alert('Selecciona al menos 2 archivos para comparar');
      return;
    }

    setUploading(true);
    try {
      const response = await uploadFiles(files);
      setUploadedTexts(response.files);
      alert('Archivos subidos exitosamente');
    } catch (error) {
      console.error('Error al subir archivos:', error);
      alert('Error al subir archivos: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleCompare = async () => {
    if (uploadedTexts.length < 2) {
      alert('Primero sube al menos 2 archivos');
      return;
    }

    setComparing(true);
    try {
      // Por ahora comparamos los dos primeros textos
      // TODO: Permitir seleccionar cuáles comparar
      const text1 = await fetch(uploadedTexts[0].path).then(r => r.text());
      const text2 = await fetch(uploadedTexts[1].path).then(r => r.text());
      
      const response = await compareLCSstr(text1, text2);
      setResults(response.result);
    } catch (error) {
      console.error('Error al comparar:', error);
      alert('Error al comparar textos: ' + error.message);
    } finally {
      setComparing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-3">
            <FileText className="h-8 w-8 text-primary-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Búsqueda de Similitudes entre Textos
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Análisis algorítmico de textos literarios
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload Section */}
          <div className="lg:col-span-2">
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                📁 Etapa 1: Selección de Textos
              </h2>
              <FileUploader onFilesSelected={setFiles} />
              
              {files.length >= 2 && (
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="btn-primary w-full mt-4"
                >
                  {uploading ? 'Subiendo...' : \`Subir \${files.length} archivos\`}
                </button>
              )}
            </div>

            {/* Results Section */}
            {results && (
              <div className="card mt-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  📊 Resultados
                </h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Longitud Substring</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {results.length}
                      </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Similitud</p>
                      <p className="text-2xl font-bold text-green-600">
                        {results.similarity.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Substring Común:</p>
                    <p className="text-sm font-mono text-gray-800">
                      {results.substring.substring(0, 200)}...
                    </p>
                  </div>

                  <div className="text-sm text-gray-600">
                    Tiempo de ejecución: {results.executionTime.toFixed(3)}s
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Info Panel */}
          <div className="space-y-6">
            {/* Status */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Estado del Proyecto
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Etapa 1</span>
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                    Activa
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Etapa 2</span>
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                    Pendiente
                  </span>
                </div>
              </div>
            </div>

            {/* Uploaded Files */}
            {uploadedTexts.length > 0 && (
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Textos Cargados
                </h3>
                <div className="space-y-2">
                  {uploadedTexts.map((text, idx) => (
                    <div key={idx} className="text-sm">
                      <p className="font-medium text-gray-900">{text.filename}</p>
                      <p className="text-xs text-gray-500">
                        {text.length.toLocaleString()} caracteres
                      </p>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleCompare}
                  disabled={comparing}
                  className="btn-primary w-full mt-4 flex items-center justify-center space-x-2"
                >
                  <Zap className="h-4 w-4" />
                  <span>{comparing ? 'Comparando...' : 'Comparar Textos'}</span>
                </button>
              </div>
            )}

            {/* Quick Stats */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Algoritmos Disponibles
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✅ Longest Common Substring</li>
                <li>⏳ Longest Common Subsequence</li>
                <li>⏳ Levenshtein Distance</li>
                <li>⏳ Jaccard Similarity</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
"@

Set-Content -Path "src\pages\HomePage.jsx" -Value $homePageContent -Encoding UTF8
Write-Host "  ✓ src/pages/HomePage.jsx creado" -ForegroundColor Green
Write-Host ""

# ============================================================================
# Actualizar App.jsx
# ============================================================================
Write-Host "📱 Actualizando App.jsx..." -ForegroundColor Yellow

$appContent = @"
import HomePage from './pages/HomePage';
import './index.css';

function App() {
  return <HomePage />;
}

export default App;
"@

Set-Content -Path "src\App.jsx" -Value $appContent -Encoding UTF8
Write-Host "  ✓ src/App.jsx actualizado" -ForegroundColor Green
Write-Host ""

# ============================================================================
# Crear archivo .env
# ============================================================================
Write-Host "⚙️  Creando archivo de configuración..." -ForegroundColor Yellow

$envContent = @"
VITE_API_URL=http://localhost:3001
"@

Set-Content -Path ".env" -Value $envContent -Encoding UTF8
Write-Host "  ✓ .env creado" -ForegroundColor Green
Write-Host ""

# ============================================================================
# Crear README
# ============================================================================
$frontendReadme = @"
# Frontend - React + Vite

## Descripción

Interfaz de usuario para el sistema de comparación de textos. Construida con React, Vite y Tailwind CSS.

## Tecnologías

- **React 18**: Librería de UI
- **Vite**: Build tool y dev server
- **Tailwind CSS**: Framework de estilos
- **Axios**: Cliente HTTP
- **Lucide React**: Iconos
- **React Router**: Navegación (preparado para futuro)

## Instalación

Ya está instalado. Si necesitas reinstalar:

\`\`\`powershell
npm install
\`\`\`

## Ejecución

### Desarrollo
\`\`\`powershell
npm run dev
\`\`\`

La aplicación estará disponible en: http://localhost:5173

### Build para Producción
\`\`\`powershell
npm run build
\`\`\`

### Preview de Build
\`\`\`powershell
npm run preview
\`\`\`

## Estructura

\`\`\`
frontend/
├── src/
│   ├── components/       # Componentes reutilizables
│   │   └── FileUploader.jsx
│   ├── pages/           # Páginas principales
│   │   └── HomePage.jsx
│   ├── services/        # Servicios API
│   │   └── api.js
│   ├── utils/           # Utilidades
│   ├── hooks/           # Custom hooks
│   ├── App.jsx          # Componente principal
│   └── index.css        # Estilos globales
├── public/              # Archivos estáticos
└── index.html           # HTML principal
\`\`\`

## Componentes Principales

### HomePage
Página principal que integra todos los componentes y gestiona el flujo del proyecto.

### FileUploader
Componente de carga de archivos con drag & drop.

**Props**:
- \`onFilesSelected(files)\`: Callback cuando se seleccionan archivos

**Uso**:
\`\`\`jsx
<FileUploader onFilesSelected={setFiles} />
\`\`\`

## Servicios API

Ubicados en \`src/services/api.js\`:

### uploadFiles(files)
Sube archivos al servidor

### preprocessText(text, options)
Preprocesa un texto

### compareLCSstr(text1, text2)
Compara usando Longest Common Substring

### compareLCS(text1, text2)
Compara usando Longest Common Subsequence

### checkHealth()
Verifica estado del servidor

## Configuración

El archivo \`.env\` contiene:

\`\`\`
VITE_API_URL=http://localhost:3001
\`\`\`

## Estilos con Tailwind

Clases personalizadas disponibles:
- \`.btn-primary\`: Botón principal
- \`.btn-secondary\`: Botón secundario
- \`.card\`: Tarjeta con sombra

## Proxy de Vite

El servidor de desarrollo tiene un proxy configurado para \`/api\` que redirige a \`http://localhost:3001\`.

Esto permite hacer peticiones como:
\`\`\`javascript
fetch('/api/health')  // Se redirige a http://localhost:3001/api/health
\`\`\`

## Próximos Pasos

- [ ] Implementar preprocesamiento visual
- [ ] Añadir más algoritmos de comparación
- [ ] Implementar gráficas de resultados
- [ ] Añadir exportación de reportes
- [ ] Implementar comparación múltiple

## Scripts Disponibles

- \`npm run dev\`: Servidor de desarrollo
- \`npm run build\`: Build de producción
- \`npm run preview\`: Preview del build
- \`npm run lint\`: Linter ESLint
"@

Set-Content -Path "README.md" -Value $frontendReadme -Encoding UTF8
Write-Host "  ✓ README.md creado" -ForegroundColor Green
Write-Host ""

# ============================================================================
# Resumen final
# ============================================================================
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  ✅ Frontend configurado exitosamente!" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚛️  Stack instalado:" -ForegroundColor Yellow
Write-Host "  - React 18" -ForegroundColor White
Write-Host "  - Vite (build tool)" -ForegroundColor White
Write-Host "  - Tailwind CSS" -ForegroundColor White
Write-Host "  - Axios (HTTP)" -ForegroundColor White
Write-Host "  - Lucide React (iconos)" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Para iniciar la aplicación:" -ForegroundColor Yellow
Write-Host "   npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 La aplicación estará en:" -ForegroundColor Yellow
Write-Host "   http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Nota importante:" -ForegroundColor Yellow
Write-Host "   Asegúrate de que el backend esté corriendo en http://localhost:3001" -ForegroundColor White
Write-Host ""
Write-Host "✨ Componentes creados:" -ForegroundColor Yellow
Write-Host "  ✓ FileUploader (con drag & drop)" -ForegroundColor Green
Write-Host "  ✓ HomePage (página principal)" -ForegroundColor Green
Write-Host "  ✓ API Service (integración con backend)" -ForegroundColor Green
Write-Host ""

Set-Location ..
