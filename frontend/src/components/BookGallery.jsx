import { useState, useEffect } from "react";
import { BookOpen, Check, Loader2 } from "lucide-react";

export default function BookGallery({ onCompare }) {
  const [books, setBooks] = useState([]);
  const [selectedBooks, setSelectedBooks] = useState([]);
  const [loading, setLoading] = useState(false);

  // Cargar libros disponibles
  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    // Por ahora, libros de ejemplo
    // TODO: Cargar dinámicamente desde /assets
    const exampleBooks = [
      {
        id: 1,
        title: "Resonance in Singing and Speaking",
        author: "Thomas Fillebrown",
        cover: "/assets/covers/Resonance-in-Singing-and-Speaking.jpg",
        textFile: "/assets/texts/Resonance-in-Singing-and-Speaking.txt",
        year: 2006,
      },
      {
        id: 2,
        title: "Dorothy and the Wizard in Oz",
        author: "L. Frank Baum",
        cover: "/assets/covers/Dorothy-and-the-Wizard-in-Oz.jpg",
        textFile: "/assets/texts/Dorothy-and-the-Wizard-in-Oz.txt",
        year: 1967,
      },
      {
        id: 3,
        title: "The Yellow Wallpaper",
        author: "Charlotte Perkins Gilman",
        cover: "/assets/covers/The-Yellow-Wallpaper.jpg",
        textFile: "/assets/texts/The-Yellow-Wallpaper.txt",
        year: 1967,
      },
    ];

    setBooks(exampleBooks);
  };

  const toggleBookSelection = (book) => {
    if (selectedBooks.find((b) => b.id === book.id)) {
      setSelectedBooks(selectedBooks.filter((b) => b.id !== book.id));
    } else {
      if (selectedBooks.length < 2) {
        setSelectedBooks([...selectedBooks, book]);
      } else {
        // Reemplazar el primero
        setSelectedBooks([selectedBooks[1], book]);
      }
    }
  };

  const handleCompare = async () => {
    if (selectedBooks.length !== 2) {
      alert("Selecciona exactamente 2 libros para comparar");
      return;
    }

    setLoading(true);
    try {
      await onCompare(selectedBooks[0], selectedBooks[1]);
    } catch (error) {
      console.error("Error al comparar:", error);
      alert("Error al comparar libros");
    } finally {
      setLoading(false);
    }
  };

  const isSelected = (bookId) => {
    return selectedBooks.find((b) => b.id === bookId) !== undefined;
  };

  const getSelectionOrder = (bookId) => {
    const index = selectedBooks.findIndex((b) => b.id === bookId);
    return index >= 0 ? index + 1 : null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Biblioteca</h2>
          <p className="text-gray-600 mt-1">
            Selecciona 2 libros para comparar ({selectedBooks.length}/2)
          </p>
        </div>

        {selectedBooks.length === 2 && (
          <button
            onClick={handleCompare}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Comparando...</span>
              </>
            ) : (
              <>
                <BookOpen className="h-5 w-5" />
                <span>Comparar Libros</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Gallery */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {books.map((book) => {
          const selected = isSelected(book.id);
          const order = getSelectionOrder(book.id);

          return (
            <div
              key={book.id}
              onClick={() => toggleBookSelection(book)}
              className={`
                relative cursor-pointer group
                bg-white rounded-lg shadow-md overflow-hidden
                transition-all duration-300 transform hover:scale-105 hover:shadow-xl
                ${selected ? "ring-4 ring-blue-500 scale-105" : ""}
              `}
            >
              {/* Cover Image */}
              <div className="aspect-[2/3] bg-gradient-to-br from-gray-200 to-gray-300 relative overflow-hidden">
                <img
                  src={book.cover}
                  alt={book.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback si no existe la imagen
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />

                {/* Fallback cuando no hay imagen */}
                <div
                  className="absolute inset-0 hidden items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600"
                  style={{ display: "none" }}
                >
                  <BookOpen className="h-20 w-20 text-white opacity-50" />
                </div>

                {/* Selection Badge */}
                {selected && (
                  <div className="absolute top-3 right-3 bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg shadow-lg">
                    {order}
                  </div>
                )}

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                  {!selected && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-white rounded-full p-3">
                        <Check className="h-8 w-8 text-blue-600" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Book Info */}
              <div className="p-4">
                <h3 className="font-bold text-gray-900 line-clamp-2 mb-1">
                  {book.title}
                </h3>
                <p className="text-sm text-gray-600 mb-2">{book.author}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{book.year}</span>
                  <span>{book.pages} pág.</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Books Preview */}
      {selectedBooks.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3">
            Libros Seleccionados:
          </h3>
          <div className="flex flex-wrap gap-3">
            {selectedBooks.map((book, index) => (
              <div
                key={book.id}
                className="flex items-center space-x-2 bg-white rounded-lg px-4 py-2 shadow-sm"
              >
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {book.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
