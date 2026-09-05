import { useEffect, useState } from 'react'
import { Baby, MapPin, ShieldCheck, AlertTriangle } from 'lucide-react'
import './DashboardParent.css'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'
import { useNavigate } from 'react-router-dom'

const defaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

L.Marker.prototype.options.icon = defaultIcon

function DashboardParent() {
  const navigate = useNavigate()

  const [babies, setBabies] = useState([])
  const [loading, setLoading] = useState(true)

  const userId = localStorage.getItem('user_id')

  useEffect(() => {
    if (!userId) {
      console.log('Aucun parent connecté')
      setLoading(false)
      return
    }

    const loadBabies = () => {
      fetch(`http://127.0.0.1:5000/api/babies/parent/${userId}`)
        .then((response) => response.json())
        .then((data) => {
          console.log('Bébés du parent :', data)
          setBabies(Array.isArray(data) ? data : [])
          setLoading(false)
        })
        .catch((error) => {
          console.error('Erreur récupération bébé :', error)
          setLoading(false)
        })
    }

    loadBabies()

    // Actualisation automatique toutes les 10 secondes
    const interval = setInterval(() => {
      loadBabies()
    }, 10000)

    return () => {
      clearInterval(interval)
    }
  }, [userId])

  // Chargement
  if (loading) {
    return (
      <div className="dashboard-parent">
        <p>Chargement des informations...</p>
      </div>
    )
  }

  // Aucun bébé associé
  if (babies.length === 0) {
    return (
      <div className="dashboard-parent">

        <header className="dp-header">
          <div>
            <h1>Mon suivi</h1>
            <p>Aucun bébé associé à ce compte</p>
          </div>

          <div className="user-badge">
            Parent
          </div>
        </header>

        <section className="panel">
          <h2>
            <Baby size={16} />
            Aucun bébé enregistré
          </h2>

          <p>
            Aucun bébé n'est actuellement associé à votre compte.
          </p>
        </section>

      </div>
    )
  }

  const alerts = []

  return (
    <div className="dashboard-parent">

      {/* ========================= */}
      {/* EN-TÊTE */}
      {/* ========================= */}

      <header className="dp-header">

        <div>
          <h1>Mon suivi</h1>

          <p>
            {babies.length === 1
              ? '1 bébé associé à votre compte'
              : `${babies.length} bébés associés à votre compte`}
          </p>
        </div>

        <div className="user-badge">
          Parent
        </div>

      </header>


      {/* ========================= */}
      {/* CARTES DES BÉBÉS */}
      {/* ========================= */}

      {babies.map((babyData) => {

        const baby = {
          name: `${babyData.nom} ${babyData.prenom}`,
          bracelet: babyData.bracelet,
          status: 'safe',
          lastUpdate: 'À l’instant',
        }

        return (
          <section
            className="panel"
            key={babyData.id}
            style={{ marginBottom: '20px' }}
          >

            {/* Nom du bébé */}

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '18px',
                gap: '15px',
                flexWrap: 'wrap',
              }}
            >

              <div>

                <h2 style={{ marginBottom: '5px' }}>
                  <Baby size={18} />
                  {baby.name}
                </h2>

                <p style={{ margin: 0 }}>
                  Bracelet : <strong>{baby.bracelet}</strong>
                </p>

              </div>

            </div>


            {/* ========================= */}
            {/* STATUT */}
            {/* ========================= */}

            <section className={`status-card ${baby.status}`}>

              <div className="status-icon">

                {baby.status === 'safe' ? (
                  <ShieldCheck size={28} />
                ) : (
                  <AlertTriangle size={28} />
                )}

              </div>

              <div>

                <div className="status-title">

                  {baby.status === 'safe'
                    ? 'Votre bébé est en sécurité'
                    : 'Alerte en cours'}

                </div>

                <div className="status-time">

                  Dernière mise à jour : {baby.lastUpdate}

                </div>

              </div>

            </section>


            {/* ========================= */}
            {/* CARTE + FICHE */}
            {/* ========================= */}

            <section className="dp-content">

              {/* CARTE */}

              <div className="panel">

                <h2>
                  <MapPin size={16} />
                  Position actuelle
                </h2>

                <div
                  className="mini-map"
                  onClick={() => navigate('/carte')}
                  style={{ cursor: 'pointer' }}
                >

                  <MapContainer
                    center={[3.8483, 11.5030]}
                    zoom={17}
                    style={{
                      height: '100%',
                      width: '100%',
                    }}
                    zoomControl={false}
                    dragging={false}
                    scrollWheelZoom={false}
                  >

                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    <Marker position={[3.8483, 11.5030]} />

                  </MapContainer>

                </div>

              </div>


              {/* FICHE BÉBÉ */}

              <div className="panel">

                <h2>
                  <Baby size={16} />
                  Fiche bébé
                </h2>

                <ul className="info-list">

                  <li>
                    <span>Nom</span>
                    <strong>{babyData.nom}</strong>
                  </li>

                  <li>
                    <span>Prénom</span>
                    <strong>{babyData.prenom}</strong>
                  </li>

                  <li>
                    <span>Date de naissance</span>
                    <strong>{babyData.date_naissance}</strong>
                  </li>

                  <li>
                    <span>Heure de naissance</span>
                    <strong>{babyData.heure_naissance}</strong>
                  </li>

                  <li>
                    <span>Sexe</span>
                    <strong>
                      {babyData.sexe === 'F'
                        ? 'Féminin'
                        : 'Masculin'}
                    </strong>
                  </li>

                  <li>
                    <span>Bracelet</span>
                    <strong>{babyData.bracelet}</strong>
                  </li>

                  <li>
                    <span>Statut</span>
                    <strong>
                      {baby.status === 'safe'
                        ? 'Sécurisé'
                        : 'Alerte'}
                    </strong>
                  </li>

                </ul>

              </div>

            </section>

          </section>
        )
      })}


      {/* ========================= */}
      {/* ALERTES */}
      {/* ========================= */}

      <section className="panel">

        <h2>Mes alertes</h2>

        {alerts.length === 0 ? (

          <p className="no-alert">
            Aucune alerte pour le moment.
          </p>

        ) : (

          <ul className="alert-list">

            {alerts.map((a) => (

              <li
                key={a.id}
                className={`alert-item ${a.level}`}
              >

                <div className="alert-icon">
                  <AlertTriangle size={16} />
                </div>

                <div className="alert-body">
                  <strong>{a.type}</strong>
                </div>

                <span className="alert-time">
                  {a.time}
                </span>

              </li>

            ))}

          </ul>

        )}

      </section>

    </div>
  )
}

export default DashboardParent

