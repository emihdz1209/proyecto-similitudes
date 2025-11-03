import { useState } from 'react';
import { Library, ArrowLeft, Settings } from 'lucide-react';
import BookGallery from '../components/BookGallery';
import ComparisonResults from '../components/ComparisonResults';
import { compareLCSstr, compareLCS, compareLCSstrChunks, compareLCSChunks } from '../services/api';

export default function HomePage() {
  const [view, setView] = useState('library'); // 'library' | 'results'
  const [comparisonResults, setComparisonResults] = useState(null);
  const [selectedBooks, setSelectedBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [useChunks, setUseChunks] = useState(true);
  const [chunkSize, setChunkSize] = useState(5000);
  const [showSettings, setShowSettings] = useState(false);

  const handleCompare = async (book1, book2) => {
    setLoading(true);
    try {
      const text1Response = await fetch(book1.textFile);
      const text2Response = await fetch(book2.textFile);
      
      let text1 = await text1Response.text();
      let text2 = await text2Response.text();

      console.log('Textos cargados, longitudes originales:', text1.length, text2.length);

      let lcstrResult, lcsResult;

      if (useChunks) {
        // Usar procesamiento por chunks - puede manejar textos completos
        console.log('Usando procesamiento por chunks, tamaño:', chunkSize);
        
        [lcstrResult, lcsResult] = await Promise.all([
          compareLCSstrChunks(text1, text2, chunkSize),
          compareLCSChunks(text1, text2, chunkSize)
        ]);
      } else {
        // Modo simple - limitar tamaño
        const MAX_LENGTH = 5000;
        text1 = text1.substring(0, MAX_LENGTH);
        text2 = text2.substring(0, MAX_LENGTH);
        console.log('Modo simple, textos limitados a:', text1.length, text2.length);
        
        [lcstrResult, lcsResult] = await Promise.all([
          compareLCSstr(text1, text2),
          compareLCS(text1, text2)
        ]);
      }

      setComparisonResults({
        lcstr: lcstrResult.result,
        lcs: lcsResult.result
      });

      setSelectedBooks([book1, book2]);
      setView('results');
    } catch (error) {
      console.error('Error al comparar libros:', error);
      alert('Error al comparar los libros: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLibrary = () => {
    setView('library');
    setComparisonResults(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {view === 'results' && (
                <button
                  onClick={handleBackToLibrary}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="h-5 w-5 text-gray-600" />
                </button>
              )}
              <Library className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Biblioteca Literaria
                </h1>
                <p className="text-sm text-gray-600">
                  {view === 'library' 
                    ? 'Análisis de similitudes entre textos' 
                    : 'Resultados de comparación'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Settings Button */}
              {view === 'library' && (
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  <span className="text-sm font-medium">Configuración</span>
                </button>
              )}
              
              <div className="text-right">
                <div className="text-xs text-gray-500">Algoritmos</div>
                <div className="text-sm font-semibold text-gray-900">
                  LCSstr & LCS {useChunks && '(Chunks)'}
                </div>
              </div>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && view === 'library' && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-3">Configuración de Procesamiento</h3>
              
              <div className="space-y-4">
                {/* Toggle Chunks */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium text-gray-900">Procesamiento por Chunks</label>
                    <p className="text-sm text-gray-600">Permite analizar libros completos sin límite de tamaño</p>
                  </div>
                  <button
                    onClick={() => setUseChunks(!useChunks)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      useChunks ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        useChunks ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Chunk Size Slider */}
                {useChunks && (
                  <div>
                    <label className="font-medium text-gray-900">
                      Tamaño de Chunk: {chunkSize.toLocaleString()} caracteres
                    </label>
                    <p className="text-sm text-gray-600 mb-2">
                      Chunks más pequeños = más rápido pero menos precisión
                    </p>
                    <input
                      type="range"
                      min="1000"
                      max="20000"
                      step="1000"
                      value={chunkSize}
                      onChange={(e) => setChunkSize(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>1K (rápido)</span>
                      <span>10K (balanceado)</span>
                      <span>20K (preciso)</span>
                    </div>
                  </div>
                )}

                {/* Info */}
                <div className="bg-white p-3 rounded border border-blue-200">
                  <p className="text-sm text-gray-700">
                    {useChunks ? (
                      <>
                        <strong>Modo Chunks:</strong> Los textos se dividen en fragmentos de {chunkSize.toLocaleString()} caracteres 
                        para procesar libros completos sin límites de memoria.
                      </>
                    ) : (
                      <>
                        <strong>Modo Simple:</strong> Solo se analizan los primeros 5,000 caracteres de cada libro.
                        Más rápido pero menos representativo.
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md">
              <div className="flex items-center space-x-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Analizando textos...
                  </h3>
                  <p className="text-sm text-gray-600">
                    {useChunks 
                      ? `Procesando en chunks de ${chunkSize.toLocaleString()} caracteres`
                      : 'Ejecutando algoritmos de comparación'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'library' ? (
          <BookGallery onCompare={handleCompare} />
        ) : (
          <ComparisonResults
            results={comparisonResults}
            book1={selectedBooks[0]}
            book2={selectedBooks[1]}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-600">
            <p>
              Proyecto de Análisis y Diseño de Algoritmos Avanzados
            </p>
            <p className="mt-1">
              Algoritmos implementados en C++ compilados a WebAssembly
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}