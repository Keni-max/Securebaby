import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../App.css'
import babyImage from '../assets/bbneo1.jpeg'
import { API_URL } from '../api'

function Login() {
  const navigate = useNavigate()

  const [identifiant, setIdentifiant] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    setError('')
    setLoading(true)

    try {
      const response = await fetch(
        `${API_URL}/api/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            identifiant,
            password,
          }),
        }
      )

      const data = await response.json()

      if (response.ok && data.success) {

        // --------------------------------------------------
        // SUPPRIMER L'ANCIENNE SESSION
        // --------------------------------------------------
        localStorage.removeItem('user_id')
        localStorage.removeItem('role')
        localStorage.removeItem('nom')
        localStorage.removeItem('prenom')
        localStorage.removeItem('email')

        // --------------------------------------------------
        // ENREGISTRER LA NOUVELLE SESSION
        // --------------------------------------------------
        localStorage.setItem(
          'user_id',
          String(data.user_id)
        )

        localStorage.setItem(
          'role',
          data.role
        )

        localStorage.setItem(
          'nom',
          data.nom || ''
        )

        localStorage.setItem(
          'prenom',
          data.prenom || ''
        )

        localStorage.setItem(
          'email',
          data.email || ''
        )

        // --------------------------------------------------
        // REDIRECTION SELON LE ROLE
        // --------------------------------------------------
        if (data.role === 'admin') {

          navigate('/dashboard/admin')

        } else if (data.role === 'parent') {

          navigate('/dashboard/parent')

        } else if (data.role === 'personnel') {

          navigate('/dashboard/personnel')

        } else {

          setError(
            'Catégorie utilisateur inconnue.'
          )
        }

      } else {

        setError(
          data.message ||
          'Identifiant/e-mail ou mot de passe incorrect.'
        )
      }

    } catch (error) {

      console.error(error)

      setError(
        'Impossible de contacter le serveur.'
      )

    } finally {

      setLoading(false)
    }
  }

  return (
    <main className="page">

      <div className="container">

        <section
          className="illustration"
          style={{
            backgroundImage: `url(${babyImage})`
          }}
        >

          <div className="illustration-content">

            <h1>Protégeons nos bébés</h1>

            <p>
              « Derrière chaque bébé se trouve une famille qui l'attend,
              l'aime et espère le voir grandir. Ensemble, faisons de chaque
              naissance une naissance protégée. »
            </p>

          </div>

        </section>

        <section className="login">

          <div className="logo">

            <h2>NEONATAL</h2>

            <p>
              Sécurité &amp; Suivi des nouveau-nés
            </p>

          </div>

          <form onSubmit={handleSubmit}>

            <div className="input-group">

              <label htmlFor="email">
                Identifiant ou e-mail
              </label>

              <input
                type="text"
                id="email"
                placeholder="Entrez votre identifiant ou e-mail"
                value={identifiant}
                onChange={(e) =>
                  setIdentifiant(e.target.value)
                }
                required
              />

            </div>

            <div className="input-group">

              <label htmlFor="password">
                Mot de passe
              </label>

              <input
                type="password"
                id="password"
                placeholder="Entrez votre mot de passe"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
              />

            </div>

            <div className="forgot">

              <a href="#mot-de-passe">
                Mot de passe oublié ?
              </a>

            </div>

            {error && (
              <p style={{ color: 'red' }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading
                ? 'Connexion...'
                : 'Se connecter'}
            </button>

          </form>

          <div className="bottom-text">

            Accès sécurisé réservé aux utilisateurs autorisés.

          </div>

        </section>

      </div>

    </main>
  )
}

export default Login