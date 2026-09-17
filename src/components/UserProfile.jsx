import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

function UserProfile({ user, onBack }) {
  const [profile, setProfile] = useState(null)
  const [bookCount, setBookCount] = useState(0)
  const [books, setBooks] = useState([])
  const [followerCount, setFollowerCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)

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
    } else {
      setProfile(data)
    }
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

  async function checkFollowing() {
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser()

    if (!currentUser || currentUser.id === user.id) {
      return
    }

    const { data, error } = await supabase
      .from('follows')
      .select('follower_id')
      .eq('follower_id', currentUser.id)
      .eq('following_id', user.id)
      .maybeSingle()

    if (error) {
      console.error(
        'Fout bij controleren van volgen:',
        error,
      )
      return
    }

    setIsFollowing(Boolean(data))
  }

  async function handleFollow() {
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser()

    if (!currentUser || currentUser.id === user.id) {
      return
    }

    if (isFollowing) {
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', currentUser.id)
        .eq('following_id', user.id)

      if (error) {
        console.error(
          'Fout bij ontvolgen:',
          error,
        )
        return
      }

      setIsFollowing(false)
      setFollowerCount((count) =>
        Math.max(0, count - 1),
      )
    } else {
      const { error } = await supabase
        .from('follows')
        .insert({
          follower_id: currentUser.id,
          following_id: user.id,
        })

      if (error) {
        console.error(
          'Fout bij volgen:',
          error,
        )
        return
      }

      setIsFollowing(true)
      setFollowerCount((count) => count + 1)
    }
  }

async function loadUserBooks() {
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', {
      ascending: false,
    })

  if (error) {
    console.error(
      'Fout bij laden van boeken:',
      error,
    )
  } else {
    setBooks(data || [])
    setBookCount(data?.length || 0)
  }

  setLoading(false)
}
  useEffect(() => {
    loadProfile()
    loadFollowCounts()
    checkFollowing()
    loadUserBooks()
  }, [user.id])

  return (
    <main className="profile-page">
      <button
        type="button"
        onClick={onBack}
      >
        ← Terug
      </button>

      <div className="profile-header">
        <div className="profile-avatar">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={`Profielfoto van ${
                profile.username
              }`}
            />
          ) : (
            '👤'
          )}
        </div>

        <h2>
          {profile?.username || user.username}
        </h2>

        {profile?.status && (
          <p>{profile.status}</p>
        )}

        {user.id !== profile?.id && (
          <button
            type="button"
            onClick={handleFollow}
          >
            {isFollowing
              ? 'Volgend'
              : 'Volgen'}
          </button>
        )}

        {loading ? (
          <p>Profiel laden...</p>
        ) : (
          <div>
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
        )}
      </div>
      <section className="user-books">
  <h3>📚 Boeken</h3>

  {books.length === 0 ? (
    <p>Deze gebruiker heeft nog geen boeken toegevoegd.</p>
  ) : (
    <div className="user-books-grid">
      {books.map((book) => (
        <article
          key={book.id}
          className="user-book-card"
        >
          <div className="user-book-cover">
            <img
              src={book.cover}
              alt={`Cover van ${book.title}`}
            />
          </div>

          <h4>{book.title}</h4>

          <p>{book.author}</p>

          <div
            className="user-book-rating"
            aria-label={`Rating: ${book.rating} van 5`}
          >
            {'★'.repeat(book.rating)}
            {'☆'.repeat(5 - book.rating)}
          </div>
        </article>
      ))}
    </div>
  )}
</section>
    </main>
  )
}

export default UserProfile