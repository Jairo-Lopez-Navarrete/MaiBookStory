import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

function Login({ onRegister }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()

    setError('')
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    }

    setLoading(false)
  }

  return (
    <main className="auth-page">
      <div className="auth-container">
        <div className="auth-logo">📚</div>

        <h1>MaiBookStory</h1>

        <p className="auth-subtitle">
          Welkom MaiBookUser
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-field">
            <label htmlFor="login-email">
              E-mail
            </label>

            <input
              id="login-email"
              type="email"
              placeholder="jouw@email.com"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="login-password">
              Wachtwoord
            </label>

            <input
              id="login-password"
              type="password"
              placeholder="Je wachtwoord"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              required
            />
          </div>

          {error && (
            <p className="auth-error">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Inloggen...' : 'Inloggen'}
          </button>
        </form>

        <div className="auth-switch">
          <p>Nog geen account?</p>

          <button
            type="button"
            onClick={onRegister}
          >
            Account aanmaken
          </button>
        </div>
      </div>
    </main>
  )
}

export default Login