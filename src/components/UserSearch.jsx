import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

function UserSearch({ onUserSelect }) {
  const [search, setSearch] = useState('')
  const [users, setUsers] = useState([])
  const [searching, setSearching] = useState(false)

  async function handleSearch(event) {
    const value = event.target.value

    setSearch(value)

    if (value.trim().length < 2) {
      setUsers([])
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

  return (
    <section className="user-search">
      <input
        type="text"
        placeholder="🔍 Zoek gebruiker..."
        value={search}
        onChange={handleSearch}
      />

      {searching && (
        <p className="user-search-message">
          Gebruikers zoeken...
        </p>
      )}

      {!searching &&
        search.trim().length >= 2 &&
        users.length === 0 && (
          <p className="user-search-message">
            Geen gebruiker gevonden.
          </p>
        )}

      <div className="user-search-results">
        {users.map((profile) => (
          <button
            className="user-search-result"
            key={profile.id}
            type="button"
            onClick={() =>
              onUserSelect(profile)
            }
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
                  Nog geen status
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
    </section>
  )
}

export default UserSearch