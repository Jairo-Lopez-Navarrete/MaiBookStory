import {
  useEffect,
  useRef,
  useState,
} from 'react'
import { supabase } from '../lib/supabaseClient'

function Profile({
  user,
  books = [],
  bookCount,
  onLogout,
}) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [editOpen, setEditOpen] = useState(false)
  const [ownedOpen, setOwnedOpen] = useState(false)

  const [editUsername, setEditUsername] =
    useState('')
  const [editStatus, setEditStatus] =
    useState('')

  const fileInputRef = useRef(null)

  useEffect(() => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    loadProfile()
  }, [user?.id])

  async function loadProfile() {
    setLoading(true)

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error(
        'Profiel laden mislukt:',
        error,
      )

      setLoading(false)
      return
    }

    setProfile(data)
    setEditUsername(data.username || '')
    setEditStatus(data.status || '')
    setLoading(false)
  }

  function openEdit() {
    setEditUsername(profile?.username || '')
    setEditStatus(profile?.status || '')
    setEditOpen(true)
  }

  async function saveProfile() {
    const username = editUsername.trim()
    const status = editStatus.trim()

    if (!username) {
      alert('Je naam mag niet leeg zijn.')
      return
    }

    setSaving(true)

    const { data, error } = await supabase
      .from('profiles')
      .update({
        username,
        status,
      })
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        alert('Deze naam is al in gebruik.')
      } else {
        alert(
          `Opslaan mislukt: ${error.message}`,
        )
      }

      setSaving(false)
      return
    }

    setProfile(data)
    setEditUsername(data.username || '')
    setEditStatus(data.status || '')
    setEditOpen(false)
    setSaving(false)
  }

  function handlePhotoClick() {
    fileInputRef.current?.click()
  }

  async function handleImageChange(event) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    const reader = new FileReader()

    reader.onload = async () => {
      const avatarUrl = reader.result

      const { data, error } =
        await supabase
          .from('profiles')
          .update({
            avatar_url: avatarUrl,
          })
          .eq('id', user.id)
          .select()
          .single()

      if (error) {
        alert(
          `Foto opslaan mislukt: ${error.message}`,
        )
        return
      }

      setProfile(data)
    }

    reader.readAsDataURL(file)

    event.target.value = ''
  }

  /*
   * BOEKEN IN BEZIT
   *
   * Alleen boeken waarbij owned true is.
   */
  const ownedBooks = books.filter(
    (book) => Boolean(book.owned),
  )

  /*
   * GENRE STATISTIEKEN
   *
   * Alle boeken worden meegenomen.
   *
   * Een genre wordt rechtstreeks uit book.genre gehaald.
   * Dus als jij bijvoorbeeld "Kabouter Plop" invult,
   * wordt "Kabouter Plop" gewoon een categorie.
   *
   * We maken de vergelijking case-insensitive:
   * Fantasy + fantasy = één categorie.
   */
  const genreMap = books.reduce(
    (accumulator, book) => {
      const genre = book.genre?.trim()

      if (!genre) {
        return accumulator
      }

      const key = genre.toLowerCase()

      if (!accumulator[key]) {
        accumulator[key] = {
          name: genre,
          count: 0,
        }
      }

      accumulator[key].count += 1

      return accumulator
    },
    {},
  )

  const genreStats = Object.values(
    genreMap,
  )
    .map((genre) => ({
      ...genre,
      percentage:
        bookCount > 0
          ? Math.round(
              (genre.count / bookCount) * 100,
            )
          : 0,
    }))
    .sort((a, b) => b.count - a.count)

  if (loading) {
    return (
      <main className="main-content cute-profile-loading">
        <div className="cute-profile-loading-card">
          <span>✦</span>
          <p>Loading profile...</p>
          <span>✦</span>
        </div>
      </main>
    )
  }

  if (!profile) {
    return (
      <main className="main-content cute-profile-loading">
        <div className="cute-profile-loading-card">
          <span>✦</span>
          <p>
            Your profile couldn't be loaded.
          </p>
          <span>✦</span>
        </div>
      </main>
    )
  }

  return (
    <main className="main-content cute-profile-page">
      <section className="cute-profile-card">
        <div className="cute-profile-decoration-top">
          <span>✦</span>
          <span>✧</span>
          <span>✦</span>
        </div>

        <div className="cute-profile-heading">
          <span>my reading journal</span>

          <h2>my profile</h2>

          <p>A small peek in my bookworld</p>
        </div>

        <div className="cute-profile-avatar-area">
          <div className="cute-profile-avatar-frame">
            <button
              type="button"
              className="cute-profile-avatar-button"
              onClick={handlePhotoClick}
              aria-label="Profielfoto wijzigen"
            >
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Profielfoto"
                  className="cute-profile-avatar"
                />
              ) : (
                <div className="cute-profile-avatar cute-profile-avatar-placeholder">
                  👤
                </div>
              )}
            </button>

            <button
              type="button"
              className="cute-profile-edit-button"
              onClick={openEdit}
              aria-label="Naam en status aanpassen"
            >
              ✏️
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            hidden
          />

          <p className="cute-profile-photo-hint">
            tab your profile picture to change it
          </p>
        </div>

        <div className="cute-profile-info">
          <div className="cute-profile-name-section">
            <span className="cute-profile-small-label">
              reader
            </span>

            <h3>{profile.username}</h3>

            {profile.status && (
              <p>{profile.status}</p>
            )}
          </div>

          <div className="cute-profile-stats">
            <div className="cute-profile-book-count">
              <span className="cute-profile-book-icon">
                📚
              </span>

              <div>
                <strong>{bookCount}</strong>

                <span>
                  {bookCount === 1
                    ? 'boek in mijn bibliotheek'
                    : 'boeken in mijn bibliotheek'}
                </span>
              </div>
            </div>

            <button
              type="button"
              className="cute-profile-book-count cute-profile-owned-button"
              onClick={() =>
                setOwnedOpen(true)
              }
            >
              <span className="cute-profile-book-icon">
                🏠
              </span>

              <div>
                <strong>
                  {ownedBooks.length}
                </strong>

                <span>
                  {ownedBooks.length === 1
                    ? 'boek in bezit'
                    : 'boeken in bezit'}
                </span>
              </div>
            </button>
          </div>
        </div>

        <div className="cute-profile-divider">
          <span>✦</span>
          <div />
          <span>✦</span>
        </div>

        <section className="cute-profile-statistics">
          <div className="cute-profile-statistics-heading">
            <div>
              <span>my reading statistics</span>

              <h3>my genres</h3>
            </div>

            <span className="cute-profile-statistics-icon">
              📊
            </span>
          </div>

          <p className="cute-profile-statistics-description">
            De verdeling van alle boeken in mijn
            bibliotheek.
          </p>

          {genreStats.length === 0 ? (
            <div className="cute-profile-empty-statistics">
              <span>📖</span>

              <p>
                Voeg een genre toe aan je boeken
                om hier je statistieken te zien.
              </p>
            </div>
          ) : (
            <div className="cute-profile-genre-list">
              {genreStats.map((genre) => (
                <div
                  className="cute-profile-genre"
                  key={genre.name.toLowerCase()}
                >
                  <div className="cute-profile-genre-top">
                    <span>
                      {genre.name}
                    </span>

                    <strong>
                      {genre.percentage}%
                    </strong>
                  </div>

                  <div className="cute-profile-genre-bar">
                    <div
                      className="cute-profile-genre-bar-fill"
                      style={{
                        width: `${genre.percentage}%`,
                      }}
                    />
                  </div>

                  <small>
                    {genre.count}{' '}
                    {genre.count === 1
                      ? 'boek'
                      : 'boeken'}
                  </small>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="cute-profile-divider">
          <span>✦</span>
          <div />
          <span>✦</span>
        </div>

        <button
          type="button"
          className="cute-profile-logout"
          onClick={onLogout}
        >
          <span>♡</span>
          Log out
          <span>♡</span>
        </button>

        <div className="cute-profile-footer">
          <span>✦</span>

          <p>
            made for little reading moments
          </p>

          <span>✦</span>
        </div>
      </section>

      {ownedOpen && (
        <div className="cute-profile-owned-overlay">
          <div className="cute-profile-owned-modal">
            <div className="cute-profile-owned-stars">
              ✦ ✧ ✦
            </div>

            <div className="cute-profile-owned-header">
              <div>
                <span>my reading journal</span>

                <h3>books I own</h3>
              </div>

              <button
                type="button"
                className="cute-profile-owned-close"
                onClick={() =>
                  setOwnedOpen(false)
                }
                aria-label="Sluiten"
              >
                ×
              </button>
            </div>

            {ownedBooks.length === 0 ? (
              <div className="cute-profile-owned-empty">
                <span>📚</span>

                <h4>Nog geen boeken in bezit</h4>

                <p>
                  Markeer een boek als
                  'Owned' wanneer je het
                  daadwerkelijk bezit.
                </p>
              </div>
            ) : (
              <div className="cute-profile-owned-list">
                {ownedBooks.map((book) => (
                  <article
                    className="cute-profile-owned-book"
                    key={book.id}
                  >
                    {book.cover ? (
                      <img
                        src={book.cover}
                        alt={book.title}
                        className="cute-profile-owned-cover"
                      />
                    ) : (
                      <div className="cute-profile-owned-cover cute-profile-owned-cover-placeholder">
                        📖
                      </div>
                    )}

                    <div className="cute-profile-owned-book-info">
                      <strong>
                        {book.title}
                      </strong>

                      <span>
                        {book.author ||
                          'Onbekende auteur'}
                      </span>

                      {book.genre && (
                        <small>
                          {book.genre}
                        </small>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {editOpen && (
        <div className="cute-profile-edit-overlay">
          <div className="cute-profile-edit-modal">
            <div className="cute-profile-edit-stars">
              ✦ ✧ ✦
            </div>

            <div className="cute-profile-edit-header">
              <div>
                <span>my reading journal</span>
                <h3>edit profile</h3>
              </div>

              <button
                type="button"
                className="cute-profile-edit-close"
                onClick={() =>
                  setEditOpen(false)
                }
                aria-label="Sluiten"
              >
                ×
              </button>
            </div>

            <label className="cute-profile-field">
              <span>name</span>

              <input
                type="text"
                value={editUsername}
                onChange={(event) =>
                  setEditUsername(
                    event.target.value,
                  )
                }
                maxLength={30}
              />
            </label>

            <label className="cute-profile-field">
              <span>status</span>

              <input
                type="text"
                value={editStatus}
                onChange={(event) =>
                  setEditStatus(
                    event.target.value,
                  )
                }
                maxLength={80}
                placeholder="Bijvoorbeeld: Lezen is mijn favoriete hobby 📚"
              />
            </label>

            <div className="cute-profile-edit-actions">
              <button
                type="button"
                className="cute-profile-edit-cancel"
                onClick={() =>
                  setEditOpen(false)
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="cute-profile-edit-save"
                onClick={saveProfile}
                disabled={saving}
              >
                {saving
                  ? 'Opslaan...'
                  : 'Opslaan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default Profile