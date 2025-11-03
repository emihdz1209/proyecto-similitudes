#include <iostream>
#include <vector>
#include <fstream>
#include <cctype>
#include <chrono>
#include <unordered_set>

using namespace std;


string LcSubString(string S1, string S2){
    int n= S1.size();
    int m= S2.size();
    int i_max= 0;
    int subLong= 0;

    vector<vector<int>> lc(n, vector<int>(m,0));

    for(int i=0; i< n; i++){
        for(int j=0; j<m; j++){
            if(S1[i] == S2[j]){
                if(i==0 || j==0){
                    lc[i][j]= 1;
                }
                else {
                    lc[i][j]= lc[i-1][j-1] +1;

                    if(lc[i][j] > subLong){
                        i_max= i;
                        subLong= lc[i][j];
                    }
                }
            }
        }
    }

    string subString= S1.substr(i_max- subLong+1, subLong);

    /*
    //Mostrar la matriz
    cout<<"   ";
    for(int i=0; i<m; i++){
        cout<< S2[i] <<"  ";
    }
    cout<<"\n";

    for(int i=0; i<n; i++){
        cout<< S1[i] <<", ";
        for(int j=0; j<m; j++){
            cout<< lc[i][j] <<", ";
        }
        cout<<"\n";
    }
    cout<<"\n";
    ////
    */

    //cout<< subString;

    return subString;
}



// -------------------------------------------------------------
// Funcion: LcSubSecuencia
// Complejidad temporal: O(n * m)
// Complejidad espacial: O(n * m)
// Donde n y m son las longitudes de las cadenas de entrada.
// Usa programacion dinamica para calcular la subsecuencia comun mas larga (LCS)
// y luego la reconstruye recorriendo la matriz desde el final hacia el inicio.
// -------------------------------------------------------------
string LcSubSecuencia(const string &S1, const string &S2) {
    int n = S1.size();
    int m = S2.size();

    // Matriz DP: lc[i][j] guarda la longitud de la LCS hasta S1[0..i-1], S2[0..j-1]
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




/*
 Complejidad temporal: O(n)
 Complejidad espacial: O(n)

 Donde n es la longitud del string de entrada.

 La funcion recorre cada caracter del string una sola vez (O(n)),
 y puede construir un nuevo string del mismo tamaño en el peor caso (O(n) de espacio).
*/
string LimpiarTexto(const string &S, int& contCaracteres) {
    unordered_set<string> stopwords = {
        //Español
        "el", "la", "los", "las", "de", "del", "y", "a", "en",
        "por", "para", "con", "sin", "que",
        //Ingles
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

        /*
        // Normalizar vocales acentuadas
        switch (c) {
            case 'á': c = 'a'; break;
            case 'é': c = 'e'; break;
            case 'í': c = 'i'; break;
            case 'ó': c = 'o'; break;
            case 'ú': c = 'u'; break;
            case '\n': continue; // eliminar saltos de linea
        }
        */
        

        // Si es letra o espacio, conservarlo
        if (isalpha(static_cast<unsigned char>(c)) || c == ' ') {
            limpio += c;
        }
    }

    // Eliminar stopwords (palabras muy comunes)
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



/*
 Complejidad temporal: O(k * m1 * m2)
 k: cantidad de pares de chunks procesados
 m1, m2: tamaño promedio de cada chunk
*/
void ProcesarPorChunks(const vector<string> &chunks1, const vector<string> &chunks2, int text1_len, int text2_len) {
    string mejorSubSecuencia = "";

    // Recorremos los chunks en paralelo (uno a uno)
    for (size_t i = 0; i < chunks1.size() && i < chunks2.size(); ++i) {
        string subSec = LcSubSecuencia(chunks1[i], chunks2[i]);
        if (subSec.size() > mejorSubSecuencia.size()) mejorSubSecuencia = subSec;
    }

    double promedioLongitud = max(text1_len, text2_len);
    double similitudSubSecuencia = (promedioLongitud > 0) ?
        (mejorSubSecuencia.size() / promedioLongitud) * 100 : 0;

    cout << "Subsecuencia global (por chunks): ------------------\n";
    cout << (mejorSubSecuencia.size() > 500 ? mejorSubSecuencia.substr(0, 500) + "..." : mejorSubSecuencia) << "\n\n";
    cout << "Longitud SubSecuencia: " << mejorSubSecuencia.size() << "\n";
    cout << "Porcentaje de similitud: " << similitudSubSecuencia << "%\n";
}



/*
 Complejidad temporal: O(n1 * n2 * m1 * m2)
 Donde n1 y n2 son la cantidad de chunks de cada texto,
 y m1, m2 son los tamaños de cada chunk.
*/
void ProcesarPorChunksGlobal(const vector<string> &chunks1, const vector<string> &chunks2, int text1_len, int text2_len) {
    string mejorSubstring;

    for (const string &c1 : chunks1) {
        for (const string &c2 : chunks2) {
            string subStr = LcSubString(c1, c2);
            if (subStr.size() > mejorSubstring.size()) mejorSubstring = subStr;
        }
    }

    double promedioLongitud = max(text1_len, text2_len);
    double similitudSubstring = (promedioLongitud > 0) ?
        (mejorSubstring.size() / promedioLongitud) * 100 : 0;

    cout << "Mejor substring global: " 
         << (mejorSubstring.size() > 500 ? mejorSubstring.substr(0, 500) + "..." : mejorSubstring) << "\n";
    cout << "Longitud SubString: " << mejorSubstring.size() << "\n";
    cout << "Porcentaje de similitud: " << similitudSubstring << "%\n";
}



/*
 Complejidad temporal: O(n)
 Complejidad espacial: O(n)
 Lee un archivo completo, lo limpia y lo divide en chunks del tamaño dado.
*/
vector<string> LeerYLimpiarPorChunks(const string &ruta, int &contCaracteres, size_t chunkSize = 50000) {
    ifstream in(ruta);
    vector<string> chunks;

    if (!in) {
        cout << "No se pudo abrir el archivo: " << ruta << endl;
        return chunks;
    }

    string raw;
    while (!in.eof()) {
        raw.resize(chunkSize);
        in.read(&raw[0], chunkSize);
        raw.resize(in.gcount());

        if (!raw.empty()) {
            string limpio = LimpiarTexto(raw, contCaracteres);
            if (!limpio.empty()) chunks.push_back(limpio);
        }
    }

    return chunks;
}






int main() {
    string archivo1 = "libro1.txt";
    string archivo2 = "libro2.txt";

    int text1_len = 0, text2_len = 0;

    // Leer y limpiar los textos una sola vez
    vector<string> chunks1 = LeerYLimpiarPorChunks(archivo1, text1_len);
    vector<string> chunks2 = LeerYLimpiarPorChunks(archivo2, text2_len);

    auto inicio = chrono::high_resolution_clock::now();

    ProcesarPorChunks(chunks1, chunks2, text1_len, text2_len);
    ProcesarPorChunksGlobal(chunks1, chunks2, text1_len, text2_len);

    auto fin = chrono::high_resolution_clock::now();
    chrono::duration<double> duracion = fin - inicio;

    cout << "Tiempo de ejecucion: " << duracion.count() << " segundos\n";

    return 0;
}

