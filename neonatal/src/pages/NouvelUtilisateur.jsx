import { useState } from 'react'
import { UserPlus, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import './NouvelUtilisateur.css'

function NouvelUtilisateur() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    telephone: '',
    email: '',
    identifiant: '',
    password: '',
    role: '',
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
  e.preventDefault()

  try {
    const response = await fetch('http://127.0.0.1:5000/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })

    const data = await response.json()

    if (data.success) {
      alert('Utilisateur créé avec succès !')
      navigate('/dashboard/admin')
    } else {
      alert(data.message)
    }

  } catch (error) {
    console.error(error)
    alert('Impossible de contacter le serveur.')
  }
}

 


  return (
    <div className="nouvel-utilisateur-page">

      <header className="nouvel-utilisateur-header">

        <button
          className="back-button"
          onClick={() => navigate('/dashboard/admin')}
        >
          <ArrowLeft size={18} />
          Retour
        </button>

        <div>
          <h1>
            <UserPlus size={24} />
            Nouvel utilisateur
          </h1>

          
        </div>

      </header>

      <form
        className="utilisateur-form"
        onSubmit={handleSubmit}
      >

        <div className="form-section">

          <h2>Informations personnelles</h2>

          <div className="form-grid">

            <div className="input-group">
              <label>Nom</label>

              <input
                type="text"
                name="nom"
                placeholder="Nom"
                value={formData.nom}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label>Prénom</label>

              <input
                type="text"
                name="prenom"
                placeholder="Prénom"
                value={formData.prenom}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label>Téléphone</label>

              <input
                type="tel"
                name="telephone"
                placeholder="Ex : 6XXXXXXXX"
                value={formData.telephone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label>Email</label>

              <input
                type="email"
                name="email"
                placeholder="exemple@email.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

          </div>

        </div>

        <div className="form-section">

          <h2>Informations du compte</h2>

          <div className="form-grid">

            <div className="input-group">
              <label>Identifiant</label>

              <input
                type="text"
                name="identifiant"
                placeholder="Identifiant de connexion"
                value={formData.identifiant}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label>Mot de passe</label>

              <input
                type="password"
                name="password"
                placeholder="Mot de passe"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label>Type d'utilisateur</label>

              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="">Sélectionner un rôle</option>
                <option value="parent">Parent</option>
                <option value="personnel">Personnel</option>
                <option value="admin">Administrateur</option>
              </select>
            </div>

          </div>

        </div>

        <div className="form-actions">

          <button
            type="button"
            className="cancel-button"
            onClick={() => navigate('/dashboard/admin')}
          >
            Annuler
          </button>

          <button
            type="submit"
            className="save-button"
          >
            Créer le compte
          </button>

        </div>

      </form>

    </div>
  )
}

export default NouvelUtilisateur