import {
  useEffect,
  useRef,
  useState,
} from 'react'
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

const monthNames = [
  'januari',
  'februari',
  'maart',
  'april',
  'mei',
  'juni',
  'juli',
  'augustus',
  'september',
  'oktober',
  'november',
  'december',
]

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
  const [deletePopupReady, setDeletePopupReady] =
    useState(false)

  const [selectedMonth, setSelectedMonth] =
    useState(
      () => new Date().getMonth() + 1,
    )

  const [selectedYear, setSelectedYear] =
    useState(
      () => new Date().getFullYear(),
    )

  const swipeStartX = useRef(null)
  const swipeStartY = useRef(null)

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

      if (
        operation.user_id !==
        session.user.id
      ) {
        continue
      }

      const book = operation.book

      const { data, error } =
        await supabase
          .from('books')
          .insert({
            user_id: session.user.id,
            title: book.title,
            author: book.author,
            pages: book.pages,
            recommended_by:
              book.recommended_by,
            genre: book.genre,
            rating: book.rating,
            plot_rating: book.plot_rating,
            writing_rating:
              book.writing_rating,
            content_rating:
              book.content_rating,
            readability_rating:
              book.readability_rating,
            characters_rating:
              book.characters_rating,
            world_building_rating:
              book.world_building_rating,
            representation_rating:
              book.representation_rating,
            romance_rating:
              book.romance_rating,
            spice_rating:
              book.spice_rating,
            summary: book.summary,
            tropes: book.tropes,
            review: book.review,
            quotes: book.quotes,
            cover: book.cover,
            reading_month:
              book.reading_month,
            reading_year:
              book.reading_year,
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

      setBooks((currentBooks) =>
        currentBooks.map(
          (currentBook) =>
            currentBook.id === book.id
              ? data
              : currentBook,
        ),
      )
    }

    await loadBooks(session.user.id)
  }

  useEffect(() => {
    async function getSession() {
      const {
        data: { session },
      } =
        await supabase.auth.getSession()

      setSession(session)
      setLoading(false)

      if (session?.user) {
        loadBooks(session.user.id)
      }
    }

    getSession()

    const {
      data: { subscription },
    } =
      supabase.auth.onAuthStateChange(
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

    function handleDeleteRequest(event) {
      setDeleteBook(event.detail)
      setDeletePopupReady(false)
    }

    window.addEventListener(
      'request-book-delete',
      handleDeleteRequest,
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

      window.removeEventListener(
        'online',
        syncOfflineBooks,
      )

      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!deleteBook) {
      return
    }

    function unlockDeletePopup() {
      setDeletePopupReady(true)
    }

    window.addEventListener(
      'pointerup',
      unlockDeletePopup,
      { once: true },
    )

    return () => {
      window.removeEventListener(
        'pointerup',
        unlockDeletePopup,
      )
    }
  }, [deleteBook])

  function getBookPeriod(book) {
    if (
      book.reading_month &&
      book.reading_year
    ) {
      return {
        month: Number(
          book.reading_month,
        ),
        year: Number(
          book.reading_year,
        ),
      }
    }

    if (book.created_at) {
      const date = new Date(
        book.created_at,
      )

      return {
        month: date.getMonth() + 1,
        year: date.getFullYear(),
      }
    }

    return null
  }

  const visibleBooks = books.filter(
    (book) => {
      const period = getBookPeriod(book)

      if (!period) {
        return false
      }

      return (
        period.month === selectedMonth &&
        period.year === selectedYear
      )
    },
  )

  const availableYears =
    Array.from(
      new Set([
        ...Array.from(
          { length: 11 },
          (_, index) =>
            new Date().getFullYear() -
            5 +
            index,
        ),

        ...books
          .map((book) => {
            const period =
              getBookPeriod(book)

            return period?.year
          })
          .filter(Boolean),

        selectedYear,
      ]),
    ).sort((a, b) => b - a)

  function changeMonth(offset) {
    const date = new Date(
      selectedYear,
      selectedMonth - 1 + offset,
      1,
    )

    setSelectedMonth(
      date.getMonth() + 1,
    )

    setSelectedYear(
      date.getFullYear(),
    )
  }

  function handleMonthTouchStart(event) {
    const touch = event.touches[0]

    if (!touch) {
      return
    }

    swipeStartX.current =
      touch.clientX

    swipeStartY.current =
      touch.clientY
  }

  function handleMonthTouchEnd(event) {
    if (
      swipeStartX.current === null ||
      swipeStartY.current === null
    ) {
      return
    }

    const touch =
      event.changedTouches[0]

    if (!touch) {
      return
    }

    const deltaX =
      touch.clientX -
      swipeStartX.current

    const deltaY =
      touch.clientY -
      swipeStartY.current

    swipeStartX.current = null
    swipeStartY.current = null

    if (Math.abs(deltaX) < 50) {
      return
    }

    if (
      Math.abs(deltaX) <=
      Math.abs(deltaY)
    ) {
      return
    }

    if (deltaX < 0) {
      changeMonth(1)
    } else {
      changeMonth(-1)
    }
  }

  async function handleAddBook(
    bookData,
  ) {
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
      created_at:
        new Date().toISOString(),
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

  async function handleUpdateBook(
    updatedBook,
  ) {
    if (!session?.user) {
      return
    }

    const { data, error } =
      await supabase
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
          reading_month:
            updatedBook.reading_month,
          reading_year:
            updatedBook.reading_year,
        })
        .eq('id', updatedBook.id)
        .eq(
          'user_id',
          session.user.id,
        )
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

  async function handleDeleteBook(
    bookId,
  ) {
    if (!session?.user) {
      return
    }

    const { error } =
      await supabase
        .from('books')
        .delete()
        .eq('id', bookId)
        .eq(
          'user_id',
          session.user.id,
        )

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
          (book) =>
            book.id !== bookId,
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
    return (
      <div className="journal-loading">
        Even laden...
      </div>
    )
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
    <div className="app journal-app">
      {currentPage === 'profile' ? (
        <Profile
          user={session.user}
          bookCount={books.length}
          onLogout={handleLogout}
        />
      ) : (
        <>
          <header className="journal-header">
            <div className="journal-header-decoration">
              ✦
            </div>

            <div className="journal-brand">

              <h1>MaiBookStory</h1>

              <p>
                jouw persoonlijke
                boekenwereld
              </p>
            </div>

            <div className="journal-header-decoration">
              ✦
            </div>
          </header>

          <main className="main-content journal-main">
            <div className="journal-top-row">
              <UserSearch
                onUserSelect={
                  setSelectedUser
                }
              />

              {!selectedUser && (
                <label className="journal-year-picker">
                  <span>jaar</span>

                  <select
                    value={selectedYear}
                    onChange={(event) =>
                      setSelectedYear(
                        Number(
                          event.target.value,
                        ),
                      )
                    }
                    aria-label="Jaar kiezen"
                  >
                    {availableYears.map(
                      (year) => (
                        <option
                          key={year}
                          value={year}
                        >
                          {year}
                        </option>
                      ),
                    )}
                  </select>
                </label>
              )}
            </div>

            {selectedUser ? (
              <UserProfile
                user={selectedUser}
                onBack={() =>
                  setSelectedUser(null)
                }
              />
            ) : (
              <>
                <section
                  className="journal-month-section"
                  onTouchStart={
                    handleMonthTouchStart
                  }
                  onTouchEnd={
                    handleMonthTouchEnd
                  }
                >
                  <button
                    type="button"
                    className="journal-month-arrow"
                    onClick={() =>
                      changeMonth(-1)
                    }
                    aria-label="Vorige maand"
                  >
                    ←
                  </button>

                  <div className="journal-month-card">
                    <span className="journal-month-label">
                      reading month
                    </span>

                    <h2>
                      {monthNames[
                        selectedMonth - 1
                      ]}
                    </h2>

                    <span className="journal-month-year">
                      {selectedYear}
                    </span>

                    <div className="journal-month-stars">
                      ✦ ✧ ✦
                    </div>
                  </div>

                  <button
                    type="button"
                    className="journal-month-arrow"
                    onClick={() =>
                      changeMonth(1)
                    }
                    aria-label="Volgende maand"
                  >
                    →
                  </button>
                </section>

                <section className="journal-library">
                  <div className="journal-section-heading">
                    <div>
                      <span>
                        my library
                      </span>

                      <h2>
                        Mijn boeken
                      </h2>
                    </div>

                    <div className="journal-book-count">
                      <strong>
                        {
                          visibleBooks.length
                        }
                      </strong>

                      <small>
                        {visibleBooks.length ===
                        1
                          ? 'boek'
                          : 'boeken'}
                      </small>
                    </div>
                  </div>

                  {visibleBooks.length ===
                  0 ? (
                    <div className="journal-empty">
                      <div className="journal-empty-decoration">
                        ✦
                      </div>

                      <div className="journal-empty-icon">
                        📖
                      </div>

                      <h3>
                        {books.length ===
                        0
                          ? 'Nog geen boeken'
                          : 'Deze maand is nog leeg'}
                      </h3>

                      <p>
                        {books.length ===
                        0
                          ? 'Begin jouw persoonlijke leesjournaal.'
                          : `Er staan nog geen boeken in ${monthNames[selectedMonth - 1]} ${selectedYear}.`}
                      </p>

                      <button
                        type="button"
                        className="journal-add-button"
                        onClick={() =>
                          setShowBookForm(
                            true,
                          )
                        }
                      >
                        <span>＋</span>
                        Boek toevoegen
                      </button>
                    </div>
                  ) : (
                    <section className="book-grid journal-book-grid">
                      {visibleBooks.map(
                        (book) => (
                          <BookCard
                            key={book.id}
                            book={book}
                            onEdit={
                              handleEditBook
                            }
                            onDelete={
                              handleDeleteBook
                            }
                          />
                        ),
                      )}
                    </section>
                  )}
                </section>
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
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
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
              Wil je "{deleteBook.title}"
              verwijderen?
            </p>

            {!deletePopupReady && (
              <p className="delete-popup-hint">
                Haal eerst je vinger van
                het scherm.
              </p>
            )}

            <div className="delete-popup-actions">
              <button
                type="button"
                disabled={
                  !deletePopupReady
                }
                onClick={() => {
                  setDeleteBook(null)
                  setDeletePopupReady(
                    false,
                  )
                }}
              >
                Annuleren
              </button>

              <button
                type="button"
                className="confirm-delete-button"
                disabled={
                  !deletePopupReady
                }
                onClick={async () => {
                  await handleDeleteBook(
                    deleteBook.id,
                  )

                  setDeleteBook(null)
                  setDeletePopupReady(
                    false,
                  )
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