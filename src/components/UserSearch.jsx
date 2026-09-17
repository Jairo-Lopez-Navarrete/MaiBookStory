import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

function UserSearch({ onUserSelect }) {
  const [search, setSearch] = useState('')
  const [users, setUsers] = useState([])

  async function handleSearch(event) {
    const value = event.target.value

    setSearch(value)

    if (value.trim().length < 2) {
      setUsers([])
      return
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .ilike('username', `%${value.trim()}%`)
      .limit(10)

    if (error) {
      console.error(
        'Fout bij zoeken naar gebruikers:',
        error,
      )
      return
    }

    const usersWithBookCount = await Promise.all(
      data.map(async (user) => {
        const {
          data: bookCount,
          error: countError,
        } = await supabase.rpc(
          'get_user_book_count',
          {
            profile_user_id: user.id,
          },
        )

        if (countError) {
          console.error(
            'Fout bij tellen van boeken:',
            countError,
          )

          return {
            ...user,
            bookCount: 0,
          }
        }

        return {
          ...user,
          bookCount,
        }
      }),
    )

    setUsers(usersWithBookCount)
  }

  return (
    <section className="user-search">
      <input
        type="text"
        placeholder="🔍 Zoek gebruiker..."
        value={search}
        onChange={handleSearch}
      />

      <div className="user-search-results">
  {users.map((user) => (
    <button
          key={user.id}
          type="button"
          onClick={() => onUserSelect(user)}
        >
          <div>
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={`Profielfoto van ${user.username}`}
              />
            ) : (
              <span>👤</span>
            )}
          </div>

          <div>
            <strong>{user.username}</strong>
            <span>
              📚 {user.bookCount}{' '}
              {user.bookCount === 1
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