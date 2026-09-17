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
      console.error('Profiel laden mislukt:', error)
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
        alert(`Opslaan mislukt: ${error.message}`)
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

    if (!file) return

    const reader = new FileReader()

    reader.onload = async () => {
      const avatarUrl = reader.result

      const { data, error } = await supabase
        .from('profiles')
        .update({
          avatar_url: avatarUrl,
        })
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        alert(`Foto opslaan mislukt: ${error.message}`)
        return
      }

      setProfile(data)
    }

    reader.readAsDataURL(file)

    event.target.value = ''
  }

  if (loading) {
    return (
      <main className="main-content">
        <p>Profiel laden...</p>
      </main>
    )
  }

  if (!profile) {
    return (
      <main className="main-content">
        <p>Je profiel kon niet worden geladen.</p>
      </main>
    )
  }

  return (
    <main className="main-content profile-page">
      <section className="profile-card">
        <div className="profile-avatar-wrapper">
          <button
            type="button"
            className="profile-avatar-button"
            onClick={handlePhotoClick}
            aria-label="Profielfoto wijzigen"
          >
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Profielfoto"
                className="profile-avatar"
              />
            ) : (
              <div className="profile-avatar profile-avatar-placeholder">
                👤
              </div>
            )}
          </button>

          <button
            type="button"
            className="profile-edit-button"
            onClick={openEdit}
            aria-label="Naam en status aanpassen"
          >
            ✏️
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            hidden
          />
        </div>

        <h2 className="profile-name">
          {profile.username}
        </h2>

        {profile.status && (
          <p className="profile-status">
            {profile.status}
          </p>
        )}

        <p className="profile-book-count">
          {bookCount}{' '}
          {bookCount === 1 ? 'boek' : 'boeken'}
        </p>

        <button
          type="button"
          className="logout-button"
          onClick={onLogout}
        >
          Uitloggen
        </button>
      </section>

      {editOpen && (
        <div className="profile-edit-overlay">
          <div className="profile-edit-modal">
            <div className="profile-edit-header">
              <h3>Profiel aanpassen</h3>

              <button
                type="button"
                className="profile-edit-close"
                onClick={() => setEditOpen(false)}
                aria-label="Sluiten"
              >
                ×
              </button>
            </div>

            <label>
              Naam
              <input
                type="text"
                value={editUsername}
                onChange={(event) =>
                  setEditUsername(event.target.value)
                }
                maxLength={30}
              />
            </label>

            <label>
              Status
              <input
                type="text"
                value={editStatus}
                onChange={(event) =>
                  setEditStatus(event.target.value)
                }
                maxLength={80}
                placeholder="Bijvoorbeeld: Lezen is mijn favoriete hobby 📚"
              />
            </label>

            <div className="profile-edit-actions">
              <button
                type="button"
                className="profile-edit-cancel"
                onClick={() => setEditOpen(false)}
              >
                Annuleren
              </button>

              <button
                type="button"
                className="profile-edit-save"
                onClick={saveProfile}
                disabled={saving}
              >
                {saving ? 'Opslaan...' : 'Opslaan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default Profile