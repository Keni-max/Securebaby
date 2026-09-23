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
import { API_URL } from '../api'

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
  const [alerts, setAlerts] = useState([])

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

        // ====================================
        // 1. SITUATION DU PARENT
        // ====================================

        const situationResponse = await fetch(
          `${API_URL}/api/parent/${userId}/situation`
        )

        if (!situationResponse.ok) {
          throw new Error(
            `Erreur situation : ${situationResponse.status}`
          )
        }

        const situationData =
          await situationResponse.json()

        console.log(
          'Situation du parent :',
          situationData
        )

        setSituation(situationData)


        // ====================================
        // 2. BÉBÉS DU PARENT
        // ====================================

        const babiesResponse = await fetch(
          `${API_URL}/api/babies/parent/${userId}`
        )

        if (!babiesResponse.ok) {
          throw new Error(
            `Erreur bébés : ${babiesResponse.status}`
          )
        }

        const babiesData =
          await babiesResponse.json()

        console.log(
          'Bébés du parent :',
          babiesData
        )

        const parentBabies =
          Array.isArray(babiesData)
            ? babiesData
            : []

        setBabies(parentBabies)


        // ====================================
        // 3. ALERTES DU PARENT
        // ====================================

        const alertsResponse = await fetch(
          `${API_URL}/api/dashboard/alerts`
        )

        if (alertsResponse.ok) {

          const alertsData =
            await alertsResponse.json()

          const allAlerts =
            Array.isArray(alertsData)
              ? alertsData
              : Array.isArray(alertsData.alerts)
                ? alertsData.alerts
                : []


          // ----------------------------------
          // Ne garder que les alertes
          // correspondant aux bracelets
          // des bébés de ce parent
          // ----------------------------------

          const parentBracelets =
            parentBabies
              .map((baby) => baby.bracelet)
              .filter(Boolean)


          const parentAlerts =
            allAlerts.filter((alert) => {

              if (!alert.bracelet) {
                return false
              }

              return parentBracelets.includes(
                alert.bracelet
              )
            })


          console.log(
            'Alertes du parent :',
            parentAlerts
          )

          setAlerts(parentAlerts)

        } else {

          setAlerts([])

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


    // Actualisation toutes les 10 secondes
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
  // BRACELET RÉSERVÉ
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


        {/* ================================ */}
        {/* BRACELET RÉSERVÉ */}
        {/* ================================ */}

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


          {/* ================================ */}
          {/* MESSAGE */}
          {/* ================================ */}

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


          {/* ================================ */}
          {/* INFORMATIONS */}
          {/* ================================ */}

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


        {/* ================================ */}
        {/* PROTECTION */}
        {/* ================================ */}

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


        {/* ================================ */}
        {/* ALERTES */}
        {/* ================================ */}

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
  // BÉBÉ ENREGISTRÉ
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


        const babyAlerts =
          alerts.filter(
            (alert) =>
              alert.bracelet === babyData.bracelet
          )


        const hasAlert =
          babyAlerts.length > 0


        // =================================
        // COORDONNÉES GPS
        // =================================

        const latitude =
          Number(
            babyData.latitude
          )

        const longitude =
          Number(
            babyData.longitude
          )


        const hasGPS =
          Number.isFinite(latitude) &&
          Number.isFinite(longitude) &&
          latitude !== 0 &&
          longitude !== 0


        const mapPosition =
          hasGPS
            ? [latitude, longitude]
            : [3.8483, 11.5030]


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

                  {babyName || 'Bébé'}

                </h2>


                <p style={{ margin: 0 }}>

                  Bracelet :

                  {' '}

                  <strong>
                    {babyData.bracelet || '-'}
                  </strong>

                </p>

              </div>

            </div>


            {/* ============================= */}
            {/* STATUT DU BÉBÉ */}
            {/* ============================= */}

            {hasAlert ? (

              <section
                className="status-card"
                style={{
                  background: '#fff1f1',
                  border: '1px solid #dc2626',
                  color: '#b91c1c',
                }}
              >

                <div className="status-icon">

                  <AlertTriangle size={28} />

                </div>


                <div>

                  <div className="status-title">

                    ALERTE ENFANT EN DANGER

                  </div>


                  <div className="status-time">

                    {babyAlerts[0]?.message ||
                      'Le bracelet a signalé une anomalie.'}

                  </div>

                </div>

              </section>

            ) : (

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

            )}


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
                    navigate('/carte')
                  }
                  style={{
                    cursor: 'pointer',
                  }}
                >

                  <MapContainer
                    center={mapPosition}
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
                      position={mapPosition}
                    />

                  </MapContainer>

                </div>


                {!hasGPS && (

                  <p
                    style={{
                      marginTop: '10px',
                      fontSize: '13px',
                      color: '#777',
                    }}
                  >
                    Position GPS en attente...
                  </p>

                )}

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
                      {babyData.nom || '-'}
                    </strong>

                  </li>


                  <li>

                    <span>
                      Prénom
                    </span>

                    <strong>
                      {babyData.prenom || '-'}
                    </strong>

                  </li>


                  <li>

                    <span>
                      Date de naissance
                    </span>

                    <strong>
                      {babyData.date_naissance || '-'}
                    </strong>

                  </li>


                  <li>

                    <span>
                      Heure de naissance
                    </span>

                    <strong>
                      {babyData.heure_naissance || '-'}
                    </strong>

                  </li>


                  <li>

                    <span>
                      Sexe
                    </span>

                    <strong>

                      {babyData.sexe === 'F'
                        ? 'Féminin'
                        : babyData.sexe === 'M'
                          ? 'Masculin'
                          : '-'}

                    </strong>

                  </li>


                  <li>

                    <span>
                      Bracelet
                    </span>

                    <strong>
                      {babyData.bracelet || '-'}
                    </strong>

                  </li>


                  <li>

                    <span>
                      Statut
                    </span>

                    <strong
                      style={{
                        color: hasAlert
                          ? '#dc2626'
                          : '#16a34a',
                      }}
                    >

                      {hasAlert
                        ? 'ALERTE'
                        : 'Sécurisé'}

                    </strong>

                  </li>

                </ul>

              </div>

            </section>


            {/* ============================= */}
            {/* ALERTES DU BÉBÉ */}
            {/* ============================= */}

            {hasAlert && (

              <section
                className="panel"
                style={{
                  marginTop: '20px',
                  border: '1px solid #dc2626',
                }}
              >

                <h2
                  style={{
                    color: '#b91c1c',
                  }}
                >

                  <AlertTriangle size={17} />

                  Alerte de sécurité

                </h2>


                <div>

                  {babyAlerts.map((alert) => (

                    <div
                      key={alert.id}
                      style={{
                        padding: '12px',
                        marginBottom: '8px',
                        borderRadius: '8px',
                        background: '#fff1f1',
                      }}
                    >

                      <strong
                        style={{
                          display: 'block',
                          color: '#b91c1c',
                        }}
                      >

                        ALERTE ENFANT EN DANGER

                      </strong>


                      <span>
                        {alert.message ||
                          'Anomalie détectée sur le bracelet.'}
                      </span>


                      {alert.created_at && (

                        <small
                          style={{
                            display: 'block',
                            marginTop: '5px',
                            color: '#777',
                          }}
                        >

                          {alert.created_at}

                        </small>

                      )}

                    </div>

                  ))}

                </div>

              </section>

            )}

          </section>

        )

      })}


      {/* ================================= */}
      {/* AUCUNE ALERTE */}
      {/* ================================= */}

      {alerts.length === 0 && (

        <section className="panel">

          <h2>
            <ShieldCheck size={17} />

            Mes alertes
          </h2>

          <p className="no-alert">
            Aucune alerte pour le moment.
          </p>

        </section>

      )}

    </div>
  )
}


export default DashboardParent