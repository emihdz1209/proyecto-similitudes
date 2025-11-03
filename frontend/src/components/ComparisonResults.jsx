import { BarChart3, Clock, FileText, TrendingUp } from 'lucide-react';

export default function ComparisonResults({ results, book1, book2 }) {
  if (!results) return null;

  const { lcstr, lcs } = results;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Resultados de Comparación</h2>
        <div className="flex items-center space-x-4 text-sm opacity-90">
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>{book1.title}</span>
          </div>
          <span>vs</span>
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>{book2.title}</span>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Longest Common Substring */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">
              Longest Common Substring
            </h3>
            <BarChart3 className="h-6 w-6 text-blue-600" />
          </div>

          <div className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {lcstr.similarity.toFixed(2)}%
              </div>
              <div className="text-sm text-gray-600">Similitud</div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded p-3">
                <div className="text-xl font-semibold text-gray-900">
                  {lcstr.length}
                </div>
                <div className="text-xs text-gray-600">Longitud</div>
              </div>
              <div className="bg-gray-50 rounded p-3">
                <div className="text-xl font-semibold text-gray-900 flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {lcstr.executionTime.toFixed(3)}s
                </div>
                <div className="text-xs text-gray-600">Tiempo</div>
              </div>
            </div>

            {lcstr.substring && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs font-semibold text-gray-600 mb-2">
                  Fragmento Encontrado:
                </div>
                <div className="text-sm font-mono text-gray-800 max-h-32 overflow-y-auto">
                  {lcstr.substring.substring(0, 300)}
                  {lcstr.substring.length > 300 && '...'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Longest Common Subsequence */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">
              Longest Common Subsequence
            </h3>
            <TrendingUp className="h-6 w-6 text-purple-600" />
          </div>

          <div className="space-y-4">
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-3xl font-bold text-purple-600 mb-1">
                {lcs.similarity.toFixed(2)}%
              </div>
              <div className="text-sm text-gray-600">Similitud</div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded p-3">
                <div className="text-xl font-semibold text-gray-900">
                  {lcs.length}
                </div>
                <div className="text-xs text-gray-600">Longitud</div>
              </div>
              <div className="bg-gray-50 rounded p-3">
                <div className="text-xl font-semibold text-gray-900 flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {lcs.executionTime.toFixed(3)}s
                </div>
                <div className="text-xs text-gray-600">Tiempo</div>
              </div>
            </div>

            {lcs.subsequence && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs font-semibold text-gray-600 mb-2">
                  Subsecuencia Encontrada:
                </div>
                <div className="text-sm font-mono text-gray-800 max-h-32 overflow-y-auto">
                  {lcs.subsequence.substring(0, 300)}
                  {lcs.subsequence.length > 300 && '...'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Comparison Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Comparación de Algoritmos
        </h3>
        
        <div className="space-y-4">
          {/* Similarity Comparison */}
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-medium text-gray-700">LCSstr</span>
              <span className="font-bold text-blue-600">
                {lcstr.similarity.toFixed(2)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(lcstr.similarity, 100)}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-medium text-gray-700">LCS</span>
              <span className="font-bold text-purple-600">
                {lcs.similarity.toFixed(2)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-purple-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(lcs.similarity, 100)}%` }}
              />
            </div>
          </div>

          {/* Performance Comparison */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              Tiempo de Ejecución
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {lcstr.executionTime.toFixed(3)}s
                </div>
                <div className="text-xs text-gray-600">LCSstr</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {lcs.executionTime.toFixed(3)}s
                </div>
                <div className="text-xs text-gray-600">LCS</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Text Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            {book1.title}
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Caracteres:</span>
              <span className="font-semibold">
                {lcstr.text1Length.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Autor:</span>
              <span className="font-semibold">{book1.author}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Año:</span>
              <span className="font-semibold">{book1.year}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            {book2.title}
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Caracteres:</span>
              <span className="font-semibold">
                {lcstr.text2Length.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Autor:</span>
              <span className="font-semibold">{book2.author}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Año:</span>
              <span className="font-semibold">{book2.year}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}