import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

function Profile({ user, bookCount, onLogout }) {
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProfile() {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Fout bij laden van profiel:', error)
      } else {
        setUsername(data.username)
      }

      setLoading(false)
    }

    loadProfile()
  }, [user.id])

  return (
    <main className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar">
          👤
        </div>

        <h2>Mijn profiel</h2>

        {loading ? (
          <p>Profiel laden...</p>
        ) : (
          <h3>{username}</h3>
        )}
      </div>

      <div className="profile-info">
        <div className="profile-info-item">
          <span>📧</span>
          <div>
            <strong>E-mail</strong>
            <p>{user.email}</p>
          </div>
        </div>

        <div className="profile-info-item">
          <span>📚</span>
          <div>
            <strong>Mijn boeken</strong>
            <p>
              {bookCount}{' '}
              {bookCount === 1 ? 'boek' : 'boeken'}
            </p>
          </div>
        </div>
      </div>

      <button
        className="logout-button"
        onClick={onLogout}
      >
        🚪 Uitloggen
      </button>
    </main>
  )
}

export default Profile