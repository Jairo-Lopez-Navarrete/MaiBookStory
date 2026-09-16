import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

function Register({ onLogin }) {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()

    setError('')
    setSuccess('')

    if (password !== confirmPassword) {
      setError('De wachtwoorden komen niet overeen.')
      return
    }

    if (password.length < 6) {
      setError('Je wachtwoord moet minstens 6 tekens bevatten.')
      return
    }

    setLoading(true)

    const {
      data: { user },
      error,
    } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    if (user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          username: username.trim(),
        })

      if (profileError) {
        setError(profileError.message)
        setLoading(false)
        return
      }
    }

    setSuccess(
      'Account aangemaakt! Je kunt nu inloggen.',
    )

    setUsername('')
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setLoading(false)
  }

  return (
    <main className="auth-page">
      <div className="auth-container">
        <div className="auth-logo">📚</div>

        <h1>MaiBookStory</h1>

        <p className="auth-subtitle">
          Maak je account aan
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-field">
            <label htmlFor="register-username">
              Gebruikersnaam
            </label>

            <input
              id="register-username"
              type="text"
              placeholder="Bijvoorbeeld: Maite"
              value={username}
              onChange={(event) =>
                setUsername(event.target.value)
              }
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="register-email">
              E-mail
            </label>

            <input
              id="register-email"
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
            <label htmlFor="register-password">
              Wachtwoord
            </label>

            <input
              id="register-password"
              type="password"
              placeholder="Minstens 6 tekens"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="register-confirm-password">
              Wachtwoord opnieuw
            </label>

            <input
              id="register-confirm-password"
              type="password"
              placeholder="Herhaal je wachtwoord"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
              required
            />
          </div>

          {error && (
            <p className="auth-error">
              {error}
            </p>
          )}

          {success && (
            <p className="auth-success">
              {success}
            </p>
          )}

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading
              ? 'Account maken...'
              : 'Account aanmaken'}
          </button>
        </form>

        <div className="auth-switch">
          <p>Heb je al een account?</p>

          <button
            type="button"
            onClick={onLogin}
          >
            Terug naar inloggen
          </button>
        </div>
      </div>
    </main>
  )
}

export default Register