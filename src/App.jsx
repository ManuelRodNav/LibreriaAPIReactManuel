import { useState, useEffect, useRef } from 'react';
import './App.css';

const listadelibros = 'books.json';

function App() {
  const [booklist, setBooklist] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [isbn, setIsbn] = useState(""); 
  const [searchTerm, setSearchTerm] = useState("");
  const inputSearch = useRef(null);
  const pageSearch = useRef(null);
  const [listofgenres, setGenres] = useState([]);
  const [genretosearch, setGenreToSearch] = useState("");
  const [savedBooks, setSavedBooks] = useState(() => {
    const saved = localStorage.getItem('items');
    return saved ? JSON.parse(saved) : [];
  });
  const [showlistadelibros, setshowlistadelibros] = useState(false);

  useEffect(() => {
    localStorage.setItem('items', JSON.stringify(savedBooks));
    console.log("SavedBooks updated and stored in localStorage", savedBooks);
  }, [savedBooks]);

  useEffect(() => {
    fetch(listadelibros)
      .then(response => response.json())
      .then(data => {
        const books = data.library.map(item => item.book);
        setBooklist(books);
        setFilteredBooks(books);
      })
      .catch(error => {
        console.error('Error fetching books:', error);
      });
  }, []);

  useEffect(() => {
    const genreSet = new Set(booklist.map(book => book.genre));
    const genreList = Array.from(genreSet);
    setGenres(genreList);
  }, [booklist]);

  const searchBookByTitle = (event) => {
    event.preventDefault();
    const searchTerm = inputSearch.current.value.toLowerCase();
    setSearchTerm(searchTerm);
    const searchResults = booklist.filter(book => book.title.toLowerCase().includes(searchTerm));
    if (searchResults.length > 0) {
      setFilteredBooks(searchResults);
    } else {
      alert('No se encontró ningún libro que contenga ' + searchTerm);
    }
  };

  const filterByPages = (event) => {
    event.preventDefault();
    const minPages = parseInt(pageSearch.current.value, 10);
    if (isNaN(minPages)) {
      alert('Por favor, introduce un número válido para el número de páginas.');
      return;
    }
    const booksWithPages = booklist.filter(book => book.pages >= minPages);
    setFilteredBooks(booksWithPages);
  };

  const filterByGenre = (genre) => {
    const booksByGenre = booklist.filter((book) => book.genre === genre || book.genre.includes(genre));
    setFilteredBooks(booksByGenre);
  };

  useEffect(() => {
    if (genretosearch !== "") {
      filterByGenre(genretosearch);
    } else {
      setFilteredBooks(booklist);
    }
  }, [genretosearch, booklist]);

  const LectureList = () => {
    return (
      <div>
        <button onClick={() => setshowlistadelibros(false)} className='backbutton'>Volver</button> 
        <div className='container'>
          <h2 style={{ position: "fixed", top: "10px", margin: "20px" }}>Lista de libros guardados</h2>
        </div>
        <ul className='librarylist'>
          {savedBooks.length > 0 ? savedBooks.map((book, index) => (
            <li key={index}>
              <img onClick={() => { setIsbn(book.ISBN); setshowlistadelibros(false); }} src={book.cover} alt={`${book.title} cover`} />
              {book.title}
            </li>
          )) : <div>No hay libros guardados.</div>}
        </ul>
      </div>
    );
  };

  const Appbar = () => {
    return (
      <div className='flexcontainer'>
        <div className='container'>
          <h4 className='listadelibros' onClick={() => setshowlistadelibros(true)}>Lista de Lectura</h4>
        </div>
        <div className='appbar'>
          <h2 style={{ display: "inline-block", whiteSpace: "nowrap" }}>Buscar Libro:</h2>
          <h4>Título</h4>
          <form onSubmit={searchBookByTitle}>
            <input 
              ref={inputSearch}
              type='text' 
              placeholder='1984, La llamada de Cthulhu, etc...'  
            />
          </form>
          <form onSubmit={filterByPages}>
            <h4 style={{ whiteSpace: "nowrap" }}>Nº Páginas</h4>
            <input 
              type='text' 
              ref={pageSearch}
              placeholder='nº de páginas mínimas'  
            />
          </form>
          <select value={genretosearch} onChange={(e) => setGenreToSearch(e.target.value)}>
            <option value="">Todos</option>
            {listofgenres.map((genre, index) => (
              <option key={index} value={genre}>
                {genre}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  };

  const setGuardar = (isbn) => {
    const library = filteredBooks.find((libro) => libro.ISBN === isbn);
    if (library && !savedBooks.some((book) => book.ISBN === isbn)) {
      setSavedBooks((prevSavedBooks) => [
        ...prevSavedBooks,
        { title: library.title, cover: library.cover, ISBN: library.ISBN, boolean: false }
      ]);
    }
  };

  const unsetGuardar = (isbn) => {
    const library = filteredBooks.find((libro) => libro.ISBN === isbn);
    if (library && savedBooks.some((book) => book.ISBN === isbn)) {
      setSavedBooks((prevSavedBooks) =>
        prevSavedBooks.filter((book) => book.ISBN !== isbn)
      );
    }
  };

  const DetailBookList = ({ isbn, booklist }) => {
    const book = booklist.find(book => book.ISBN === isbn);
    if (!book) {
      return <div>Book not found</div>;
    }

    const backFromDetail = () => {
      setIsbn("");
    };

    const areinthelist = savedBooks.some((savedBook) => savedBook.ISBN === isbn);

    return (
      <div>
        <button className={'backbutton'} onClick={backFromDetail}>Atrás</button>
        <div className='bookandtitle'>
          <img src={book.cover} alt={`${book.title} cover`} />
          <div className='titlesynopsis'>
            <h3>{book.title}</h3>
            <em>"{book.synopsis}"</em>
            <div className='rowbuttons'>
              <button className='guardar' style={{ backgroundColor: areinthelist ? "purple" : "black", color: "white"}} onClick={() => areinthelist ? unsetGuardar(book.ISBN) : setGuardar(book.ISBN) }> {
                areinthelist
                ? "Guardado"
                : "Guardar"
              } </button>
            </div>
          </div>
        </div>
        <ul className='databooklist'>
          <li><strong>Páginas:</strong> {book.pages}</li>
          <li><strong>Año de publicación:</strong> {book.year}</li>
          <li><strong>Género:</strong> {book.genre}</li>
        </ul>
        <h4>Otros libros de: {book.author.name}</h4>
        <div>
          <ul className='otherbookslits'>
            {book.author.otherBooks.map((otherBook, idx) => (
              <li key={idx}>{otherBook}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  const ErrorPage = () => (
    <div>
      <h1>Oops... Ocurrió algún error</h1>
    </div>
  );

  const UIList = () => (
    <>
      <h2 className='numberpagesbook'>
        {pageSearch.current && pageSearch.current.value 
          ? `Hay ${filteredBooks.length} libros que tienen ${pageSearch.current.value} páginas` 
          : inputSearch.current && inputSearch.current.value 
          ? `Hay ${filteredBooks.length} libros que tienen como título o contienen ${inputSearch.current.value}` 
          : genretosearch !== "" 
          ? `Hay ${filteredBooks.length} libros en la categoría ${genretosearch}` 
          : ""}
      </h2>
      <ul className='librarylist'>
        {filteredBooks.map((book, index) => (
          <li key={index}>
            <img onClick={() => setIsbn(book.ISBN)} src={book.cover} alt={`${book.title} cover`} />
            <div className='info'></div>
            <h3>{book.title}</h3>
          </li>
        ))}
      </ul>
    </>
  );

  return (
    <>
      {isbn === "" && showlistadelibros === false ? (
        <>
          <Appbar />
          <UIList />
        </>
      ) : showlistadelibros === true ? (
        <LectureList />
      ) : isbn !== "" ? (
        <DetailBookList isbn={isbn} booklist={filteredBooks} />
      ) : (
        <ErrorPage />
      )}
    </>
  );
}

export default App;
