import { useState } from "react";
import { Library, ArrowLeft, Settings } from "lucide-react";
import BookGallery from "../components/BookGallery";
import ComparisonResults from "../components/ComparisonResults";
import { 
  compareLCSstrChunks, 
  compareLCSChunks,
  compareLevenshtein,
  compareJaccard 
} from "../services/api";

export default function HomePage() {
  const [view, setView] = useState("library"); // 'library' | 'results'
  const [comparisonResults, setComparisonResults] = useState(null);
  const [selectedBooks, setSelectedBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Configuración
  const [chunkSize, setChunkSize] = useState(5000);
  const [nGramaSize, setNGramaSize] = useState(5);
  const [maxLengthLevenshtein, setMaxLengthLevenshtein] = useState(10000);
  const [showSettings, setShowSettings] = useState(false);

  // Control de algoritmos activos
  const [algorithmsEnabled, setAlgorithmsEnabled] = useState({
    lcstr: true,
    lcs: true,
    levenshtein: true,
    jaccard: true
  });

  const toggleAlgorithm = (algo) => {
    setAlgorithmsEnabled(prev => ({
      ...prev,
      [algo]: !prev[algo]
    }));
  };

  const handleCompare = async (book1, book2) => {
    setLoading(true);
    try {
      const text1Response = await fetch(book1.textFile);
      const text2Response = await fetch(book2.textFile);

      const text1 = await text1Response.text();
      const text2 = await text2Response.text();

      console.log("Textos cargados, longitudes:", text1.length, text2.length);
      console.log("Configuración:", {
        chunkSize,
        nGramaSize,
        maxLengthLevenshtein,
        algorithmsEnabled
      });

      // Ejecutar algoritmos en paralelo según configuración
      const promises = [];
      
      if (algorithmsEnabled.lcstr) {
        promises.push(
          compareLCSstrChunks(text1, text2, chunkSize)
            .then(result => ({ type: 'lcstr', data: result.result }))
            .catch(err => ({ type: 'lcstr', error: err.message }))
        );
      }
      
      if (algorithmsEnabled.lcs) {
        promises.push(
          compareLCSChunks(text1, text2, chunkSize)
            .then(result => ({ type: 'lcs', data: result.result }))
            .catch(err => ({ type: 'lcs', error: err.message }))
        );
      }
      
      if (algorithmsEnabled.levenshtein) {
        promises.push(
          compareLevenshtein(text1, text2, maxLengthLevenshtein)
            .then(result => ({ type: 'levenshtein', data: result.result }))
            .catch(err => ({ type: 'levenshtein', error: err.message }))
        );
      }
      
      if (algorithmsEnabled.jaccard) {
        promises.push(
          compareJaccard(text1, text2, nGramaSize)
            .then(result => ({ type: 'jaccard', data: result.result }))
            .catch(err => ({ type: 'jaccard', error: err.message }))
        );
      }

      const results = await Promise.all(promises);
      
      // Organizar resultados
      const organizedResults = {};
      results.forEach(result => {
        if (result.error) {
          console.error(`Error en ${result.type}:`, result.error);
          organizedResults[result.type] = { error: result.error };
        } else {
          organizedResults[result.type] = result.data;
        }
      });

      setComparisonResults(organizedResults);
      setSelectedBooks([book1, book2]);
      setView("results");
    } catch (error) {
      console.error("Error al comparar libros:", error);
      alert("Error al comparar los libros: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLibrary = () => {
    setView("library");
    setComparisonResults(null);
  };

  const activeAlgorithmsCount = Object.values(algorithmsEnabled).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {view === "results" && (
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
                  {view === "library"
                    ? "Análisis de similitudes entre textos"
                    : "Resultados de comparación"}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Settings Button */}
              {view === "library" && (
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  <span className="text-sm font-medium">Configuración</span>
                </button>
              )}

              <div className="text-right">
                <div className="text-xs text-gray-500">Algoritmos Activos</div>
                <div className="text-sm font-semibold text-gray-900">
                  {activeAlgorithmsCount} de 4
                </div>
              </div>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && view === "library" && (
            <div className="mt-4 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-4 text-lg">
                ⚙️ Configuración de Algoritmos
              </h3>

              <div className="space-y-6">
                {/* Algoritmos Selector */}
                <div>
                  <label className="font-medium text-gray-900 block mb-3">
                    Seleccionar Algoritmos
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => toggleAlgorithm('lcstr')}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        algorithmsEnabled.lcstr
                          ? 'bg-blue-100 border-blue-500 text-blue-900'
                          : 'bg-gray-100 border-gray-300 text-gray-600'
                      }`}
                    >
                      <div className="font-semibold">LCS Substring</div>
                      <div className="text-xs">Fragmento común continuo</div>
                    </button>
                    
                    <button
                      onClick={() => toggleAlgorithm('lcs')}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        algorithmsEnabled.lcs
                          ? 'bg-purple-100 border-purple-500 text-purple-900'
                          : 'bg-gray-100 border-gray-300 text-gray-600'
                      }`}
                    >
                      <div className="font-semibold">LCS Subsequence</div>
                      <div className="text-xs">Subsecuencia común</div>
                    </button>
                    
                    <button
                      onClick={() => toggleAlgorithm('levenshtein')}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        algorithmsEnabled.levenshtein
                          ? 'bg-green-100 border-green-500 text-green-900'
                          : 'bg-gray-100 border-gray-300 text-gray-600'
                      }`}
                    >
                      <div className="font-semibold">Levenshtein</div>
                      <div className="text-xs">Distancia de edición</div>
                    </button>
                    
                    <button
                      onClick={() => toggleAlgorithm('jaccard')}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        algorithmsEnabled.jaccard
                          ? 'bg-orange-100 border-orange-500 text-orange-900'
                          : 'bg-gray-100 border-gray-300 text-gray-600'
                      }`}
                    >
                      <div className="font-semibold">Jaccard</div>
                      <div className="text-xs">Similitud con n-gramas</div>
                    </button>
                  </div>
                </div>

                <div className="border-t border-gray-300 pt-4"></div>

                {/* Chunk Size - Para LCS */}
                {(algorithmsEnabled.lcstr || algorithmsEnabled.lcs) && (
                  <div>
                    <label className="font-medium text-gray-900 block mb-2">
                      Tamaño de Chunk (LCS): {chunkSize.toLocaleString()} caracteres
                    </label>
                    <p className="text-sm text-gray-600 mb-2">
                      Para LCS Substring y LCS Subsequence
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

                {/* N-grama Size - Para Jaccard */}
                {algorithmsEnabled.jaccard && (
                  <div>
                    <label className="font-medium text-gray-900 block mb-2">
                      Tamaño de N-grama (Jaccard): {nGramaSize} palabras
                    </label>
                    <p className="text-sm text-gray-600 mb-2">
                      Número de palabras consecutivas para análisis
                    </p>
                    <input
                      type="range"
                      min="2"
                      max="7"
                      step="1"
                      value={nGramaSize}
                      onChange={(e) => setNGramaSize(parseInt(e.target.value))}
                      className="w-full h-2 bg-orange-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>2 (general)</span>
                      <span>5 (óptimo)</span>
                      <span>7 (específico)</span>
                    </div>
                  </div>
                )}

                {/* Max Length - Para Levenshtein */}
                {algorithmsEnabled.levenshtein && (
                  <div>
                    <label className="font-medium text-gray-900 block mb-2">
                      Longitud Máxima (Levenshtein): {maxLengthLevenshtein.toLocaleString()} caracteres
                    </label>
                    <p className="text-sm text-gray-600 mb-2">
                      Limita el procesamiento para mejor rendimiento
                    </p>
                    <input
                      type="range"
                      min="5000"
                      max="50000"
                      step="5000"
                      value={maxLengthLevenshtein}
                      onChange={(e) => setMaxLengthLevenshtein(parseInt(e.target.value))}
                      className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>5K</span>
                      <span>25K</span>
                      <span>50K</span>
                    </div>
                  </div>
                )}


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
                    Procesando con {activeAlgorithmsCount} algoritmo(s)
                  </p>
                  <div className="mt-2 space-y-1">
                    {algorithmsEnabled.lcstr && (
                      <div className="text-xs text-blue-600">• LCS Substring</div>
                    )}
                    {algorithmsEnabled.lcs && (
                      <div className="text-xs text-purple-600">• LCS Subsequence</div>
                    )}
                    {algorithmsEnabled.levenshtein && (
                      <div className="text-xs text-green-600">• Levenshtein</div>
                    )}
                    {algorithmsEnabled.jaccard && (
                      <div className="text-xs text-orange-600">• Jaccard (n={nGramaSize})</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {view === "library" ? (
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
            <p>Proyecto de Análisis y Diseño de Algoritmos Avanzados</p>
            <p className="mt-1">
              4 Algoritmos: LCS Substring, LCS Subsequence, Levenshtein Distance, Jaccard Similarity
            </p>
            <p className="mt-1 text-xs text-gray-500">
              C++ → WebAssembly → Node.js → React
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}