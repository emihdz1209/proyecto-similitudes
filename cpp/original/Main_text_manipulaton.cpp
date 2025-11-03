#include <emscripten/bind.h>
#include <emscripten/val.h>
#include <string>
#include <vector>
#include <algorithm>
#include <unordered_set>

using namespace emscripten;
using namespace std;

// ============================================================================
// FUNCIONES ORIGINALES - SIN MODIFICAR
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
// NUEVAS FUNCIONES PARA PROCESAMIENTO POR CHUNKS
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
    
    // Encontrar la mejor subsecuencia procesando chunks en paralelo
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
// FUNCIONES WRAPPER ORIGINALES (para compatibilidad)
// ============================================================================

val CompararLCSstr(string text1, string text2) {
    int len1 = text1.length();
    int len2 = text2.length();
    
    // Limpiar textos
    int cont1 = 0, cont2 = 0;
    string clean1 = LimpiarTexto(text1, cont1);
    string clean2 = LimpiarTexto(text2, cont2);
    
    // Encontrar substring común
    string substring = LcSubString(clean1, clean2);
    
    // Calcular similitud
    double maxLen = max(cont1, cont2);
    double similarity = (maxLen > 0) ? (substring.length() / maxLen) * 100 : 0;
    
    // Crear objeto de resultado
    val result = val::object();
    result.set("algorithm", val("Longest Common Substring"));
    result.set("substring", val(substring));
    result.set("length", val((int)substring.length()));
    result.set("text1Length", val(cont1));
    result.set("text2Length", val(cont2));
    result.set("similarity", val(similarity));
    
    return result;
}

val CompararLCS(string text1, string text2) {
    int len1 = text1.length();
    int len2 = text2.length();
    
    // Limpiar textos
    int cont1 = 0, cont2 = 0;
    string clean1 = LimpiarTexto(text1, cont1);
    string clean2 = LimpiarTexto(text2, cont2);
    
    // Encontrar subsecuencia común
    string subsequence = LcSubSecuencia(clean1, clean2);
    
    // Calcular similitud
    double maxLen = max(cont1, cont2);
    double similarity = (maxLen > 0) ? (subsequence.length() / maxLen) * 100 : 0;
    
    // Crear objeto de resultado
    val result = val::object();
    result.set("algorithm", val("Longest Common Subsequence"));
    result.set("subsequence", val(subsequence));
    result.set("length", val((int)subsequence.length()));
    result.set("text1Length", val(cont1));
    result.set("text2Length", val(cont2));
    result.set("similarity", val(similarity));
    
    return result;
}

string PreprocesarTexto(string text) {
    int contador = 0;
    return LimpiarTexto(text, contador);
}

// ============================================================================
// BINDINGS DE EMSCRIPTEN
// ============================================================================

EMSCRIPTEN_BINDINGS(text_comparison_module) {
    // Funciones originales
    emscripten::function("CompararLCSstr", &CompararLCSstr);
    emscripten::function("CompararLCS", &CompararLCS);
    emscripten::function("PreprocesarTexto", &PreprocesarTexto);
    
    // Nuevas funciones con chunks
    emscripten::function("CompararLCSstrPorChunks", &CompararLCSstrPorChunks);
    emscripten::function("CompararLCSPorChunks", &CompararLCSPorChunks);
    
    // Funciones básicas
    emscripten::function("LcSubString", &LcSubString);
    emscripten::function("LcSubSecuencia", &LcSubSecuencia);
}