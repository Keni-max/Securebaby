import { useEffect, useState } from 'react'
import {
  Baby,
  MapPin,
  ShieldCheck,
  AlertTriangle,
  Radio,
  Clock,
} from 'lucide-react'
import './DashboardParent.css'

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

// ========================================
// ICÔNE LEAFLET
// ========================================

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
  const [situation, setSituation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const userId = localStorage.getItem('user_id')

  // ========================================
  // CHARGEMENT DES INFORMATIONS
  // ========================================

  useEffect(() => {
    if (!userId) {
      console.log('Aucun parent connecté')
      setError('Aucun parent connecté.')
      setLoading(false)
      return
    }

    const loadSituation = async () => {
      try {
        // ------------------------------------
        // 1. Récupérer la situation du parent
        // ------------------------------------

        const situationResponse = await fetch(
          `http://127.0.0.1:5000/api/parent/${userId}/situation`
        )

        const situationData =
          await situationResponse.json()

        console.log(
          'Situation du parent :',
          situationData
        )

        if (situationResponse.ok) {
          setSituation(situationData)
        }

        // ------------------------------------
        // 2. Récupérer les bébés
        // ------------------------------------

        const babiesResponse = await fetch(
          `http://127.0.0.1:5000/api/babies/parent/${userId}`
        )

        const babiesData =
          await babiesResponse.json()

        console.log(
          'Bébés du parent :',
          babiesData
        )

        if (babiesResponse.ok) {
          setBabies(
            Array.isArray(babiesData)
              ? babiesData
              : []
          )
        } else {
          setBabies([])
        }

        setError('')
      } catch (error) {
        console.error(
          'Erreur récupération informations parent :',
          error
        )

        setError(
          'Impossible de récupérer vos informations.'
        )
      } finally {
        setLoading(false)
      }
    }

    // Premier chargement
    loadSituation()

    // Actualisation automatique
    const interval = setInterval(() => {
      loadSituation()
    }, 10000)

    return () => {
      clearInterval(interval)
    }
  }, [userId])

  // ========================================
  // CHARGEMENT
  // ========================================

  if (loading) {
    return (
      <div className="dashboard-parent">
        <div className="panel">
          <p>
            Chargement de vos informations...
          </p>
        </div>
      </div>
    )
  }

  // ========================================
  // ERREUR
  // ========================================

  if (
    error &&
    !situation &&
    babies.length === 0
  ) {
    return (
      <div className="dashboard-parent">
        <header className="dp-header">
          <div>
            <h1>
              Mon suivi
            </h1>

            <p>
              Espace parent
            </p>
          </div>

          <div className="user-badge">
            Parent
          </div>
        </header>

        <section className="panel">
          <h2>
            <AlertTriangle size={18} />
            Informations indisponibles
          </h2>

          <p>
            {error}
          </p>
        </section>
      </div>
    )
  }

  // ========================================
  // CAS 1 :
  // BRACELET RÉSERVÉ MAIS PAS ENCORE DE BÉBÉ
  // ========================================

  if (babies.length === 0) {
    return (
      <div className="dashboard-parent">
        <header className="dp-header">
          <div>
            <h1>
              Mon suivi
            </h1>

            <p>
              Suivi de votre admission
            </p>
          </div>

          <div className="user-badge">
            Parent
          </div>
        </header>

        {/* -------------------------------- */}
        {/* CARTE BRACELET RÉSERVÉ */}
        {/* -------------------------------- */}

        <section className="panel">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '15px',
            }}
          >
            <Radio size={22} />

            <h2 style={{ margin: 0 }}>
              Bracelet réservé
            </h2>
          </div>

          <div
            className="status-card"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              padding: '20px',
              borderRadius: '12px',
            }}
          >
            <div className="status-icon">
              <Clock size={28} />
            </div>

            <div>
              <div className="status-title">
                Votre bracelet est réservé
              </div>

              <div className="status-time">
                {situation?.bracelet
                  ? `Bracelet : ${situation.bracelet}`
                  : 'Bracelet en attente'}
              </div>
            </div>
          </div>

          {/* -------------------------------- */}
          {/* MESSAGE À LA MÈRE */}
          {/* -------------------------------- */}

          <div
            style={{
              marginTop: '20px',
              padding: '18px',
              borderRadius: '10px',
              background: '#f8f9fa',
            }}
          >
            <h3>
              Votre bébé n'est pas encore enregistré
            </h3>

            <p>
              Votre compte parent est bien actif.
              Le bracelet vous est actuellement réservé.
            </p>

            <p>
              Dès que la naissance sera enregistrée
              par le personnel de l'hôpital, votre bébé
              sera automatiquement associé à votre compte.
            </p>
          </div>

          {/* -------------------------------- */}
          {/* INFORMATIONS */}
          {/* -------------------------------- */}

          {situation && (
            <ul className="info-list">
              <li>
                <span>
                  Mère
                </span>

                <strong>
                  {situation.nom_mere || '-'}
                </strong>
              </li>

              <li>
                <span>
                  Bracelet
                </span>

                <strong>
                  {situation.bracelet || '-'}
                </strong>
              </li>

              <li>
                <span>
                  Situation
                </span>

                <strong>
                  Bracelet réservé
                </strong>
              </li>
            </ul>
          )}
        </section>

        {/* -------------------------------- */}
        {/* INFORMATION SUR L'ACTUALISATION */}
        {/* -------------------------------- */}

        <section className="panel">
          <h2>
            <ShieldCheck size={18} />
            Protection
          </h2>

          <p>
            Cette page se met automatiquement à jour.
            Vous n'avez pas besoin de vous reconnecter
            lorsque la naissance sera enregistrée.
          </p>
        </section>

        {/* -------------------------------- */}
        {/* ALERTES */}
        {/* -------------------------------- */}

        <section className="panel">
          <h2>
            Mes alertes
          </h2>

          <p className="no-alert">
            Aucune alerte pour le moment.
          </p>
        </section>
      </div>
    )
  }

  // ========================================
  // CAS 2 :
  // LE BÉBÉ EST ENREGISTRÉ
  // ========================================

  return (
    <div className="dashboard-parent">

      {/* ================================= */}
      {/* EN-TÊTE */}
      {/* ================================= */}

      <header className="dp-header">
        <div>
          <h1>
            Mon suivi
          </h1>

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

      {/* ================================= */}
      {/* CARTES DES BÉBÉS */}
      {/* ================================= */}

      {babies.map((babyData) => {
        const babyName =
          `${babyData.nom || ''} ${babyData.prenom || ''}`.trim()

        return (
          <section
            className="panel"
            key={babyData.id}
            style={{
              marginBottom: '20px',
            }}
          >

            {/* ============================= */}
            {/* IDENTITÉ DU BÉBÉ */}
            {/* ============================= */}

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
                <h2
                  style={{
                    marginBottom: '5px',
                  }}
                >
                  <Baby size={18} />

                  {babyName}
                </h2>

                <p style={{ margin: 0 }}>
                  Bracelet :{' '}
                  <strong>
                    {babyData.bracelet}
                  </strong>
                </p>
              </div>
            </div>

            {/* ============================= */}
            {/* STATUT DU BÉBÉ */}
            {/* ============================= */}

            <section className="status-card safe">
              <div className="status-icon">
                <ShieldCheck size={28} />
              </div>

              <div>
                <div className="status-title">
                  Votre bébé est en sécurité
                </div>

                <div className="status-time">
                  Bracelet actif
                </div>
              </div>
            </section>

            {/* ============================= */}
            {/* CARTE + FICHE */}
            {/* ============================= */}

            <section className="dp-content">

              {/* =========================== */}
              {/* CARTE */}
              {/* =========================== */}

              <div className="panel">
                <h2>
                  <MapPin size={16} />
                  Position actuelle
                </h2>

                <div
                  className="mini-map"
                  onClick={() =>
                    navigate('/carte', {
                      state: {
                        fromDashboard:
                          '/dashboard/parent',
                      },
                    })
                  }
                  style={{
                    cursor: 'pointer',
                  }}
                >
                  <MapContainer
                    center={[
                      3.8483,
                      11.5030,
                    ]}
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

                    <Marker
                      position={[
                        3.8483,
                        11.5030,
                      ]}
                    />
                  </MapContainer>
                </div>
              </div>

              {/* =========================== */}
              {/* FICHE BÉBÉ */}
              {/* =========================== */}

              <div className="panel">
                <h2>
                  <Baby size={16} />
                  Fiche bébé
                </h2>

                <ul className="info-list">

                  <li>
                    <span>
                      Nom
                    </span>

                    <strong>
                      {babyData.nom}
                    </strong>
                  </li>

                  <li>
                    <span>
                      Prénom
                    </span>

                    <strong>
                      {babyData.prenom}
                    </strong>
                  </li>

                  <li>
                    <span>
                      Date de naissance
                    </span>

                    <strong>
                      {babyData.date_naissance}
                    </strong>
                  </li>

                  <li>
                    <span>
                      Heure de naissance
                    </span>

                    <strong>
                      {babyData.heure_naissance}
                    </strong>
                  </li>

                  <li>
                    <span>
                      Sexe
                    </span>

                    <strong>
                      {babyData.sexe === 'F'
                        ? 'Féminin'
                        : 'Masculin'}
                    </strong>
                  </li>

                  <li>
                    <span>
                      Bracelet
                    </span>

                    <strong>
                      {babyData.bracelet}
                    </strong>
                  </li>

                  <li>
                    <span>
                      Statut
                    </span>

                    <strong>
                      Sécurisé
                    </strong>
                  </li>

                </ul>
              </div>

            </section>

          </section>
        )
      })}

      {/* ================================= */}
      {/* ALERTES */}
      {/* ================================= */}

      <section className="panel">
        <h2>
          Mes alertes
        </h2>

        <p className="no-alert">
          Aucune alerte pour le moment.
        </p>
      </section>

    </div>
  )
}

export default DashboardParent