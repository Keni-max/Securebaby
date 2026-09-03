import { useNavigate } from 'react-router-dom'
import '../App.css'
import babyImage from '../assets/bbneo1.jpeg'

function Login() {
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    navigate('/dashboard')
  }

  return (
    <main className="page">
      <div className="container">
        <section
          className="illustration"
          style={{ backgroundImage: `url(${babyImage})` }}
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
            <p>Sécurité &amp; Suivi des nouveau-nés</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="email">Identifiant ou e-mail</label>
              <input type="text" id="email" placeholder="Entrez votre identifiant" />
            </div>

            <div className="input-group">
              <label htmlFor="password">Mot de passe</label>
              <input type="password" id="password" placeholder="Entrez votre mot de passe" />
            </div>

            <div className="forgot">
              <a href="#mot-de-passe">Mot de passe oublié ?</a>
            </div>

            <button type="submit" className="login-button">
              Se connecter
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