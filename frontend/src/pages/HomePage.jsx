import { useState } from 'react';
import { Library, ArrowLeft } from 'lucide-react';
import BookGallery from '../components/BookGallery';
import ComparisonResults from '../components/ComparisonResults';
import { compareLCSstr, compareLCS } from '../services/api';

export default function HomePage() {
  const [view, setView] = useState('library'); // 'library' | 'results'
  const [comparisonResults, setComparisonResults] = useState(null);
  const [selectedBooks, setSelectedBooks] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleCompare = async (book1, book2) => {
    setLoading(true);
    try {
      // Cargar los textos de los archivos
      const text1Response = await fetch(book1.textFile);
      const text2Response = await fetch(book2.textFile);
      
      const text1 = await text1Response.text();
      const text2 = await text2Response.text();

      // Ejecutar ambos algoritmos en paralelo
      const [lcstrResult, lcsResult] = await Promise.all([
        compareLCSstr(text1, text2),
        compareLCS(text1, text2)
      ]);

      setComparisonResults({
        lcstr: lcstrResult.result,
        lcs: lcsResult.result
      });

      setSelectedBooks([book1, book2]);
      setView('results');
    } catch (error) {
      console.error('Error al comparar libros:', error);
      alert('Error al comparar los libros. Verifica que los archivos existan.');
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

            <div className="flex items-center space-x-2">
              <div className="text-right">
                <div className="text-xs text-gray-500">Algoritmos</div>
                <div className="text-sm font-semibold text-gray-900">
                  LCSstr & LCS
                </div>
              </div>
            </div>
          </div>
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
                    Ejecutando algoritmos de comparación
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