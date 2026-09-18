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

  const [expandedGenres, setExpandedGenres] =
    useState({})

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
   * GENRE HELPERS
   */

  function normalizeGenre(value) {
    return value
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ')
  }

  function getGenreWords(value) {
    return normalizeGenre(value)
      .split(/[\s/&,+-]+/)
      .filter(Boolean)
  }

  /*
   * GENRE STATISTIEKEN
   *
   * We maken hier een hiërarchie van de genres.
   *
   * Voorbeeld:
   *
   * Fantasy
   * High Fantasy
   * Urban Fantasy
   * Dark Fantasy
   *
   * wordt:
   *
   * Fantasy
   *   ├─ High Fantasy
   *   ├─ Urban Fantasy
   *   └─ Dark Fantasy
   *
   * Fantasy zelf wordt dus NOOIT nogmaals
   * als subgenre onder Fantasy geplaatst.
   */

  const genreGroups = (() => {
    const genreMap = new Map()

    books.forEach((book) => {
      const originalGenre = book.genre?.trim()

      if (!originalGenre) {
        return
      }

      const normalized = normalizeGenre(
        originalGenre,
      )

      if (!genreMap.has(normalized)) {
        genreMap.set(normalized, {
          key: normalized,
          name: originalGenre,
          count: 0,
        })
      }

      genreMap.get(normalized).count += 1
    })

    const genres = Array.from(
      genreMap.values(),
    )

    const groups = genres.map((genre) => ({
      ...genre,
      subgenres: [],
    }))

    /*
     * Zoek automatisch naar hoofdgenres.
     *
     * Bijvoorbeeld:
     *
     * Fantasy
     * High Fantasy
     *
     * De woorden van "Fantasy" zitten volledig
     * in "High Fantasy", dus High Fantasy wordt
     * onder Fantasy geplaatst.
     */

    genres.forEach((childGenre) => {
      const childWords = getGenreWords(
        childGenre.name,
      )

      const possibleParents = genres.filter(
        (parentGenre) => {
          /*
           * Een genre kan nooit zijn eigen ouder zijn.
           */
          if (
            parentGenre.key === childGenre.key
          ) {
            return false
          }

          const parentWords = getGenreWords(
            parentGenre.name,
          )

          /*
           * Een ouder moet korter zijn dan
           * het subgenre.
           */
          if (
            parentWords.length >=
            childWords.length
          ) {
            return false
          }

          /*
           * Alle woorden van het hoofdgenre
           * moeten voorkomen in het subgenre.
           */
          return parentWords.every((word) =>
            childWords.includes(word),
          )
        },
      )

      if (possibleParents.length === 0) {
        return
      }

      /*
       * Als er meerdere mogelijke ouders zijn,
       * gebruiken we de meest specifieke match.
       */
      possibleParents.sort(
        (a, b) =>
          getGenreWords(b.name).length -
          getGenreWords(a.name).length,
      )

      const parent = possibleParents[0]

      const parentGroup = groups.find(
        (group) => group.key === parent.key,
      )

      if (!parentGroup) {
        return
      }

      parentGroup.subgenres.push({
        ...childGenre,
      })
    })

    /*
     * Alle genres die onder een hoofdgenre zitten,
     * verwijderen we uit de hoofdlijst.
     *
     * Daardoor krijg je NIET:
     *
     * Fantasy
     * High Fantasy
     * Urban Fantasy
     *
     * maar:
     *
     * Fantasy
     *   High Fantasy
     *   Urban Fantasy
     */

    const childKeys = new Set()

    groups.forEach((group) => {
      group.subgenres.forEach((subgenre) => {
        childKeys.add(subgenre.key)
      })
    })

return groups
  .filter(
    (group) => !childKeys.has(group.key),
  )
  .map((group) => {
    /*
     * Een hoofdgenre bestaat uit:
     *
     * - boeken die exact dit genre hebben
     * - boeken die één van de subgenres hebben
     *
     * Bijvoorbeeld:
     *
     * Fantasy = 1
     * Urban Fantasy = 2
     *
     * Dan is Fantasy in totaal 3 boeken.
     */
    const totalGenreCount =
      group.count +
      group.subgenres.reduce(
        (total, subgenre) =>
          total + subgenre.count,
        0,
      )

    return {
      ...group,

      count: totalGenreCount,

      subgenres: group.subgenres.sort(
        (a, b) => b.count - a.count,
      ),

      percentage:
        bookCount > 0
          ? Math.round(
              (totalGenreCount / bookCount) * 100,
            )
          : 0,
    }
  })
  .sort((a, b) => b.count - a.count)
  })()

  function toggleGenre(genreKey) {
    setExpandedGenres((current) => ({
      ...current,
      [genreKey]: !current[genreKey],
    }))
  }

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

          {/* =========================================
              BOEKEN TELLERS
              ========================================= */}

          <div className="cute-profile-book-stats-row">
            <div className="cute-profile-book-count">
              <span className="cute-profile-book-icon">
                📚
              </span>

              <div>
                <strong>{bookCount}</strong>

                <span>
                  {bookCount === 1
                    ? 'book in my library'
                    : 'books in my library'}
                </span>
              </div>
            </div>

            <button
              type="button"
              className="cute-profile-owned-button"
              onClick={() =>
                setOwnedOpen(true)
              }
            >
              <span className="cute-profile-owned-icon">
                🏠
              </span>

              <span className="cute-profile-owned-content">
                <strong>
                  {ownedBooks.length}
                </strong>

                <span>
                  owned books
                </span>
              </span>
            </button>
          </div>
        </div>

        <div className="cute-profile-divider">
          <span>✦</span>
          <div />
          <span>✦</span>
        </div>

        {/* =========================================
            GENRE STATISTIEKEN
            ========================================= */}

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
            Most read genres.
          </p>

          {genreGroups.length === 0 ? (
            <div className="cute-profile-empty-statistics">
              <span>📖</span>

              <p>
                Add a genre to your book!
              </p>
            </div>
          ) : (
            <div className="cute-profile-genre-list">
              {genreGroups.map((genre) => {
                const isExpanded =
                  Boolean(
                    expandedGenres[
                      genre.key
                    ],
                  )

                const hasSubgenres =
                  genre.subgenres.length > 0

                return (
                  <div
                    className="cute-profile-genre-group"
                    key={genre.key}
                  >
                    <button
                      type="button"
                      className={`cute-profile-genre ${
                        hasSubgenres
                          ? 'cute-profile-genre-clickable'
                          : ''
                      }`}
                      onClick={() => {
                        if (hasSubgenres) {
                          toggleGenre(
                            genre.key,
                          )
                        }
                      }}
                      disabled={!hasSubgenres}
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

                      <div className="cute-profile-genre-bottom">
                        <small>
                          {genre.count}{' '}
                          {genre.count === 1
                            ? 'boek'
                            : 'boeken'}
                        </small>

                        {hasSubgenres && (
                          <span className="cute-profile-genre-expand">
                            {isExpanded
                              ? '⌃'
                              : '⌄'}
                          </span>
                        )}
                      </div>
                    </button>

                    {isExpanded &&
                      hasSubgenres && (
                        <div className="cute-profile-subgenre-list">
                          {genre.subgenres.map(
                            (subgenre) => {
                              const subgenrePercentage =
                                genre.count >
                                0
                                  ? Math.round(
                                      (subgenre.count /
                                        genre.count) *
                                        100,
                                    )
                                  : 0

                              return (
                                <div
                                  key={
                                    subgenre.key
                                  }
                                  className="cute-profile-subgenre"
                                >
                                  <div className="cute-profile-subgenre-top">
                                    <span className="cute-profile-subgenre-name">
                                      {
                                        subgenre.name
                                      }
                                    </span>

                                    <span className="cute-profile-subgenre-count">
                                      {
                                        subgenre.count
                                      }{' '}
                                      {subgenre.count ===
                                      1
                                        ? 'boek'
                                        : 'boeken'}
                                    </span>
                                  </div>

                                  <div className="cute-profile-subgenre-bar">
                                    <div
                                      className="cute-profile-subgenre-bar-fill"
                                      style={{
                                        width: `${subgenrePercentage}%`,
                                      }}
                                    />
                                  </div>

                                  <span className="cute-profile-subgenre-percentage">
                                    {
                                      subgenrePercentage
                                    }
                                    % van{' '}
                                    {genre.name}
                                  </span>
                                </div>
                              )
                            },
                          )}
                        </div>
                      )}
                  </div>
                )
              })}
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

      {/* ===========================================
          OWNED BOOKS MODAL
          =========================================== */}

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

                <h4>
                  Nog geen boeken in bezit
                </h4>

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

      {/* ===========================================
          EDIT PROFILE MODAL
          =========================================== */}

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