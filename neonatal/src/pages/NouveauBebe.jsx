import { useEffect, useState } from 'react'
import { Baby, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import './NouveauBebe.css'

function NouveauBebe() {
  const navigate = useNavigate()

  const [parents, setParents] = useState([])
  const [loadingParents, setLoadingParents] = useState(true)

  const [availableBracelets, setAvailableBracelets] = useState([])
  const [loadingBracelets, setLoadingBracelets] = useState(true)

  const [braceletChoice, setBraceletChoice] = useState('')

  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    dateNaissance: '',
    heureNaissance: '',
    sexe: '',
    nomMere: '',
    telephoneMere: '',
    emailParent: '',
    parentId: '',
    bracelet: '',
  })

  // =========================
  // RÉCUPÉRER LES PARENTS
  // =========================
  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/parents')
      .then((response) => response.json())
      .then((data) => {
        setParents(data)
        setLoadingParents(false)
      })
      .catch((error) => {
        console.error('Erreur récupération parents :', error)
        setLoadingParents(false)
      })
  }, [])

  // =========================
  // RÉCUPÉRER LES BRACELETS DISPONIBLES
  // =========================
  useEffect(() => {
    Promise.all([
      fetch('http://127.0.0.1:5000/api/history'),
      fetch('http://127.0.0.1:5000/api/babies'),
    ])
      .then(async ([historyResponse, babiesResponse]) => {
        const history = await historyResponse.json()
        const babies = await babiesResponse.json()

        // Bracelets actuellement utilisés
        const braceletsUtilises = babies
          .map((baby) => baby.bracelet)
          .filter(Boolean)

        // Bracelets déjà présents dans l'historique
        const braceletsHistorique = history
          .map((record) => record.bracelet)
          .filter(Boolean)

        // Garder uniquement les bracelets non utilisés
        const braceletsDisponibles = [
          ...new Set(braceletsHistorique),
        ].filter(
          (bracelet) =>
            !braceletsUtilises.includes(bracelet)
        )

        setAvailableBracelets(braceletsDisponibles)
        setLoadingBracelets(false)
      })
      .catch((error) => {
        console.error(
          'Erreur récupération des bracelets :',
          error
        )
        setLoadingBracelets(false)
      })
  }, [])

  // =========================
  // MODIFICATION DU FORMULAIRE
  // =========================
  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))

    // Sélection du parent
    if (name === 'parentId') {
      const parent = parents.find(
        (p) => String(p.id) === String(value)
      )

      if (parent) {
        setFormData((previous) => ({
          ...previous,
          parentId: value,
          nomMere: `${parent.nom} ${parent.prenom}`,
          telephoneMere: parent.telephone,
          emailParent: parent.email || '',
        }))
      }
    }
  }

  // =========================
  // CHOIX DU BRACELET
  // =========================
  const handleBraceletChoice = (e) => {
    const value = e.target.value

    setBraceletChoice(value)

    if (value !== 'nouveau') {
      setFormData((previous) => ({
        ...previous,
        bracelet: value,
      }))
    } else {
      setFormData((previous) => ({
        ...previous,
        bracelet: '',
      }))
    }
  }

  // =========================
  // ENREGISTRER LE BÉBÉ
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.bracelet) {
      alert('Veuillez sélectionner ou saisir un bracelet.')
      return
    }

    try {
      const response = await fetch(
        'http://127.0.0.1:5000/api/babies',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        }
      )

      const data = await response.json()

      if (data.success) {
        alert('Bébé enregistré avec succès !')
        navigate('/gestion')
      } else {
        alert(data.message)
      }

    } catch (error) {
      console.error(error)
      alert('Impossible de contacter le serveur.')
    }
  }

  return (
    <div className="nouveau-bebe-page">

      {/* =========================
          EN-TÊTE
      ========================= */}

      <header className="nouveau-bebe-header">

        <button
          className="back-button"
          onClick={() => navigate('/gestion')}
        >
          <ArrowLeft size={18} />
          Retour
        </button>

        <div>
          <h1>
            <Baby size={24} />
            Nouveau bébé
          </h1>
        </div>

      </header>


      <form
        className="bebe-form"
        onSubmit={handleSubmit}
      >

        {/* =========================
            INFORMATIONS DU BÉBÉ
        ========================= */}

        <div className="form-section">

          <h2>Informations du bébé</h2>

          <div className="form-grid">

            <div className="input-group">

              <label>Nom</label>

              <input
                type="text"
                name="nom"
                placeholder="Nom du bébé"
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
                placeholder="Prénom du bébé"
                value={formData.prenom}
                onChange={handleChange}
                required
              />

            </div>


            <div className="input-group">

              <label>Date de naissance</label>

              <input
                type="date"
                name="dateNaissance"
                value={formData.dateNaissance}
                onChange={handleChange}
                required
              />

            </div>


            <div className="input-group">

              <label>Heure de naissance</label>

              <input
                type="time"
                name="heureNaissance"
                value={formData.heureNaissance}
                onChange={handleChange}
                required
              />

            </div>


            <div className="input-group">

              <label>Sexe</label>

              <select
                name="sexe"
                value={formData.sexe}
                onChange={handleChange}
                required
              >

                <option value="">
                  Sélectionner
                </option>

                <option value="F">
                  Féminin
                </option>

                <option value="M">
                  Masculin
                </option>

              </select>

            </div>

          </div>

        </div>


        {/* =========================
            INFORMATIONS DU PARENT
        ========================= */}

        <div className="form-section">

          <h2>Informations du parent</h2>

          <div className="form-grid">

            <div className="input-group">

              <label>
                Nom complet du parent
              </label>

              <select
                name="parentId"
                value={formData.parentId}
                onChange={handleChange}
                required
              >

                <option value="">
                  {loadingParents
                    ? 'Chargement des parents...'
                    : 'Sélectionner un parent'}
                </option>

                {parents.map((parent) => (

                  <option
                    key={parent.id}
                    value={parent.id}
                  >
                    {parent.nom} {parent.prenom}
                  </option>

                ))}

              </select>

            </div>


            <div className="input-group">

              <label>Téléphone</label>

              <input
                type="tel"
                name="telephoneMere"
                placeholder="Téléphone du parent"
                value={formData.telephoneMere}
                onChange={handleChange}
                required
              />

            </div>


            <div className="input-group">

              <label>Email du parent</label>

              <input
                type="email"
                name="emailParent"
                placeholder="Email du parent"
                value={formData.emailParent}
                onChange={handleChange}
              />

            </div>

          </div>

        </div>


        {/* =========================
            BRACELET DE SÉCURITÉ
        ========================= */}

        <div className="form-section">

          <h2>Bracelet de sécurité</h2>

          <div className="input-group">

            <label>
              Choisir un bracelet
            </label>

            <select
              value={braceletChoice}
              onChange={handleBraceletChoice}
              required
            >

              <option value="">
                {loadingBracelets
                  ? 'Chargement...'
                  : 'Sélectionner une option'}
              </option>

              {/* Bracelets libérés */}
              {availableBracelets.length > 0 && (
                <optgroup label="Bracelets disponibles">

                  {availableBracelets.map(
                    (bracelet) => (

                      <option
                        key={bracelet}
                        value={bracelet}
                      >
                        {bracelet} — Disponible
                      </option>

                    )
                  )}

                </optgroup>
              )}

              {/* Nouveau bracelet */}
              <option value="nouveau">
                + Nouveau bracelet
              </option>

            </select>

          </div>


          {/* Champ pour nouveau bracelet */}

          {braceletChoice === 'nouveau' && (

            <div
              className="input-group"
              style={{ marginTop: '15px' }}
            >

              <label>
                Identifiant du nouveau bracelet
              </label>

              <input
                type="text"
                name="bracelet"
                placeholder="Ex : BR-005"
                value={formData.bracelet}
                onChange={handleChange}
                required
              />

            </div>

          )}

        </div>


        {/* =========================
            BOUTONS
        ========================= */}

        <div className="form-actions">

          <button
            type="button"
            className="cancel-button"
            onClick={() => navigate('/gestion')}
          >
            Annuler
          </button>

          <button
            type="submit"
            className="save-button"
          >
            Enregistrer le bébé
          </button>

        </div>

      </form>

    </div>
  )
}

export default NouveauBebe