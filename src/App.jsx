import { useEffect, useState } from 'react'
import './App.css'
import { supabase } from './lib/supabaseClient'
import BookCard from './components/BookCard'
import BookForm from './components/BookForm'
import BottomNav from './components/BottomNav'
import Login from './components/Login'
import Register from './components/Register'

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
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showRegister, setShowRegister] = useState(false)

  const [books, setBooks] = useState([])

  const [showBookForm, setShowBookForm] = useState(false)
  const [editingBook, setEditingBook] = useState(null)

  useEffect(() => {
    async function getSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      setSession(session)
      setLoading(false)
    }

    getSession()

    async function loadBooks(userId) {
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Fout bij laden van boeken:', error)
    return
  }

  setBooks(data)
}

useEffect(() => {
  if (session?.user) {
    loadBooks(session.user.id)
  }
}, [session])

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
      },
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  async function handleAddBook(book) {
  if (!session?.user) {
    return
  }

  const { data, error } = await supabase
    .from('books')
    .insert({
      user_id: session.user.id,
      title: book.title,
      author: book.author,
      rating: book.rating,
      cover: book.cover,
    })
    .select()
    .single()

  if (error) {
    console.error('Fout bij toevoegen van boek:', error)
    alert('Het boek kon niet worden opgeslagen.')
    return
  }

  setBooks((currentBooks) => [
    ...currentBooks,
    data,
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

  if (loading) {
    return <div>Even laden...</div>
  }

  if (!session) {
  if (showRegister) {
    return (
      <Register
        onLogin={() => {
          setShowRegister(false)
        }}
      />
    )
  }

  return (
    <Login
      onRegister={() => {
        setShowRegister(true)
      }}
    />
  )
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