import { useEffect, useState } from 'react'
import {
  Baby,
  Radio,
  AlertTriangle,
  Users,
  MapPin,
  History,
  UserPlus,
} from 'lucide-react'

import { useNavigate } from 'react-router-dom'

import './Dashboard.css'
import { API_URL } from '../api'

function Dashboard() {
  const navigate = useNavigate()

  const [statsData, setStatsData] = useState({
    babies: 0,
    bracelets: 0,
    personnel: 0,
    alerts: 0,
  })

  const [recentAlerts, setRecentAlerts] = useState([])

  const [loading, setLoading] = useState(true)
  const [loadingAlerts, setLoadingAlerts] = useState(true)

  // ================================
  // CHARGEMENT DES STATISTIQUES
  // ================================
  const loadStats = () => {
    fetch(`${API_URL}/api/dashboard/stats`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `Erreur HTTP ${response.status}`
          )
        }

        return response.json()
      })
      .then((data) => {
        setStatsData({
          babies: data.babies || 0,
          bracelets: data.bracelets || 0,
          personnel: data.personnel || 0,
          alerts: data.alerts || 0,
        })
      })
      .catch((error) => {
        console.error(
          'Erreur récupération des statistiques :',
          error
        )
      })
      .finally(() => {
        setLoading(false)
      })
  }

  // ================================
  // CHARGEMENT DES ALERTES
  // ================================
  const loadAlerts = () => {
    fetch(`${API_URL}/api/dashboard/alerts`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `Erreur HTTP ${response.status}`
          )
        }

        return response.json()
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setRecentAlerts(data)
        } else if (Array.isArray(data.alerts)) {
          setRecentAlerts(data.alerts)
        } else {
          setRecentAlerts([])
        }
      })
      .catch((error) => {
        console.error(
          'Erreur récupération des alertes :',
          error
        )

        setRecentAlerts([])
      })
      .finally(() => {
        setLoadingAlerts(false)
      })
  }

  // ================================
  // CHARGEMENT INITIAL + ACTUALISATION
  // ================================
  useEffect(() => {
    loadStats()
    loadAlerts()

    const interval = setInterval(() => {
      loadStats()
      loadAlerts()
    }, 10000)

    return () => {
      clearInterval(interval)
    }
  }, [])

  // ================================
  // AFFICHAGE DU TYPE D'ALERTE
  // ================================
  const getAlertTitle = (alert) => {
    if (alert.type === 'tamper') {
      return 'ALERTE ENFANT EN DANGER'
    }

    return alert.baby || 'Bébé inconnu'
  }

  const getAlertMessage = (alert) => {
    if (alert.message) {
      return alert.message
    }

    if (alert.type === 'tamper') {
      return 'Bracelet coupé ou retiré.'
    }

    return alert.type || 'Alerte de sécurité'
  }

  return (
    <div className="dashboard">

      {/* ================================
          EN-TÊTE
      ================================= */}
      <header className="dashboard-header">
        <div>
          <h1>Tableau de bord</h1>

          <p>
            Surveillance et sécurité des nouveau-nés
          </p>
        </div>

        <div className="header-actions">
          <div className="user-badge">
            Administrateur
          </div>

          <button
            className="primary-button"
            onClick={() =>
              navigate('/nouvel-utilisateur')
            }
          >
            <UserPlus size={16} />

            Nouvel utilisateur
          </button>
        </div>
      </header>

      {/* ================================
          STATISTIQUES
      ================================= */}
      <section className="stats-grid">

        {/* BÉBÉS */}
        <div
          className="stat-card"
          onClick={() => navigate('/gestion')}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-icon icon-blue">
            <Baby size={20} />
          </div>

          <div>
            <div className="stat-value">
              {loading
                ? '...'
                : statsData.babies}
            </div>

            <div className="stat-label">
              Bébés surveillés
            </div>
          </div>
        </div>

        {/* BRACELETS */}
        <div
          className="stat-card"
          onClick={() => navigate('/gestion')}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-icon icon-teal">
            <Radio size={20} />
          </div>

          <div>
            <div className="stat-value">
              {loading
                ? '...'
                : statsData.bracelets}
            </div>

            <div className="stat-label">
              Bracelets connectés
            </div>
          </div>
        </div>

        {/* ALERTES */}
        <div
          className="stat-card"
          onClick={() => {
            document
              .querySelector('.dashboard-content')
              ?.scrollIntoView({
                behavior: 'smooth',
              })
          }}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-icon icon-red">
            <AlertTriangle size={20} />
          </div>

          <div>
            <div className="stat-value">
              {loading
                ? '...'
                : statsData.alerts}
            </div>

            <div className="stat-label">
              Alertes actives
            </div>
          </div>
        </div>

        {/* PERSONNEL */}
        <div
          className="stat-card"
          onClick={() => navigate('/personnel')}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-icon icon-purple">
            <Users size={20} />
          </div>

          <div>
            <div className="stat-value">
              {loading
                ? '...'
                : statsData.personnel}
            </div>

            <div className="stat-label">
              Personnel
            </div>
          </div>
        </div>

      </section>

      {/* ================================
          CONTENU PRINCIPAL
      ================================= */}
      <section className="dashboard-content">

        {/* ================================
            ALERTES RÉCENTES
        ================================= */}
        <div className="panel">

          <h2>
            <AlertTriangle size={17} />

            Alertes récentes
          </h2>

          {loadingAlerts ? (

            <p className="empty-message">
              Chargement des alertes...
            </p>

          ) : recentAlerts.length === 0 ? (

            <p className="empty-message">
              Aucune alerte récente.
            </p>

          ) : (

            <ul className="alert-list">

              {recentAlerts.map((alert) => (

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
                      {getAlertTitle(alert)}
                    </strong>

                    <span>
                      {getAlertMessage(alert)}
                    </span>

                    {alert.bracelet && (
                      <small>
                        Bracelet : {alert.bracelet}
                      </small>
                    )}

                  </div>

                  <span className="alert-time">
                    {alert.created_at}
                  </span>

                </li>

              ))}

            </ul>

          )}

        </div>

        {/* ================================
            LOCALISATION
        ================================= */}
        <div className="panel">

          <h2>
            <MapPin size={17} />

            Localisation
          </h2>

          <div
            className="map-preview"
            onClick={() =>
              navigate('/carte', {
                state: {
                  fromDashboard:
                    '/dashboard/admin',
                },
              })
            }
            style={{ cursor: 'pointer' }}
          >

            <div className="map-overlay">

              <MapPin size={28} />

              <strong>
                Voir la carte de localisation
              </strong>

              <span>
                Cliquez pour accéder à la carte détaillée
              </span>

            </div>

          </div>

        </div>

      </section>

      {/* ================================
          HISTORIQUE DES BRACELETS
      ================================= */}
      <section className="panel history-panel">

        <div className="panel-title-row">

          <div>

            <h2>
              <History size={17} />

              Historique des bracelets
            </h2>

            <p className="panel-description">
              Consultez les anciens bracelets et leurs
              affectations.
            </p>

          </div>

          <button
            className="history-button"
            onClick={() =>
              navigate('/historique')
            }
          >
            <History size={16} />

            Voir l'historique
          </button>

        </div>

      </section>

    </div>
  )
}

export default Dashboard