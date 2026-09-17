import { useEffect, useState } from 'react'
import './App.css'
import { supabase } from './lib/supabaseClient'
import {
  getOfflineBooks,
  saveOfflineBooks,
  saveOfflineBook,
  addToSyncQueue,
  getSyncQueue,
  removeFromSyncQueue,
  deleteOfflineBook,
} from './lib/offlineStorage'
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
  const [deleteBook, setDeleteBook] = useState(null)

async function loadBooks(userId) {
  const {
    data,
    error,
  } = await supabase
    .from('books')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', {
      ascending: false,
    })

  if (error) {
    console.warn(
      'Geen verbinding met Supabase. Offline boeken worden geladen.',
    )

    const offlineBooks =
      await getOfflineBooks(userId)

    setBooks(offlineBooks)

    return
  }

  setBooks(data || [])

  await saveOfflineBooks(
    userId,
    data || [],
  )
}

  useEffect(() => {
    function handleDeleteRequest(event) {
  setDeleteBook(event.detail)
}

window.addEventListener(
  'request-book-delete',
  handleDeleteRequest,
)
    async function getSession() {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  setSession(session)
  setLoading(false)

  if (session?.user) {
    loadBooks(session.user.id)
  }
}

    getSession()

    const {
  data: { subscription },
} = supabase.auth.onAuthStateChange(
  (_event, session) => {
    setSession(session)

    if (session?.user) {
      setTimeout(() => {
        loadBooks(session.user.id)
      }, 0)
    } else {
      setBooks([])
    }
  },
)

    window.addEventListener(
  'online',
  syncOfflineBooks,
)
    return () => {
      window.removeEventListener(
  'request-book-delete',
  handleDeleteRequest,
)
      subscription.unsubscribe()
    }
  }, [])

  async function syncOfflineBooks() {
  if (!session?.user) {
    return
  }

  if (!navigator.onLine) {
    return
  }

  const queue = await getSyncQueue()

  for (const operation of queue) {
    if (operation.type !== 'create') {
      continue
    }

    if (operation.user_id !== session.user.id) {
      continue
    }

    const book = operation.book

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
      console.warn(
        'Offline boek kon nog niet worden gesynchroniseerd.',
        error,
      )

      continue
    }

    await deleteOfflineBook(book.id)

    await removeFromSyncQueue(
      operation.queueId,
    )

    setBooks((currentBooks) => {
      const updatedBooks = currentBooks.map(
        (currentBook) =>
          currentBook.id === book.id
            ? data
            : currentBook,
      )

      return updatedBooks
    })
  }

  await loadBooks(session.user.id)
}

async function handleAddBook(bookData) {
  if (!session?.user) {
    return
  }

  const {
    data,
    error,
  } = await supabase
    .from('books')
    .insert({
      ...bookData,
      user_id: session.user.id,
    })
    .select()
    .single()

  if (!error && data) {
    setBooks((currentBooks) => {
      const updatedBooks = [
        data,
        ...currentBooks,
      ]

      saveOfflineBooks(
        session.user.id,
        updatedBooks,
      )

      return updatedBooks
    })

    setShowBookForm(false)
    return
  }

  console.warn(
    'Boek wordt offline opgeslagen.',
  )

  const offlineBook = {
    ...bookData,
    id: `offline-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}`,
    user_id: session.user.id,
    created_at: new Date().toISOString(),
    offline_only: true,
  }

  await saveOfflineBook(
    session.user.id,
    offlineBook,
  )

  await addToSyncQueue({
    type: 'create',
    user_id: session.user.id,
    book: offlineBook,
  })

  setBooks((currentBooks) => [
    offlineBook,
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
      pages: updatedBook.pages,
      recommended_by:
        updatedBook.recommended_by,
      genre: updatedBook.genre,

      rating: updatedBook.rating,

      plot_rating:
        updatedBook.plot_rating,
      writing_rating:
        updatedBook.writing_rating,
      content_rating:
        updatedBook.content_rating,
      readability_rating:
        updatedBook.readability_rating,
      characters_rating:
        updatedBook.characters_rating,
      world_building_rating:
        updatedBook.world_building_rating,
      representation_rating:
        updatedBook.representation_rating,
      romance_rating:
        updatedBook.romance_rating,
      spice_rating:
        updatedBook.spice_rating,

      summary: updatedBook.summary,
      tropes: updatedBook.tropes,
      review: updatedBook.review,
      quotes: updatedBook.quotes,

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

  setBooks((currentBooks) => {
    const updatedBooks =
      currentBooks.map((book) =>
        book.id === updatedBook.id
          ? data
          : book,
      )

    saveOfflineBooks(
      session.user.id,
      updatedBooks,
    )

    return updatedBooks
  })

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

    setBooks((currentBooks) => {
  const updatedBooks =
    currentBooks.filter(
      (book) => book.id !== bookId,
    )

  saveOfflineBooks(
    session.user.id,
    updatedBooks,
  )

  return updatedBooks
})
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
      {deleteBook && (
  <div className="delete-popup-overlay">
    <div className="delete-popup">
      <h2>Boek verwijderen?</h2>

      <p>
        Wil je "{deleteBook.title}" verwijderen?
      </p>

      <div className="delete-popup-actions">
        <button
          type="button"
          onClick={() => setDeleteBook(null)}
        >
          Annuleren
        </button>

        <button
          type="button"
          className="confirm-delete-button"
          onClick={async () => {
            await handleDeleteBook(deleteBook.id)
            setDeleteBook(null)
          }}
        >
          Verwijderen
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  )
}

export default App