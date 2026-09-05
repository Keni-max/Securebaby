import { useEffect, useState } from 'react'
import { Baby, Search, Plus, Radio, Unlock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import './GestionBebes.css'

function GestionBebes() {
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [babies, setBabies] = useState([])
  const [loading, setLoading] = useState(true)

  // Récupérer les bébés
  const loadBabies = () => {
    fetch('http://127.0.0.1:5000/api/babies')
      .then((response) => response.json())
      .then((data) => {
        console.log('Bébés récupérés :', data)
        setBabies(data)
        setLoading(false)
      })
      .catch((error) => {
        console.error('Erreur récupération des bébés :', error)
        setLoading(false)
      })
  }

  useEffect(() => {
    loadBabies()
  }, [])

  // Libérer le bracelet
  const handleLibererBracelet = async (baby) => {
    const confirmation = window.confirm(
      `Voulez-vous vraiment libérer le bracelet ${baby.bracelet} attribué à ${baby.nom} ${baby.prenom} ?`
    )

    if (!confirmation) {
      return
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:5000/api/babies/${baby.id}/liberer-bracelet`,
        {
          method: 'POST',
        }
      )

      const data = await response.json()

      if (response.ok && data.success) {
        alert(data.message)

        // Actualiser la liste
        loadBabies()
      } else {
        alert(data.message || 'Impossible de libérer le bracelet.')
      }

    } catch (error) {
      console.error('Erreur libération bracelet :', error)
      alert('Impossible de contacter le serveur.')
    }
  }

  // Recherche
  const filtered = babies.filter((baby) => {
    const nomComplet = `${baby.nom} ${baby.prenom}`.toLowerCase()
    const bracelet = (baby.bracelet || '').toLowerCase()
    const searchText = search.toLowerCase()

    return (
      nomComplet.includes(searchText) ||
      bracelet.includes(searchText)
    )
  })

  return (
    <div className="gestion-page">

      <header className="gestion-header">
        <div>
          <h1>
            <Baby size={24} />
            Gestion des bébés &amp; bracelets
          </h1>

          <p>
            {babies.length}{' '}
            {babies.length > 1
              ? 'bébés enregistrés'
              : 'bébé enregistré'}
          </p>
        </div>

        <button
          className="add-button"
          onClick={() => navigate('/nouveau-bebe')}
        >
          <Plus size={16} />
          Nouveau bébé
        </button>
      </header>

      <div className="search-bar">
        <Search size={16} />

        <input
          type="text"
          placeholder="Rechercher un bébé ou un bracelet..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Chargement */}
      {loading && (
        <div className="gestion-empty">
          <p>Chargement des bébés...</p>
        </div>
      )}

      {/* Aucun bébé */}
      {!loading && babies.length === 0 && (
        <div className="gestion-empty">
          <Baby size={40} />

          <h2>Aucun bébé enregistré</h2>

          <p>
            Aucun bébé n'est actuellement enregistré dans le système.
          </p>

          <button
            className="add-button"
            onClick={() => navigate('/nouveau-bebe')}
          >
            <Plus size={16} />
            Enregistrer un bébé
          </button>
        </div>
      )}

      {/* Aucun résultat */}
      {!loading &&
        babies.length > 0 &&
        filtered.length === 0 && (
          <div className="gestion-empty">
            <Search size={32} />

            <h2>Aucun résultat</h2>

            <p>
              Aucun bébé ou bracelet ne correspond à votre recherche.
            </p>
          </div>
        )}

      {/* Liste des bébés */}
      {!loading && filtered.length > 0 && (
        <div className="gestion-list">

          {filtered.map((baby) => (
            <div
              className="gestion-card"
              key={baby.id}
            >

              <div className="gestion-icon">
                <Radio size={18} />
              </div>

              <div className="gestion-info">

                <strong>
                  {baby.nom} {baby.prenom}
                </strong>

                <span>
                  {baby.bracelet} —{' '}
                  {baby.nom_mere || 'Parent non renseigné'}
                </span>

              </div>

              <span className="status-badge active">
                Actif
              </span>

              <button
                className="release-button"
                onClick={() => handleLibererBracelet(baby)}
              >
                <Unlock size={15} />
                Libérer
              </button>

            </div>
          ))}

        </div>
      )}

    </div>
  )
}

export default GestionBebes