import { useEffect, useState } from 'react'
import './App.css'
import BookCard from './components/BookCard'
import BookForm from './components/BookForm'
import BottomNav from './components/BottomNav'

const defaultBooks = [
  {
    id: 1,
    title: 'Harry Potter en de Steen der Wijzen',
    author: 'J.K. Rowling',
    rating: 5,
    cover:
      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600',
  },
  {
    id: 2,
    title: 'Dune',
    author: 'Frank Herbert',
    rating: 4,
    cover:
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600',
  },
  {
    id: 3,
    title: '1984',
    author: 'George Orwell',
    rating: 5,
    cover:
      'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600',
  },
]

function App() {
  const [books, setBooks] = useState(() => {
    const savedBooks = localStorage.getItem('books')

    return savedBooks ? JSON.parse(savedBooks) : defaultBooks
  })

  const [showBookForm, setShowBookForm] = useState(false)
  const [editingBook, setEditingBook] = useState(null)

  useEffect(() => {
    localStorage.setItem('books', JSON.stringify(books))
  }, [books])

  function handleAddBook(book) {
    setBooks((currentBooks) => [
      ...currentBooks,
      {
        ...book,
        id: Date.now(),
      },
    ])

    setShowBookForm(false)
  }

  function handleEditBook(book) {
    setEditingBook(book)
    setShowBookForm(true)
  }

  function handleUpdateBook(updatedBook) {
    setBooks((currentBooks) =>
      currentBooks.map((book) =>
        book.id === updatedBook.id ? updatedBook : book,
      ),
    )

    setEditingBook(null)
    setShowBookForm(false)
  }

  function handleDeleteBook(bookId) {
    const confirmed = window.confirm(
      'Weet je zeker dat je dit boek wilt verwijderen?',
    )

    if (!confirmed) {
      return
    }

    setBooks((currentBooks) =>
      currentBooks.filter((book) => book.id !== bookId),
    )
  }

  function handleCloseForm() {
    setShowBookForm(false)
    setEditingBook(null)
  }

  return (
    <div className="app">
      <header className="header">
        <h1>📚 Bookshelf</h1>
      </header>

      <main className="main-content">
        <section className="library-header">
          <div>
            <h2>Jouw boeken</h2>
            <p>
              {books.length} {books.length === 1 ? 'boek' : 'boeken'}
            </p>
          </div>

          <button
            className="add-book-button"
            onClick={() => {
              setEditingBook(null)
              setShowBookForm(true)
            }}
          >
            <span>＋</span>
            Boek toevoegen
          </button>
        </section>

        {books.length === 0 ? (
          <div className="empty-library">
            <div className="empty-icon">📚</div>

            <h2>Nog geen boeken</h2>

            <p>
              Voeg je eerste boek toe aan je persoonlijke bibliotheek.
            </p>

            <button
              className="empty-add-button"
              onClick={() => setShowBookForm(true)}
            >
              ＋ Eerste boek toevoegen
            </button>
          </div>
        ) : (
          <section className="book-grid">
            {books.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onEdit={handleEditBook}
                onDelete={handleDeleteBook}
              />
            ))}
          </section>
        )}
      </main>

      <BottomNav
        onAddBook={() => {
          setEditingBook(null)
          setShowBookForm(true)
        }}
      />

      {showBookForm && (
        <BookForm
          book={editingBook}
          onAdd={handleAddBook}
          onUpdate={handleUpdateBook}
          onClose={handleCloseForm}
        />
      )}
    </div>
  )
}

export default App

