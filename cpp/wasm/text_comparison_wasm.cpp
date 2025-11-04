#include <emscripten/bind.h>
#include <emscripten/val.h>
#include <string>
#include <vector>
#include <algorithm>
#include <unordered_set>
#include <numeric>

using namespace emscripten;
using namespace std;

// ============================================================================
// FUNCIONES ORIGINALES (LCS y LCSstr)
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

    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= m; j++) {
            if (S1[i - 1] == S2[j - 1]) {
                lc[i][j] = lc[i - 1][j - 1] + 1;
            } else {
                lc[i][j] = max(lc[i - 1][j], lc[i][j - 1]);
            }
        }
    }

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
        "el", "la", "los", "las", "de", "del", "y", "a", "en",
        "por", "para", "con", "sin", "que",
        "and", "for", "so", "or", "not", "if", "as",
        "the", "a", "an", "to", "of", "at",
    };

    string limpio;
    string palabra;

    for (size_t i = 0; i < S.size(); ++i) {
        char c = S[i];
        contCaracteres++;
        c = tolower(static_cast<unsigned char>(c));

        if (isalpha(static_cast<unsigned char>(c)) || c == ' ') {
            limpio += c;
        }
    }

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

    if (!palabraTemp.empty() && stopwords.find(palabraTemp) == stopwords.end()) {
        resultado += palabraTemp;
    }

    return resultado;
}

// ============================================================================
// CHUNKS (LCS/LCSstr)
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
    int cont1 = 0, cont2 = 0;
    string clean1 = LimpiarTexto(text1, cont1);
    string clean2 = LimpiarTexto(text2, cont2);
    
    vector<string> chunks1 = DividirEnChunks(clean1, chunkSize);
    vector<string> chunks2 = DividirEnChunks(clean2, chunkSize);
    
    string mejorSubstring = "";
    
    for (const string &c1 : chunks1) {
        for (const string &c2 : chunks2) {
            string subStr = LcSubString(c1, c2);
            if (subStr.size() > mejorSubstring.size()) {
                mejorSubstring = subStr;
            }
        }
    }
    
    double maxLen = max(cont1, cont2);
    double similarity = (maxLen > 0) ? (mejorSubstring.length() / maxLen) * 100 : 0;
    
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
    int cont1 = 0, cont2 = 0;
    string clean1 = LimpiarTexto(text1, cont1);
    string clean2 = LimpiarTexto(text2, cont2);
    
    vector<string> chunks1 = DividirEnChunks(clean1, chunkSize);
    vector<string> chunks2 = DividirEnChunks(clean2, chunkSize);
    
    string mejorSubSecuencia = "";
    
    size_t minChunks = min(chunks1.size(), chunks2.size());
    for (size_t i = 0; i < minChunks; ++i) {
        string subSec = LcSubSecuencia(chunks1[i], chunks2[i]);
        if (subSec.size() > mejorSubSecuencia.size()) {
            mejorSubSecuencia = subSec;
        }
    }
    
    double maxLen = max(cont1, cont2);
    double similarity = (maxLen > 0) ? (mejorSubSecuencia.length() / maxLen) * 100 : 0;
    
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
// DISTANCIA DE LEVENSHTEIN (Optimizada en espacio)
// ============================================================================

size_t DistanciaLevenshtein(const string& s1, const string& s2) {
    const size_t tam1 = s1.size();
    const size_t tam2 = s2.size();
    
    // Optimización: usar string más corta para el vector
    if (tam1 > tam2) {
        return DistanciaLevenshtein(s2, s1);
    }
    
    // Vector con distancias (solo necesitamos una fila)
    vector<size_t> distancias(tam2 + 1);
    iota(distancias.begin(), distancias.end(), size_t{0});
    
    // Procesar cada carácter de s1
    for (size_t i = 0; i < tam1; ++i) {
        size_t diagonal_previa = distancias[0];
        distancias[0] = i + 1;
        
        for (size_t j = 0; j < tam2; ++j) {
            size_t guardar_diagonal = distancias[j + 1];
            
            if (s1[i] == s2[j]) {
                distancias[j + 1] = diagonal_previa;
            } else {
                distancias[j + 1] = min({
                    distancias[j] + 1,
                    distancias[j + 1] + 1,
                    diagonal_previa + 1
                });
            }
            
            diagonal_previa = guardar_diagonal;
        }
    }
    
    return distancias[tam2];
}

val CompararLevenshtein(string text1, string text2, int maxLength) {
    int cont1 = 0, cont2 = 0;
    string clean1 = LimpiarTexto(text1, cont1);
    string clean2 = LimpiarTexto(text2, cont2);
    
    // Limitar tamaño para evitar problemas de memoria
    if (clean1.length() > maxLength) clean1 = clean1.substr(0, maxLength);
    if (clean2.length() > maxLength) clean2 = clean2.substr(0, maxLength);
    
    size_t distancia = DistanciaLevenshtein(clean1, clean2);
    
    // Calcular similitud normalizada
    size_t maxLen = max(clean1.length(), clean2.length());
    double similarity = (maxLen > 0) ? (1.0 - (double)distancia / maxLen) * 100 : 100.0;
    
    val result = val::object();
    result.set("algorithm", val("Levenshtein Distance"));
    result.set("distance", val((int)distancia));
    result.set("similarity", val(similarity));
    result.set("text1Length", val(cont1));
    result.set("text2Length", val(cont2));
    result.set("processedLength1", val((int)clean1.length()));
    result.set("processedLength2", val((int)clean2.length()));
    result.set("maxLengthUsed", val(maxLength));
    
    return result;
}

// ============================================================================
// SIMILITUD DE JACCARD CON N-GRAMAS
// ============================================================================

unordered_set<string> ExtraerNGramas(const string& texto, int n) {
    unordered_set<string> ngramas;
    
    if (texto.length() < n) {
        ngramas.insert(texto);
        return ngramas;
    }
    
    for (size_t i = 0; i <= texto.length() - n; i++) {
        ngramas.insert(texto.substr(i, n));
    }
    
    return ngramas;
}

size_t TamanoInterseccion(const unordered_set<string>& conjunto1, 
                          const unordered_set<string>& conjunto2) {
    size_t cuenta = 0;
    
    const auto& menor = (conjunto1.size() < conjunto2.size()) ? conjunto1 : conjunto2;
    const auto& mayor = (conjunto1.size() < conjunto2.size()) ? conjunto2 : conjunto1;
    
    for (const auto& elem : menor) {
        if (mayor.find(elem) != mayor.end()) {
            cuenta++;
        }
    }
    
    return cuenta;
}

val CompararJaccard(string text1, string text2, int nGramaSize) {
    int cont1 = 0, cont2 = 0;
    string clean1 = LimpiarTexto(text1, cont1);
    string clean2 = LimpiarTexto(text2, cont2);
    
    // Extraer n-gramas
    unordered_set<string> ngramas1 = ExtraerNGramas(clean1, nGramaSize);
    unordered_set<string> ngramas2 = ExtraerNGramas(clean2, nGramaSize);
    
    // Calcular intersección y unión
    size_t interseccion = TamanoInterseccion(ngramas1, ngramas2);
    size_t unionTam = ngramas1.size() + ngramas2.size() - interseccion;
    
    // Calcular similitud de Jaccard
    double similarity = (unionTam > 0) ? ((double)interseccion / unionTam) * 100 : 100.0;
    
    // Generar muestra de n-gramas comunes (máximo 10)
    string muestraNGramas = "";
    int count = 0;
    for (const auto& ngrama : ngramas1) {
        if (count >= 10) break;
        if (ngramas2.find(ngrama) != ngramas2.end()) {
            if (count > 0) muestraNGramas += ", ";
            muestraNGramas += ngrama;
            count++;
        }
    }
    
    val result = val::object();
    result.set("algorithm", val("Jaccard Similarity (N-Grams)"));
    result.set("similarity", val(similarity));
    result.set("nGramaSize", val(nGramaSize));
    result.set("nGramas1Count", val((int)ngramas1.size()));
    result.set("nGramas2Count", val((int)ngramas2.size()));
    result.set("commonNGramas", val((int)interseccion));
    result.set("unionSize", val((int)unionTam));
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