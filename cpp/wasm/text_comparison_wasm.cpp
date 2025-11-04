#include <emscripten/bind.h>
#include <emscripten/val.h>
#include <string>
#include <vector>
#include <algorithm>
#include <unordered_set>
#include <sstream>

using namespace emscripten;
using namespace std;

// ============================================================================
// FUNCIONES 
// ============================================================================

string LcSubString(string S1, string S2){
    int n = S1.size();
    int m = S2.size();
    int i_max = 0;
    int subLong = 0;

    vector<vector<int>> lc(n, vector<int>(m, 0));

    for(int i = 0; i < n; i++){
        for(int j = 0; j < m; j++){
            if(S1[i] == S2[j]){
                if(i == 0 || j == 0){
                    lc[i][j] = 1;
                }
                else {
                    lc[i][j] = lc[i-1][j-1] + 1;

                    if(lc[i][j] > subLong){
                        i_max = i;
                        subLong = lc[i][j];
                    }
                }
            }
        }
    }

    if (subLong == 0) return "";
    string subString = S1.substr(i_max - subLong + 1, subLong);
    return subString;
}

string LcSubSecuencia(const string &S1, const string &S2) {
    int n = S1.size();
    int m = S2.size();

    vector<vector<int>> lc(n + 1, vector<int>(m + 1, 0));

    // Llenar matriz
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= m; j++) {
            if (S1[i - 1] == S2[j - 1]) {
                lc[i][j] = lc[i - 1][j - 1] + 1;
            } else {
                lc[i][j] = max(lc[i - 1][j], lc[i][j - 1]);
            }
        }
    }

    // Reconstruir la subsecuencia desde el final
    string subSecuencia = "";
    int i = n, j = m;
    while (i > 0 && j > 0) {
        if (S1[i - 1] == S2[j - 1]) {
            subSecuencia = S1[i - 1] + subSecuencia;
            i--;
            j--;
        } else if (lc[i - 1][j] > lc[i][j - 1]) {
            i--;
        } else {
            j--;
        }
    }

    return subSecuencia;
}

string LimpiarTexto(const string &S, int& contCaracteres) {
    unordered_set<string> stopwords = {
        // Español
        "el", "la", "los", "las", "de", "del", "y", "a", "en",
        "por", "para", "con", "sin", "que",
        // Ingles
        "and", "for", "so", "or", "not", "if", "as",
        "the", "a", "an", "to", "of", "at",
    };

    string limpio;  
    string palabra;

    for (size_t i = 0; i < S.size(); ++i) {
        char c = S[i];
        contCaracteres++;

        // Convertir mayusculas a minusculas
        c = tolower(static_cast<unsigned char>(c));

        // Si es letra o espacio, conservarlo
        if (isalpha(static_cast<unsigned char>(c)) || c == ' ') {
            limpio += c;
        }
    }

    // Eliminar stopwords
    string resultado;
    string palabraTemp;
    for (char c : limpio) {
        if (c == ' ') {
            if (!palabraTemp.empty() && stopwords.find(palabraTemp) == stopwords.end()) {
                resultado += palabraTemp + ' ';
            }
            palabraTemp.clear();
        } else {
            palabraTemp += c;
        }
    }

    // Agregar ultima palabra si no era stopword
    if (!palabraTemp.empty() && stopwords.find(palabraTemp) == stopwords.end()) {
        resultado += palabraTemp;
    }

    return resultado;
}

// ============================================================================
// FUNCIONES PARA PROCESAMIENTO POR CHUNKS
// ============================================================================

vector<string> DividirEnChunks(const string &texto, size_t chunkSize) {
    vector<string> chunks;
    size_t pos = 0;
    
    while (pos < texto.size()) {
        size_t len = min(chunkSize, texto.size() - pos);
        chunks.push_back(texto.substr(pos, len));
        pos += len;
    }
    
    return chunks;
}

val CompararLCSstrPorChunks(string text1, string text2, int chunkSize) {
    // Limpiar textos
    int cont1 = 0, cont2 = 0;
    string clean1 = LimpiarTexto(text1, cont1);
    string clean2 = LimpiarTexto(text2, cont2);
    
    // Dividir en chunks
    vector<string> chunks1 = DividirEnChunks(clean1, chunkSize);
    vector<string> chunks2 = DividirEnChunks(clean2, chunkSize);
    
    // Encontrar el mejor substring entre todos los chunks
    string mejorSubstring = "";
    
    for (const string &c1 : chunks1) {
        for (const string &c2 : chunks2) {
            string subStr = LcSubString(c1, c2);
            if (subStr.size() > mejorSubstring.size()) {
                mejorSubstring = subStr;
            }
        }
    }
    
    // Calcular similitud
    double maxLen = max(cont1, cont2);
    double similarity = (maxLen > 0) ? (mejorSubstring.length() / maxLen) * 100 : 0;
    
    // Crear objeto de resultado
    val result = val::object();
    result.set("algorithm", val("Longest Common Substring (Chunks)"));
    result.set("substring", val(mejorSubstring));
    result.set("length", val((int)mejorSubstring.length()));
    result.set("text1Length", val(cont1));
    result.set("text2Length", val(cont2));
    result.set("similarity", val(similarity));
    result.set("chunksProcessed", val((int)(chunks1.size() * chunks2.size())));
    
    return result;
}

val CompararLCSPorChunks(string text1, string text2, int chunkSize) {
    // Limpiar textos
    int cont1 = 0, cont2 = 0;
    string clean1 = LimpiarTexto(text1, cont1);
    string clean2 = LimpiarTexto(text2, cont2);
    
    // Dividir en chunks
    vector<string> chunks1 = DividirEnChunks(clean1, chunkSize);
    vector<string> chunks2 = DividirEnChunks(clean2, chunkSize);
    
    string mejorSubSecuencia = "";
    
    // Recorremos los chunks en paralelo (uno a uno)
    size_t minChunks = min(chunks1.size(), chunks2.size());
    for (size_t i = 0; i < minChunks; ++i) {
        string subSec = LcSubSecuencia(chunks1[i], chunks2[i]);
        if (subSec.size() > mejorSubSecuencia.size()) {
            mejorSubSecuencia = subSec;
        }
    }
    
    // Calcular similitud
    double maxLen = max(cont1, cont2);
    double similarity = (maxLen > 0) ? (mejorSubSecuencia.length() / maxLen) * 100 : 0;
    
    // Crear objeto de resultado
    val result = val::object();
    result.set("algorithm", val("Longest Common Subsequence (Chunks)"));
    result.set("subsequence", val(mejorSubSecuencia));
    result.set("length", val((int)mejorSubSecuencia.length()));
    result.set("text1Length", val(cont1));
    result.set("text2Length", val(cont2));
    result.set("similarity", val(similarity));
    result.set("chunksProcessed", val((int)minChunks));
    
    return result;
}

// ============================================================================
// LEVENSHTEIN DISTANCE
// ============================================================================

int DistanciaLevenshtein(const string &s1, const string &s2) {
    int n = s1.length();
    int m = s2.length();
    
    if (n == 0) return m;
    if (m == 0) return n;
    
    // Optimización de espacio O(min(n,m))
    // Usamos solo dos filas en lugar de matriz completa
    vector<int> filaAnterior(m + 1);
    vector<int> filaActual(m + 1);
    
    // Inicializar primera fila
    for (int j = 0; j <= m; j++) {
        filaAnterior[j] = j;
    }
    
    // Llenar matriz fila por fila
    for (int i = 1; i <= n; i++) {
        filaActual[0] = i;
        
        for (int j = 1; j <= m; j++) {
            int costo = (s1[i - 1] == s2[j - 1]) ? 0 : 1;
            
            filaActual[j] = min({
                filaAnterior[j] + 1,      // eliminación
                filaActual[j - 1] + 1,    // inserción
                filaAnterior[j - 1] + costo  // sustitución
            });
        }
        
        // Intercambiar filas
        swap(filaAnterior, filaActual);
    }
    
    return filaAnterior[m];
}

val CompararLevenshtein(string text1, string text2, int maxLength) {
    // Limpiar textos
    int cont1 = 0, cont2 = 0;
    string clean1 = LimpiarTexto(text1, cont1);
    string clean2 = LimpiarTexto(text2, cont2);
    
    // Limitar longitud para evitar problemas de memoria
    int len1 = min((int)clean1.length(), maxLength);
    int len2 = min((int)clean2.length(), maxLength);
    
    string s1 = clean1.substr(0, len1);
    string s2 = clean2.substr(0, len2);
    
    // Calcular distancia de Levenshtein
    int distancia = DistanciaLevenshtein(s1, s2);
    
    // Calcular similitud como porcentaje
    // Similitud = 1 - (distancia / max_longitud)
    int maxLen = max(len1, len2);
    double similarity = (maxLen > 0) ? ((1.0 - ((double)distancia / maxLen)) * 100) : 0;
    
    // Asegurar que similitud está en rango [0, 100]
    if (similarity < 0) similarity = 0;
    if (similarity > 100) similarity = 100;
    
    // Crear objeto de resultado
    val result = val::object();
    result.set("algorithm", val("Levenshtein Distance"));
    result.set("distance", val(distancia));
    result.set("similarity", val(similarity));
    result.set("text1Length", val(cont1));
    result.set("text2Length", val(cont2));
    result.set("processedLength1", val(len1));
    result.set("processedLength2", val(len2));
    result.set("maxLengthUsed", val(maxLength));
    
    return result;
}

// ============================================================================
// JACCARD SIMILARITY CON N-GRAMAS
// ============================================================================

vector<string> ExtraerPalabras(const string &texto) {
    vector<string> palabras;
    string palabraActual;
    
    for (char c : texto) {
        if (isalpha(static_cast<unsigned char>(c))) {
            palabraActual += tolower(static_cast<unsigned char>(c));
        } else if (!palabraActual.empty()) {
            palabras.push_back(palabraActual);
            palabraActual.clear();
        }
    }
    
    if (!palabraActual.empty()) {
        palabras.push_back(palabraActual);
    }
    
    return palabras;
}

unordered_set<string> ExtraerNGramasPalabras(const string &texto, int n) {
    unordered_set<string> ngramas;
    vector<string> palabras = ExtraerPalabras(texto);
    
    if (palabras.size() < (size_t)n) {
        // Si hay menos palabras que n, crear n-grama con todas
        string ngrama;
        for (const string &palabra : palabras) {
            if (!ngrama.empty()) ngrama += " ";
            ngrama += palabra;
        }
        if (!ngrama.empty()) {
            ngramas.insert(ngrama);
        }
        return ngramas;
    }
    
    // Crear n-gramas de palabras consecutivas
    for (size_t i = 0; i <= palabras.size() - n; i++) {
        string ngrama;
        for (int j = 0; j < n; j++) {
            if (j > 0) ngrama += " ";
            ngrama += palabras[i + j];
        }
        ngramas.insert(ngrama);
    }
    
    return ngramas;
}

double SimilitudJaccard(const unordered_set<string> &set1, const unordered_set<string> &set2) {
    if (set1.empty() && set2.empty()) return 100.0;
    if (set1.empty() || set2.empty()) return 0.0;
    
    int interseccion = 0;
    for (const string &elem : set1) {
        if (set2.find(elem) != set2.end()) {
            interseccion++;
        }
    }
    
    int unionSize = set1.size() + set2.size() - interseccion;
    
    double similitud = (unionSize > 0) ? ((double)interseccion / unionSize) * 100 : 0;
    
    return similitud;
}

string ObtenerMuestraNGramas(const unordered_set<string> &set1, const unordered_set<string> &set2, int maxMuestras = 5) {
    string muestra;
    int count = 0;
    
    for (const string &elem : set1) {
        if (count >= maxMuestras) break;
        if (set2.find(elem) != set2.end()) {
            if (!muestra.empty()) muestra += " | ";
            muestra += elem;
            count++;
        }
    }
    
    return muestra;
}

val CompararJaccard(string text1, string text2, int nGramaSize) {
    if (nGramaSize < 1) nGramaSize = 1;
    if (nGramaSize > 10) nGramaSize = 10;
    
    // Limpiar textos
    int cont1 = 0, cont2 = 0;
    string clean1 = LimpiarTexto(text1, cont1);
    string clean2 = LimpiarTexto(text2, cont2);
    
    // Extraer n-gramas de palabras
    unordered_set<string> ngramas1 = ExtraerNGramasPalabras(clean1, nGramaSize);
    unordered_set<string> ngramas2 = ExtraerNGramasPalabras(clean2, nGramaSize);
    
    // Calcular similitud de Jaccard
    double similarity = SimilitudJaccard(ngramas1, ngramas2);
    
    // Calcular intersección para estadísticas
    int interseccion = 0;
    for (const string &elem : ngramas1) {
        if (ngramas2.find(elem) != ngramas2.end()) {
            interseccion++;
        }
    }
    
    int unionSize = ngramas1.size() + ngramas2.size() - interseccion;
    
    // Obtener muestra de n-gramas comunes
    string muestraNGramas = ObtenerMuestraNGramas(ngramas1, ngramas2, 5);
    
    val result = val::object();
    result.set("algorithm", val("Jaccard Similarity (N-Grams)"));
    result.set("similarity", val(similarity));
    result.set("nGramaSize", val(nGramaSize));
    result.set("nGramas1Count", val((int)ngramas1.size()));
    result.set("nGramas2Count", val((int)ngramas2.size()));
    result.set("commonNGramas", val(interseccion));
    result.set("unionSize", val(unionSize));
    result.set("sampleCommonNGramas", val(muestraNGramas));
    result.set("text1Length", val(cont1));
    result.set("text2Length", val(cont2));
    
    return result;
}

// ============================================================================
// BINDINGS DE EMSCRIPTEN
// ============================================================================

EMSCRIPTEN_BINDINGS(text_comparison_module) {
    emscripten::function("CompararLCSstrPorChunks", &CompararLCSstrPorChunks);
    emscripten::function("CompararLCSPorChunks", &CompararLCSPorChunks);
    
    emscripten::function("CompararLevenshtein", &CompararLevenshtein);
    
    emscripten::function("CompararJaccard", &CompararJaccard);
    
    emscripten::function("LcSubString", &LcSubString);
    emscripten::function("LcSubSecuencia", &LcSubSecuencia);
}