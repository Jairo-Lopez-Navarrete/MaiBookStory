import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

function Profile({ user, bookCount, onLogout }) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [editOpen, setEditOpen] = useState(false)
  const [editUsername, setEditUsername] = useState('')
  const [editStatus, setEditStatus] = useState('')

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

  if (loading) {
    return (
      <main className="main-content cute-profile-loading">
        <div className="cute-profile-loading-card">
          <span>✦</span>
          <p>Profiel laden...</p>
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
            Je profiel kon niet worden geladen.
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

          <p>een klein kijkje in mijn boekenwereld</p>
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
            tik op je foto om deze te wijzigen
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
        </div>

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
          Uitloggen
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
              <span>naam</span>

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
                Annuleren
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