import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

function Profile({ user, bookCount, onLogout }) {
  const [username, setUsername] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [editingStatus, setEditingStatus] = useState(false)

  const [followerCount, setFollowerCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)

  async function loadProfile() {
    const { data, error } = await supabase
      .from('profiles')
      .select('username, avatar_url, status')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error(
        'Fout bij laden van profiel:',
        error,
      )
      return
    }

    setUsername(data.username)
    setAvatarUrl(data.avatar_url || '')
    setStatus(data.status || '')
  }

  async function loadFollowCounts() {
    const {
      data: followers,
      error: followersError,
    } = await supabase.rpc(
      'get_user_follower_count',
      {
        profile_user_id: user.id,
      },
    )

    if (followersError) {
      console.error(
        'Fout bij laden van volgers:',
        followersError,
      )
    } else {
      setFollowerCount(followers)
    }

    const {
      data: following,
      error: followingError,
    } = await supabase.rpc(
      'get_user_following_count',
      {
        profile_user_id: user.id,
      },
    )

    if (followingError) {
      console.error(
        'Fout bij laden van volgend:',
        followingError,
      )
    } else {
      setFollowingCount(following)
    }
  }

  async function saveStatus() {
    const { error } = await supabase
      .from('profiles')
      .update({
        status: status.trim(),
      })
      .eq('id', user.id)

    if (error) {
      console.error(
        'Fout bij opslaan van status:',
        error,
      )

      alert(
        'De status kon niet worden opgeslagen.',
      )

      return
    }

    setStatus(status.trim())
    setEditingStatus(false)
  }

  useEffect(() => {
    async function loadData() {
      setLoading(true)

      await Promise.all([
        loadProfile(),
        loadFollowCounts(),
      ])

      setLoading(false)
    }

    loadData()
  }, [user.id])

  return (
    <main className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={`Profielfoto van ${username}`}
            />
          ) : (
            '👤'
          )}
        </div>

        {loading ? (
          <p>Profiel laden...</p>
        ) : (
          <>
            <h2>{username}</h2>

            {editingStatus ? (
              <div className="profile-status-editor">
                <textarea
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value)
                  }
                  placeholder="Vertel iets over jezelf..."
                  rows="3"
                  maxLength="150"
                />

                <div className="profile-status-actions">
                  <button
                    type="button"
                    onClick={saveStatus}
                  >
                    Opslaan
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setEditingStatus(false)
                    }
                  >
                    Annuleren
                  </button>
                </div>
              </div>
            ) : (
              <>
                {status ? (
                  <p>{status}</p>
                ) : (
                  <p>
                    Nog geen status toegevoegd.
                  </p>
                )}

                <button
                  type="button"
                  onClick={() =>
                    setEditingStatus(true)
                  }
                >
                  ✏️ Status bewerken
                </button>
              </>
            )}

            <div className="profile-stats">
              <div>
                <strong>{bookCount}</strong>
                <span>boeken</span>
              </div>

              <div>
                <strong>{followerCount}</strong>
                <span>volgers</span>
              </div>

              <div>
                <strong>{followingCount}</strong>
                <span>volgend</span>
              </div>
            </div>
          </>
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
              {bookCount === 1
                ? 'boek'
                : 'boeken'}
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