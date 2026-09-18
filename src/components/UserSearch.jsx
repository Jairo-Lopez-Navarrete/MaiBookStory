import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

function UserSearch({ onUserSelect }) {
  const [search, setSearch] = useState('')
  const [users, setUsers] = useState([])
  const [searching, setSearching] = useState(false)
  const [expanded, setExpanded] = useState(false)

  async function handleSearch(event) {
    const value = event.target.value

    setSearch(value)

    if (value.trim().length < 2) {
      setUsers([])
      setSearching(false)
      return
    }

    setSearching(true)

    const { data, error } = await supabase
      .from('profiles')
      .select(
        'id, username, avatar_url, status',
      )
      .ilike(
        'username',
        `%${value.trim()}%`,
      )
      .limit(10)

    if (error) {
      console.error(
        'Fout bij zoeken naar gebruikers:',
        error,
      )

      setSearching(false)
      return
    }

    const usersWithBookCount =
      await Promise.all(
        data.map(async (profile) => {
          const {
            data: bookCount,
            error: countError,
          } = await supabase.rpc(
            'get_user_book_count',
            {
              profile_user_id: profile.id,
            },
          )

          if (countError) {
            console.error(
              'Fout bij tellen van boeken:',
              countError,
            )

            return {
              ...profile,
              bookCount: 0,
            }
          }

          return {
            ...profile,
            bookCount: bookCount || 0,
          }
        }),
      )

    setUsers(usersWithBookCount)
    setSearching(false)
  }

  function openSearch() {
    setExpanded(true)
  }

  function closeSearch() {
    setExpanded(false)
    setSearch('')
    setUsers([])
    setSearching(false)
  }

  return (
    <section
      className={
        expanded
          ? 'user-search user-search-expanded'
          : 'user-search user-search-collapsed'
      }
    >
      {!expanded ? (
        <button
          type="button"
          className="user-search-toggle"
          onClick={openSearch}
          aria-label="Gebruiker zoeken"
        >
          🔍
        </button>
      ) : (
        <div className="user-search-input-wrap">
          <span className="user-search-icon">
            🔍
          </span>

          <input
            type="text"
            placeholder="Search user..."
            value={search}
            onChange={handleSearch}
            autoFocus
          />

          <button
            type="button"
            className="user-search-close"
            onClick={closeSearch}
            aria-label="Zoeken sluiten"
          >
            ×
          </button>
        </div>
      )}

      {expanded && searching && (
        <p className="user-search-message">
          Searching for users...
        </p>
      )}

      {expanded &&
        !searching &&
        search.trim().length >= 2 &&
        users.length === 0 && (
          <p className="user-search-message">
            No user found.
          </p>
        )}

      {expanded && users.length > 0 && (
        <div className="user-search-results">
          {users.map((profile) => (
            <button
              className="user-search-result"
              key={profile.id}
              type="button"
              onClick={() => {
                onUserSelect(profile)
                closeSearch()
              }}
            >
              <div className="user-search-avatar">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={`Profielfoto van ${profile.username}`}
                  />
                ) : (
                  <span>👤</span>
                )}
              </div>

              <div className="user-search-info">
                <strong>
                  {profile.username}
                </strong>

                {profile.status ? (
                  <span className="user-search-status">
                    {profile.status}
                  </span>
                ) : (
                  <span className="user-search-status">
                    no added status
                  </span>
                )}

                <span>
                  📚 {profile.bookCount}{' '}
                  {profile.bookCount === 1
                    ? 'boek'
                    : 'boeken'}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  )
}

export default UserSearch