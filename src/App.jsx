import { useEffect, useState } from 'react'
import './App.css'
import { supabase } from './lib/supabaseClient'
import BookCard from './components/BookCard'
import BookForm from './components/BookForm'
import BottomNav from './components/BottomNav'
import Login from './components/Login'
import Register from './components/Register'
import Profile from './components/Profile'
import UserSearch from './components/UserSearch'
import UserProfile from './components/UserProfile'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showRegister, setShowRegister] = useState(false)

  const [books, setBooks] = useState([])

  const [showBookForm, setShowBookForm] = useState(false)
  const [editingBook, setEditingBook] = useState(null)
  const [currentPage, setCurrentPage] = useState('home')
  const [selectedUser, setSelectedUser] = useState(null)

  async function loadBooks(userId) {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error(
        'Fout bij laden van boeken:',
        error,
      )
      return
    }

    setBooks(data)
  }

  useEffect(() => {
    async function getSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      setSession(session)
      setLoading(false)
    }

    getSession()

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

  useEffect(() => {
    if (session?.user) {
      loadBooks(session.user.id)
    }
  }, [session])

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
      console.error(
        'Fout bij toevoegen van boek:',
        error,
      )

      alert(
        'Het boek kon niet worden opgeslagen.',
      )

      return
    }

    setBooks((currentBooks) => [
      data,
      ...currentBooks,
    ])

    setShowBookForm(false)
  }

  function handleEditBook(book) {
    setEditingBook(book)
    setShowBookForm(true)
  }

  async function handleUpdateBook(updatedBook) {
    if (!session?.user) {
      return
    }

    const { data, error } = await supabase
      .from('books')
      .update({
        title: updatedBook.title,
        author: updatedBook.author,
        rating: updatedBook.rating,
        cover: updatedBook.cover,
      })
      .eq('id', updatedBook.id)
      .eq('user_id', session.user.id)
      .select()
      .single()

    if (error) {
      console.error(
        'Fout bij bewerken van boek:',
        error,
      )

      alert(
        'Het boek kon niet worden aangepast.',
      )

      return
    }

    setBooks((currentBooks) =>
      currentBooks.map((book) =>
        book.id === updatedBook.id
          ? data
          : book,
      ),
    )

    setEditingBook(null)
    setShowBookForm(false)
  }

  async function handleDeleteBook(bookId) {
    const confirmed = window.confirm(
      'Weet je zeker dat je dit boek wilt verwijderen?',
    )

    if (!confirmed) {
      return
    }

    if (!session?.user) {
      return
    }

    const { error } = await supabase
      .from('books')
      .delete()
      .eq('id', bookId)
      .eq('user_id', session.user.id)

    if (error) {
      console.error(
        'Fout bij verwijderen van boek:',
        error,
      )

      alert(
        'Het boek kon niet worden verwijderd.',
      )

      return
    }

    setBooks((currentBooks) =>
      currentBooks.filter(
        (book) => book.id !== bookId,
      ),
    )
  }

  function handleCloseForm() {
    setShowBookForm(false)
    setEditingBook(null)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    setCurrentPage('home')
    setSelectedUser(null)
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
      {currentPage === 'profile' ? (
        <Profile
          user={session.user}
          bookCount={books.length}
          onLogout={handleLogout}
        />
      ) : (
        <>
          <header className="header">
            <h1>📚 MaiBookStory</h1>
            <p>Jouw persoonlijke boekenwereld</p>
          </header>

          <main className="main-content">
            {selectedUser ? (
              <UserProfile
                user={selectedUser}
                onBack={() => setSelectedUser(null)}
              />
            ) : (
              <>
                <UserSearch
                  onUserSelect={setSelectedUser}
                />

                <section className="library-header">
  <div>
    <h2>Mijn boeken</h2>

    <p>
      {books.length === 0
        ? 'Begin je persoonlijke bibliotheek'
        : `${books.length} ${
            books.length === 1
              ? 'boek'
              : 'boeken'
          } in je bibliotheek`}
    </p>
  </div>
</section>

                {books.length === 0 ? (
                  <div className="empty-library">
                    <div className="empty-icon">
                      📚
                    </div>

                    <h2>Nog geen boeken</h2>

                    <p>
                      Voeg je eerste boek toe aan
                      je persoonlijke bibliotheek.
                    </p>

                    <button
                      className="empty-add-button"
                      onClick={() =>
                        setShowBookForm(true)
                      }
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
              </>
            )}
          </main>
        </>
      )}

      <BottomNav
        currentPage={currentPage}
        onPageChange={(page) => {
          setCurrentPage(page)

          if (page === 'home') {
            setSelectedUser(null)
          }
        }}
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