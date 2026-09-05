import { useEffect, useState } from 'react'

import {
  Baby,
  Radio,
  AlertTriangle,
  MapPin,
  ShieldCheck,
  History,
} from 'lucide-react'

import {
  MapContainer,
  TileLayer,
  Marker,
} from 'react-leaflet'

import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

import { useNavigate } from 'react-router-dom'

import './DashboardPersonnel.css'

const defaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

L.Marker.prototype.options.icon = defaultIcon

function DashboardPersonnel() {

  const navigate = useNavigate()

  const [babies, setBabies] = useState([])
  const [alerts, setAlerts] = useState([])

  const [user, setUser] = useState(null)

  const [loading, setLoading] = useState(true)
  const [loadingUser, setLoadingUser] = useState(true)

  // =========================
  // RÉCUPÉRER LE PERSONNEL CONNECTÉ
  // =========================

  const loadUser = () => {

    const userId = localStorage.getItem('user_id')

    if (!userId) {
      console.error('Aucun utilisateur connecté.')
      setLoadingUser(false)
      return
    }

    fetch(`http://127.0.0.1:5000/api/users/${userId}`)
      .then((response) => response.json())
      .then((data) => {

        if (data.success) {
          setUser(data.user)
        } else {
          console.error(data.message)
        }

      })
      .catch((error) => {

        console.error(
          'Erreur récupération du personnel :',
          error
        )

      })
      .finally(() => {
        setLoadingUser(false)
      })
  }

  // =========================
  // RÉCUPÉRER LES BÉBÉS ET ALERTES
  // =========================

  const loadData = () => {

    fetch('http://127.0.0.1:5000/api/babies')
      .then((response) => response.json())
      .then((data) => {

        setBabies(
          Array.isArray(data) ? data : []
        )

      })
      .catch((error) => {

        console.error(
          'Erreur récupération des bébés :',
          error
        )

      })

    fetch('http://127.0.0.1:5000/api/dashboard/alerts')
      .then((response) => response.json())
      .then((data) => {

        setAlerts(
          Array.isArray(data) ? data : []
        )

      })
      .catch((error) => {

        console.error(
          'Erreur récupération des alertes :',
          error
        )

      })
      .finally(() => {
        setLoading(false)
      })
  }

  // =========================
  // CHARGEMENT
  // =========================

  useEffect(() => {

    loadUser()
    loadData()

    const interval = setInterval(() => {
      loadData()
    }, 10000)

    return () => {
      clearInterval(interval)
    }

  }, [])

  const bracelets = babies.filter(
    (baby) =>
      baby.bracelet &&
      baby.bracelet !== ''
  ).length

  const activeAlerts = alerts.filter(
    (alert) =>
      alert.status === 'active'
  ).length

  return (

    <div className="dashboard-personnel">

      {/* ========================= */}
      {/* EN-TÊTE */}
      {/* ========================= */}

      <header className="dp-header">

        <div>

          <h1>
            Tableau de bord
          </h1>

          <p>
            Suivi et surveillance des nouveau-nés
          </p>

        </div>

        <div className="user-badge">

          {loadingUser
            ? 'Chargement...'
            : user
              ? `${user.prenom} ${user.nom}`
              : 'Personnel'
          }

        </div>

      </header>


      {/* ========================= */}
      {/* STATISTIQUES */}
      {/* ========================= */}

      <section className="stats-grid">

        <div
          className="stat-card"
          onClick={() => navigate('/gestion')}
          style={{ cursor: 'pointer' }}
        >

          <div className="stat-icon icon-blue">
            <Baby size={21} />
          </div>

          <div>

            <div className="stat-value">
              {loading ? '...' : babies.length}
            </div>

            <div className="stat-label">
              Bébés surveillés
            </div>

          </div>

        </div>


        <div
          className="stat-card"
          onClick={() => navigate('/gestion')}
          style={{ cursor: 'pointer' }}
        >

          <div className="stat-icon icon-teal">
            <Radio size={21} />
          </div>

          <div>

            <div className="stat-value">
              {loading ? '...' : bracelets}
            </div>

            <div className="stat-label">
              Bracelets connectés
            </div>

          </div>

        </div>


        <div
          className="stat-card"
          onClick={() => {
            document
              .getElementById('alertes-personnel')
              ?.scrollIntoView({
                behavior: 'smooth',
              })
          }}
          style={{ cursor: 'pointer' }}
        >

          <div className="stat-icon icon-red">
            <AlertTriangle size={21} />
          </div>

          <div>

            <div className="stat-value">
              {loading ? '...' : activeAlerts}
            </div>

            <div className="stat-label">
              Alertes actives
            </div>

          </div>

        </div>

      </section>


      {/* ========================= */}
      {/* CONTENU */}
      {/* ========================= */}

      <section className="dashboard-content">


        {/* ========================= */}
        {/* BÉBÉS SURVEILLÉS */}
        {/* ========================= */}

        <div className="panel">

          <h2>
            <Baby size={17} />
            Bébés actuellement surveillés
          </h2>

          {babies.length === 0 ? (

            <p className="empty-message">
              Aucun bébé n'est actuellement enregistré.
            </p>

          ) : (

            <div className="baby-list">

              {babies.map((baby) => (

                <div
                  className="baby-item clickable"
                  key={baby.id}
                  onClick={() => navigate('/carte')}
                >

                  <div className="baby-icon">
                    <Baby size={20} />
                  </div>

                  <div className="baby-info">

                    <strong>
                      {baby.nom} {baby.prenom}
                    </strong>

                    <span>
                      Bracelet : {baby.bracelet}
                    </span>

                  </div>

                  <div className="baby-status">

                    <ShieldCheck size={15} />

                    Sécurisé

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>


        {/* ========================= */}
        {/* ALERTES */}
        {/* ========================= */}

        <div
          className="panel"
          id="alertes-personnel"
        >

          <h2>
            <AlertTriangle size={17} />
            Alertes récentes
          </h2>

          {alerts.length === 0 ? (

            <p className="empty-message">
              Aucune alerte récente.
            </p>

          ) : (

            <ul className="alert-list">

              {alerts.map((alert) => (

                <li
                  key={alert.id}
                  className={`alert-item ${
                    alert.status === 'active'
                      ? 'high'
                      : 'medium'
                  }`}
                >

                  <div className="alert-icon">

                    <AlertTriangle size={16} />

                  </div>

                  <div className="alert-body">

                    <strong>
                      {alert.baby || 'Bébé inconnu'}
                    </strong>

                    <span>
                      {alert.message || alert.type}
                    </span>

                  </div>

                  <span className="alert-time">
                    {alert.created_at}
                  </span>

                </li>

              ))}

            </ul>

          )}

        </div>

      </section>


      {/* ========================= */}
      {/* CARTE */}
      {/* ========================= */}

      <section className="panel map-panel">

        <div className="panel-title-row">

          <h2>
            <MapPin size={17} />
            Position des bracelets
          </h2>

          <button
            className="history-button"
            onClick={() => navigate('/historique')}
          >

            <History size={16} />

            Historique

          </button>

        </div>


        <div
          className="personnel-map"
          onClick={() => navigate('/carte')}
          style={{ cursor: 'pointer' }}
        >

          <MapContainer
            center={[3.8483, 11.5030]}
            zoom={16}
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

            {babies.length > 0 && (

              <Marker
                position={[3.8483, 11.5030]}
              />

            )}

          </MapContainer>

        </div>

        <p className="map-help">
          Cliquez sur la carte pour accéder à la vue détaillée.
        </p>

      </section>

    </div>
  )
}

export default DashboardPersonnel