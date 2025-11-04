import { BarChart3, Clock, FileText, TrendingUp, Zap, Layers } from 'lucide-react';

export default function ComparisonResults({ results, book1, book2 }) {
  if (!results) return null;

  const { lcstr, lcs, levenshtein, jaccard } = results;

  // Calcular promedio de similitud
  const availableResults = [lcstr, lcs, levenshtein, jaccard].filter(r => r && !r.error);
  const averageSimilarity = availableResults.length > 0
    ? availableResults.reduce((sum, r) => sum + r.similarity, 0) / availableResults.length
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-orange-600 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Resultados de Comparación Completa</h2>
        <div className="flex items-center justify-between">
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
          <div className="text-right">
            <div className="text-3xl font-bold">{averageSimilarity.toFixed(1)}%</div>
            <div className="text-xs opacity-90">Similitud Promedio</div>
          </div>
        </div>
      </div>

      {/* Grid 2x2 de Algoritmos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* LCS Substring */}
        {lcstr && !lcstr.error && (
          <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-blue-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                Longest Common Substring
              </h3>
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-4xl font-bold text-blue-600 mb-1">
                  {lcstr.similarity.toFixed(2)}%
                </div>
                <div className="text-sm text-gray-600">Similitud</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded p-3">
                  <div className="text-xl font-semibold text-gray-900">
                    {lcstr.length}
                  </div>
                  <div className="text-xs text-gray-600">Caracteres</div>
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
                <div className="bg-gray-50 rounded-lg p-3 max-h-24 overflow-y-auto">
                  <div className="text-xs font-mono text-gray-700">
                    "{lcstr.substring.substring(0, 150)}{lcstr.substring.length > 150 && '...'}"
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* LCS Subsequence */}
        {lcs && !lcs.error && (
          <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-purple-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                Longest Common Subsequence
              </h3>
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>

            <div className="space-y-4">
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-4xl font-bold text-purple-600 mb-1">
                  {lcs.similarity.toFixed(2)}%
                </div>
                <div className="text-sm text-gray-600">Similitud</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded p-3">
                  <div className="text-xl font-semibold text-gray-900">
                    {lcs.length}
                  </div>
                  <div className="text-xs text-gray-600">Caracteres</div>
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
                <div className="bg-gray-50 rounded-lg p-3 max-h-24 overflow-y-auto">
                  <div className="text-xs font-mono text-gray-700">
                    "{lcs.subsequence.substring(0, 150)}{lcs.subsequence.length > 150 && '...'}"
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Levenshtein Distance */}
        {levenshtein && !levenshtein.error && (
          <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-green-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                Levenshtein Distance
              </h3>
              <Zap className="h-6 w-6 text-green-600" />
            </div>

            <div className="space-y-4">
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-4xl font-bold text-green-600 mb-1">
                  {levenshtein.similarity.toFixed(2)}%
                </div>
                <div className="text-sm text-gray-600">Similitud</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded p-3">
                  <div className="text-xl font-semibold text-gray-900">
                    {levenshtein.distance}
                  </div>
                  <div className="text-xs text-gray-600">Distancia</div>
                </div>
                <div className="bg-gray-50 rounded p-3">
                  <div className="text-xl font-semibold text-gray-900 flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {levenshtein.executionTime.toFixed(3)}s
                  </div>
                  <div className="text-xs text-gray-600">Tiempo</div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-600 space-y-1">
                  <div>Procesado: {levenshtein.processedLength1.toLocaleString()} / {levenshtein.processedLength2.toLocaleString()} caracteres</div>
                  <div>Límite: {levenshtein.maxLengthUsed.toLocaleString()} caracteres</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Jaccard Similarity */}
        {jaccard && !jaccard.error && (
          <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-orange-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                Jaccard Similarity
              </h3>
              <Layers className="h-6 w-6 text-orange-600" />
            </div>

            <div className="space-y-4">
              <div className="bg-orange-50 rounded-lg p-4">
                <div className="text-4xl font-bold text-orange-600 mb-1">
                  {jaccard.similarity.toFixed(2)}%
                </div>
                <div className="text-sm text-gray-600">Similitud (N-gramas)</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded p-3">
                  <div className="text-xl font-semibold text-gray-900">
                    {jaccard.nGramaSize}-gramas
                  </div>
                  <div className="text-xs text-gray-600">Tamaño</div>
                </div>
                <div className="bg-gray-50 rounded p-3">
                  <div className="text-xl font-semibold text-gray-900 flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {jaccard.executionTime.toFixed(3)}s
                  </div>
                  <div className="text-xs text-gray-600">Tiempo</div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">N-gramas Texto 1:</span>
                  <span className="font-semibold">{jaccard.nGramas1Count.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">N-gramas Texto 2:</span>
                  <span className="font-semibold">{jaccard.nGramas2Count.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">N-gramas Comunes:</span>
                  <span className="font-semibold text-orange-600">{jaccard.commonNGramas.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Unión Total:</span>
                  <span className="font-semibold">{jaccard.unionSize.toLocaleString()}</span>
                </div>
              </div>

              {jaccard.sampleCommonNGramas && (
                <div className="bg-gray-50 rounded-lg p-3 max-h-20 overflow-y-auto">
                  <div className="text-xs font-mono text-gray-700">
                    {jaccard.sampleCommonNGramas}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Gráfica Comparativa */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6">
          Comparación de Similitudes
        </h3>
        
        <div className="space-y-4">
          {lcstr && !lcstr.error && (
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-medium text-gray-700">LCS Substring</span>
                <span className="font-bold text-blue-600">
                  {lcstr.similarity.toFixed(2)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-blue-600 h-4 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                  style={{ width: `${Math.min(lcstr.similarity, 100)}%` }}
                >
                  {lcstr.similarity > 10 && (
                    <span className="text-xs text-white font-bold">
                      {lcstr.similarity.toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {lcs && !lcs.error && (
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-medium text-gray-700">LCS Subsequence</span>
                <span className="font-bold text-purple-600">
                  {lcs.similarity.toFixed(2)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-purple-600 h-4 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                  style={{ width: `${Math.min(lcs.similarity, 100)}%` }}
                >
                  {lcs.similarity > 10 && (
                    <span className="text-xs text-white font-bold">
                      {lcs.similarity.toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {levenshtein && !levenshtein.error && (
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-medium text-gray-700">Levenshtein Distance</span>
                <span className="font-bold text-green-600">
                  {levenshtein.similarity.toFixed(2)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-green-600 h-4 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                  style={{ width: `${Math.min(levenshtein.similarity, 100)}%` }}
                >
                  {levenshtein.similarity > 10 && (
                    <span className="text-xs text-white font-bold">
                      {levenshtein.similarity.toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {jaccard && !jaccard.error && (
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-medium text-gray-700">
                  Jaccard Similarity ({jaccard.nGramaSize}-gramas)
                </span>
                <span className="font-bold text-orange-600">
                  {jaccard.similarity.toFixed(2)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-orange-600 h-4 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                  style={{ width: `${Math.min(jaccard.similarity, 100)}%` }}
                >
                  {jaccard.similarity > 10 && (
                    <span className="text-xs text-white font-bold">
                      {jaccard.similarity.toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tabla de Performance */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-4">
            Métricas de Rendimiento
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {lcstr && !lcstr.error && (
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {lcstr.executionTime.toFixed(3)}s
                </div>
                <div className="text-xs text-gray-600 mt-1">LCS Substring</div>
              </div>
            )}
            {lcs && !lcs.error && (
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {lcs.executionTime.toFixed(3)}s
                </div>
                <div className="text-xs text-gray-600 mt-1">LCS Subsequence</div>
              </div>
            )}
            {levenshtein && !levenshtein.error && (
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {levenshtein.executionTime.toFixed(3)}s
                </div>
                <div className="text-xs text-gray-600 mt-1">Levenshtein</div>
              </div>
            )}
            {jaccard && !jaccard.error && (
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {jaccard.executionTime.toFixed(3)}s
                </div>
                <div className="text-xs text-gray-600 mt-1">Jaccard</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Estadísticas de Textos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            📚 {book1.title}
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Caracteres:</span>
              <span className="font-semibold">
                {(lcstr?.text1Length || lcs?.text1Length || levenshtein?.text1Length || jaccard?.text1Length || 0).toLocaleString()}
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

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            📚 {book2.title}
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Caracteres:</span>
              <span className="font-semibold">
                {(lcstr?.text2Length || lcs?.text2Length || levenshtein?.text2Length || jaccard?.text2Length || 0).toLocaleString()}
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

      {/* Interpretación de Resultados */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
        <h3 className="text-lg font-bold text-gray-900 mb-3">
          📊 Interpretación de Resultados
        </h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p>
            <strong>Similitud Promedio:</strong> {averageSimilarity.toFixed(1)}% - 
            {averageSimilarity >= 60 ? ' Alta similitud significativa' : 
             averageSimilarity >= 40 ? ' Similitud moderada' : 
             ' Similitud baja'}
          </p>
          <p>
            <strong>LCS Substring:</strong> Mide fragmentos idénticos continuos (plagio directo).
          </p>
          <p>
            <strong>LCS Subsequence:</strong> Detecta secuencias preservando orden (estructura similar).
          </p>
          <p>
            <strong>Levenshtein:</strong> Cuenta ediciones necesarias (similitud por transformación).
          </p>
          <p>
            <strong>Jaccard:</strong> Compara vocabulario y frases compartidas (similitud semántica).
          </p>
        </div>
      </div>
    </div>
  );
}