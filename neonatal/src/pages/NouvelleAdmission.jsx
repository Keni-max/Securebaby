import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserPlus, ArrowLeft, Radio, Lock, Mail, User } from 'lucide-react'
import './NouvelleAdmission.css'

function NouvelleAdmission() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    identifiant_mere: '',
    nom_mere: '',
    telephone_mere: '',
    email: '',
    password: '',
    confirm_password: '',
    bracelet: '',
    role: 'parent',
  })

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    setLoading(true)
    setMessage('')
    setError('')

    // =========================
    // VERIFICATION MOT DE PASSE
    // =========================
    if (formData.password !== formData.confirm_password) {
      setError('Les mots de passe ne correspondent pas.')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError(
        'Le mot de passe doit contenir au moins 6 caractères.'
      )
      setLoading(false)
      return
    }

    try {
      const response = await fetch(
        'http://127.0.0.1:5000/api/admissions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        }
      )

      const data = await response.json()

      if (response.ok && data.success) {
        setMessage(
          'Admission enregistrée et compte parent créé avec succès.'
        )

        setTimeout(() => {
          navigate('/gestion')
        }, 1500)
      } else {
        setError(
          data.message ||
            'Impossible d’enregistrer l’admission.'
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
    <div className="admission-page">

      {/* =========================
          EN-TETE
      ========================= */}
      <header className="admission-header">

        <button
          className="back-button"
          onClick={() => navigate('/gestion')}
        >
          <ArrowLeft size={17} />
          Retour
        </button>

        <div>
          <h1>
            <UserPlus size={24} />
            Nouvelle admission
          </h1>

          <p>
            Enregistrer une future naissance et créer le compte parent
          </p>
        </div>

      </header>


      {/* =========================
          FORMULAIRE
      ========================= */}
      <form
        className="admission-form"
        onSubmit={handleSubmit}
      >

        {/* =========================
            INFORMATIONS DE LA MERE
        ========================= */}
        <div className="form-section">

          <h2>
            <User size={18} />
            Informations de la mère
          </h2>

          <div className="form-grid">

            <div className="input-group">
              <label>
                Identifiant de la mère
              </label>

              <input
                type="text"
                name="identifiant_mere"
                placeholder="Ex : MERE-001"
                value={formData.identifiant_mere}
                onChange={handleChange}
                required
              />
            </div>


            <div className="input-group">
              <label>
                Nom de la mère
              </label>

              <input
                type="text"
                name="nom_mere"
                placeholder="Ex : Marie Dupont"
                value={formData.nom_mere}
                onChange={handleChange}
                required
              />
            </div>


            <div className="input-group">
              <label>
                Numéro de téléphone
              </label>

              <input
                type="tel"
                name="telephone_mere"
                placeholder="Ex : 690000000"
                value={formData.telephone_mere}
                onChange={handleChange}
                required
              />
            </div>

          </div>

        </div>


        {/* =========================
            COMPTE PARENT
        ========================= */}
        <div className="form-section">

          <h2>
            <Lock size={18} />
            Compte parent
          </h2>

          <p
            style={{
              marginBottom: '20px',
              color: '#666',
              fontSize: '14px',
            }}
          >
            Ces informations permettront à la mère de se connecter
            à son espace personnel.
          </p>


          <div className="form-grid">

            {/* EMAIL */}
            <div className="input-group">

              <label>
                <Mail size={15} />
                Adresse email
              </label>

              <input
                type="email"
                name="email"
                placeholder="Ex : marie@gmail.com"
                value={formData.email}
                onChange={handleChange}
                required
              />

            </div>


            {/* MOT DE PASSE */}
            <div className="input-group">

              <label>
                <Lock size={15} />
                Mot de passe
              </label>

              <input
                type="password"
                name="password"
                placeholder="Minimum 6 caractères"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
              />

            </div>


            {/* CONFIRMATION */}
            <div className="input-group">

              <label>
                <Lock size={15} />
                Confirmer le mot de passe
              </label>

              <input
                type="password"
                name="confirm_password"
                placeholder="Confirmer le mot de passe"
                value={formData.confirm_password}
                onChange={handleChange}
                required
                minLength={6}
              />

            </div>


            {/* CATEGORIE */}
            <div className="input-group">

              <label>
                Catégorie
              </label>

              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                disabled
              >
                <option value="parent">
                  Parent
                </option>
              </select>

              <small>
                La catégorie est automatiquement définie comme
                « Parent » pour une admission.
              </small>

            </div>

          </div>

        </div>


        {/* =========================
            BRACELET
        ========================= */}
        <div className="form-section">

          <h2>
            <Radio size={18} />
            Bracelet de sécurité
          </h2>

          <div className="input-group">

            <label>
              Identifiant du bracelet réservé
            </label>

            <input
              type="text"
              name="bracelet"
              placeholder="Ex : R-002"
              value={formData.bracelet}
              onChange={handleChange}
              required
            />

            <small>
              Le bracelet sera enregistré comme « Réservé »
              jusqu'à son activation.
            </small>

          </div>

        </div>


        {/* =========================
            MESSAGES
        ========================= */}
        {message && (
          <p className="success-message">
            {message}
          </p>
        )}

        {error && (
          <p className="error-message">
            {error}
          </p>
        )}


        {/* =========================
            BOUTON
        ========================= */}
        <button
          type="submit"
          className="submit-button"
          disabled={loading}
        >
          {loading
            ? 'Enregistrement...'
            : 'Enregistrer l’admission'}
        </button>

      </form>

    </div>
  )
}

export default NouvelleAdmission