import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
} from 'react-leaflet'

import {
  useNavigate,
  useLocation,
} from 'react-router-dom'

import {
  useEffect,
  useState,
} from 'react'

import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

import './MapView.css'
import { API_URL } from '../api'

// ==========================================================
// ICÔNE NORMALE
// ==========================================================

const defaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

// ==========================================================
// ICÔNE ALERTE
// ==========================================================

const alertIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [30, 48],
  iconAnchor: [15, 48],
  className: 'marker-alert',
})

L.Marker.prototype.options.icon = defaultIcon

// ==========================================================
// CONTRÔLE DU CENTRAGE DE LA CARTE
// ==========================================================

function MapController({ position }) {
  const map = useMap()

  useEffect(() => {
    if (
      Array.isArray(position) &&
      position.length === 2 &&
      Number.isFinite(position[0]) &&
      Number.isFinite(position[1])
    ) {
      map.setView(position, 17)
    }
  }, [position, map])

  return null
}

// ==========================================================
// COMPOSANT MAPVIEW
// ==========================================================

function MapView() {
  const navigate = useNavigate()
  const location = useLocation()

  const [baby, setBaby] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // ========================================================
  // ÉTAT DE CONNEXION DU BRACELET
  // ========================================================

  const [braceletConnected, setBraceletConnected] =
    useState(false)

  // ========================================================
  // BRACELET SUIVI
  // ========================================================

  const bracelet = 'BR-073'

  // ========================================================
  // CENTRE DE L'HÔPITAL
  // ========================================================

  const hospitalCenter = [3.8480, 11.5021]

  const safeZoneRadius = 300

  // ========================================================
  // RETOUR AU DASHBOARD
  // ========================================================

  const getDashboardPath = () => {
    const params = new URLSearchParams(location.search)
    const from = params.get('from')

    if (from === 'personnel') {
      return '/dashboard/personnel'
    }

    if (from === 'admin') {
      return '/dashboard/admin'
    }

    if (from === 'parent') {
      return '/dashboard/parent'
    }

    if (location.state?.fromDashboard) {
      return location.state.fromDashboard
    }

    const role = localStorage.getItem('role')

    if (
      role === 'admin' ||
      role === 'administrateur'
    ) {
      return '/dashboard/admin'
    }

    if (role === 'personnel') {
      return '/dashboard/personnel'
    }

    if (role === 'parent') {
      return '/dashboard/parent'
    }

    return '/'
  }

  const handleRetourDashboard = () => {
    navigate(getDashboardPath())
  }

  // ========================================================
  // RÉCUPÉRATION GPS + ÉTAT DU BRACELET
  // ========================================================

  const fetchBabyPosition = async () => {
    try {
      const response = await fetch(
  `${API_URL}/api/bracelet/${bracelet}/telemetry`
      )

      const data = await response.json()

      console.log(
        '📡 RÉPONSE API GPS :',
        data
      )

      if (!response.ok) {
        throw new Error(
          data.message ||
          'Erreur du serveur GPS.'
        )
      }

      // ====================================================
      // RÉCUPÉRATION DES TÉLÉMÉTRIES
      // ====================================================

      let telemetry = null

      if (
        data &&
        Array.isArray(data.value)
      ) {
        telemetry = data.value
      }

      else if (
        data &&
        Array.isArray(data)
      ) {
        telemetry = data
      }

      else if (
        data &&
        data.value &&
        Array.isArray(data.value.value)
      ) {
        telemetry = data.value.value
      }

      // ====================================================
      // AUCUNE DONNÉE
      // ====================================================

      if (
        !telemetry ||
        telemetry.length === 0
      ) {
        console.error(
          '❌ Aucune télémétrie trouvée :',
          data
        )

        setBraceletConnected(false)

        setBaby(null)

        setError(
          'Aucune donnée GPS disponible pour ce bracelet.'
        )

        return
      }

      // ====================================================
      // DERNIÈRE DONNÉE
      // ====================================================

      const latest = telemetry[0]

      console.log(
        '📍 DERNIÈRE DONNÉE :',
        latest
      )

      // ====================================================
      // CONNEXION DU BRACELET
      // ====================================================

      const receivedAt =
        latest.received_at ||
        latest.last_seen ||
        null

      let connected = false

      if (receivedAt) {
        const receivedTime = new Date(
          receivedAt.replace(' ', 'T')
        ).getTime()

        const now = Date.now()

        const difference =
          now - receivedTime

        // Le bracelet est considéré
        // connecté si une donnée a été reçue
        // depuis moins de 10 secondes.

        connected =
          Number.isFinite(receivedTime) &&
          difference >= 0 &&
          difference <= 10000

        console.log(
          '🕐 Dernière communication :',
          receivedAt
        )

        console.log(
          '⏱️ Temps depuis réception :',
          difference,
          'ms'
        )

        console.log(
          connected
            ? '🟢 BRACELET CONNECTÉ'
            : '🔴 BRACELET DÉCONNECTÉ'
        )
      }

      setBraceletConnected(
        connected
      )

      // ====================================================
      // COORDONNÉES GPS
      // ====================================================

      const latitude = Number(
        latest.latitude
      )

      const longitude = Number(
        latest.longitude
      )

      if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude)
      ) {
        setBaby(null)

        setError(
          'Les coordonnées GPS reçues sont invalides.'
        )

        return
      }

      // ====================================================
      // GPS 0,0
      // ====================================================

      if (
        latitude === 0 &&
        longitude === 0
      ) {
        setBaby(null)

        setError(
          'Position GPS non disponible.'
        )

        return
      }

      // ====================================================
      // LIMITES GPS
      // ====================================================

      if (
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
      ) {
        setBaby(null)

        setError(
          'Les coordonnées GPS sont hors limites.'
        )

        return
      }

      // ====================================================
      // DÉTECTION DE L'ALERTE
      // ====================================================

      const tamperAlert =
        latest.tamper_alert === 1 ||
        latest.tamper_alert === true ||
        latest.tamperAlert === 1 ||
        latest.tamperAlert === true ||
        String(
          latest.tamper_alert
        ).toLowerCase() === 'true'

      console.log(
        '🚨 TAMPER ALERT :',
        tamperAlert
      )

      // ====================================================
      // DONNÉES DU BÉBÉ
      // ====================================================

      const babyData = {
        id:
          latest.baby_id ||
          bracelet,

        name:
          latest.baby_name ||
          'Bébé',

        bracelet:
          latest.baby_id ||
          bracelet,

        latitude,

        longitude,

        position: [
          latitude,
          longitude,
        ],

        status:
          tamperAlert
            ? 'alert'
            : 'safe',

        tamperAlert,

        lastSeen:
          receivedAt,
      }

      console.log(
        '👶 DONNÉES DU BÉBÉ :',
        babyData
      )

      // ====================================================
      // ENREGISTREMENT
      // ====================================================

      setBaby(babyData)

      setError('')

    } catch (err) {
      console.error(
        '❌ ERREUR GPS :',
        err
      )

      setBraceletConnected(false)

      setBaby(null)

      setError(
        err.message ||
        'Impossible de récupérer la position du bébé.'
      )

    } finally {
      setLoading(false)
    }
  }

  // ========================================================
  // ACTUALISATION TOUTES LES 3 SECONDES
  // ========================================================

  useEffect(() => {
    fetchBabyPosition()

    const interval = setInterval(() => {
      fetchBabyPosition()
    }, 3000)

    return () => {
      clearInterval(interval)
    }
  }, [])

  // ========================================================
  // POSITION DE LA CARTE
  // ========================================================

  const mapCenter =
    baby &&
    Array.isArray(baby.position) &&
    baby.position.length === 2 &&
    Number.isFinite(baby.position[0]) &&
    Number.isFinite(baby.position[1])
      ? baby.position
      : hospitalCenter

  // ========================================================
  // AFFICHAGE
  // ========================================================

  return (
    <div className="map-view">

      {/* ==================================================
          HEADER
      ================================================== */}

      <header className="map-header">

        <div>
          <h1>
            Carte GPS
          </h1>

          <p>
            Suivi en temps réel des bébés
          </p>
        </div>

        <button
          className="back-button"
          onClick={handleRetourDashboard}
        >
          ← Retour au dashboard
        </button>

      </header>

      {/* ==================================================
          BANDEAU D'ÉTAT
      ================================================== */}

      <div
        style={{
          padding: '14px 20px',
          borderBottom:
            '1px solid #e5e7eb',

          /*
           * PRIORITÉ :
           * 1. Tentative de retrait
           * 2. Déconnexion
           * 3. Sécurité
           */

          background:
            baby?.tamperAlert
              ? '#fee2e2'
              : !braceletConnected
                ? '#fef2f2'
                : '#f0fdf4',

          borderLeft:
            baby?.tamperAlert
              ? '6px solid #dc2626'
              : !braceletConnected
                ? '6px solid #dc2626'
                : '6px solid #16a34a',
        }}
      >

        {loading && (
          <span>
            📡 Recherche de la position du bracelet...
          </span>
        )}

        {!loading && baby && (
          <div>

            {/* ==================================================
                ÉTAT PRINCIPAL DU BRACELET
            ================================================== */}

            {baby.tamperAlert ? (

              <div
                style={{
                  color: '#b91c1c',
                  fontWeight: '700',
                  fontSize: '16px',
                }}
              >
                🚨 TENTATIVE DE RETRAIT DU BRACELET{' '}
                {baby.bracelet}
              </div>

            ) : !braceletConnected ? (

              <div
                style={{
                  color: '#b91c1c',
                  fontWeight: '700',
                  fontSize: '16px',
                }}
              >
                🔴 BRACELET DÉCONNECTÉ
              </div>

            ) : (

              <div
                style={{
                  color: '#15803d',
                  fontWeight: '700',
                  fontSize: '16px',
                }}
              >
                🟢 BÉBÉ SÉCURISÉ
              </div>

            )}

            {/* ==================================================
                NOM DU BÉBÉ
            ================================================== */}

            <div
              style={{
                marginTop: '7px',
                color: '#374151',
              }}
            >
              👶 {baby.name}
            </div>

            {/* ==================================================
                CONNEXION
            ================================================== */}

            {/*
             * IMPORTANT :
             * On n'affiche PLUS "Bracelet déconnecté"
             * ici lorsque le tamper est actif.
             *
             * L'alerte de retrait est prioritaire.
             */}

            {!baby.tamperAlert && (
              <div
                style={{
                  marginTop: '5px',
                  fontWeight: '600',
                  color:
                    braceletConnected
                      ? '#16a34a'
                      : '#dc2626',
                }}
              >
                {braceletConnected
                  ? '🟢 Bracelet connecté'
                  : '🔴 Bracelet déconnecté'}
              </div>
            )}

          </div>
        )}

        {!loading && error && (
          <span
            style={{
              color: '#dc2626',
              fontWeight: '500',
            }}
          >
            ⚠️ {error}
          </span>
        )}

      </div>

      {/* ==================================================
          CARTE
      ================================================== */}

      <div className="map-wrapper">

        {/* ==================================================
            ALERTE FLOTTANTE
        ================================================== */}

        {baby?.tamperAlert && (

          <div
            style={{
              position: 'absolute',
              top: '15px',
              left: '50%',
              transform:
                'translateX(-50%)',
              zIndex: 1000,

              background: '#dc2626',
              color: 'white',

              padding: '12px 20px',

              borderRadius: '10px',

              fontWeight: '700',

              boxShadow:
                '0 4px 12px rgba(0,0,0,0.25)',

              textAlign: 'center',

              minWidth: '280px',
            }}
          >
            🚨 ALERTE BRACELET

            <br />

            <span
              style={{
                fontSize: '14px',
              }}
            >
              Tentative de retrait du bracelet{' '}
              {baby.bracelet}
            </span>

          </div>

        )}

        {/* ==================================================
            ALERTE DÉCONNEXION
            S'AFFICHE SEULEMENT S'IL N'Y A PAS
            DE TENTATIVE DE RETRAIT
        ================================================== */}

        {baby &&
          !braceletConnected &&
          !baby.tamperAlert && (

          <div
            style={{
              position: 'absolute',
              top: '15px',
              left: '50%',
              transform:
                'translateX(-50%)',
              zIndex: 1000,

              background: '#dc2626',
              color: 'white',

              padding: '12px 20px',

              borderRadius: '10px',

              fontWeight: '700',

              boxShadow:
                '0 4px 12px rgba(0,0,0,0.25)',

              textAlign: 'center',

              minWidth: '280px',
            }}
          >
            🔴 BRACELET DÉCONNECTÉ

            <br />

            <span
              style={{
                fontSize: '14px',
              }}
            >
              Aucune communication récente
            </span>

          </div>

        )}

        <MapContainer
          center={mapCenter}
          zoom={17}
          style={{
            height: '100%',
            width: '100%',
          }}
        >

          <MapController
            position={mapCenter}
          />

          {/* =================================================
              OPEN STREET MAP
          ================================================= */}

          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* =================================================
              ZONE DE SÉCURITÉ
          ================================================= */}

          <Circle
            center={hospitalCenter}
            radius={safeZoneRadius}
            pathOptions={{
              color: '#2b6cb0',
              fillColor: '#2b6cb0',
              fillOpacity: 0.08,
            }}
          />

          {/* =================================================
              MARQUEUR DU BÉBÉ
          ================================================= */}

          {baby &&
            Array.isArray(baby.position) &&
            baby.position.length === 2 &&
            Number.isFinite(
              baby.position[0]
            ) &&
            Number.isFinite(
              baby.position[1]
            ) && (

              <Marker
                position={baby.position}
                icon={
                  baby.tamperAlert
                    ? alertIcon
                    : defaultIcon
                }
              >

                <Popup>

                  <div
                    style={{
                      minWidth: '230px',
                    }}
                  >

                    <strong>
                      👶 {baby.name}
                    </strong>

                    <br />

                    <strong>
                      Bracelet : {baby.bracelet}
                    </strong>

                    <br />
                    <br />

                    {/* =================================================
                        ÉTAT PRINCIPAL
                    ================================================= */}

                    {baby.tamperAlert ? (

                      <div
                        style={{
                          color: '#dc2626',
                          fontWeight: 'bold',
                        }}
                      >
                        🚨 Tentative de retrait
                        du bracelet{' '}
                        {baby.bracelet}
                      </div>

                    ) : !braceletConnected ? (

                      <div
                        style={{
                          color: '#dc2626',
                          fontWeight: 'bold',
                        }}
                      >
                        🔴 Bracelet déconnecté
                      </div>

                    ) : (

                      <div
                        style={{
                          color: '#16a34a',
                          fontWeight: 'bold',
                        }}
                      >
                        🟢 Bébé sécurisé
                      </div>

                    )}

                    <br />

                    {/* =================================================
                        CONNEXION
                    ================================================= */}

                    {/*
                     * Si le tamper est actif, on ne répète
                     * pas "bracelet déconnecté".
                     */}

                    {!baby.tamperAlert && (
                      <div
                        style={{
                          fontWeight: 'bold',
                          color:
                            braceletConnected
                              ? '#16a34a'
                              : '#dc2626',
                        }}
                      >
                        {braceletConnected
                          ? '🟢 Bracelet connecté'
                          : '🔴 Bracelet déconnecté'}
                      </div>
                    )}

                    <br />

                    📍 Latitude :
                    {' '}
                    {baby.latitude}

                    <br />

                    📍 Longitude :
                    {' '}
                    {baby.longitude}

                    <br />
                    <br />

                    🕐 Dernière communication :

                    <br />

                    {baby.lastSeen ||
                      'Non disponible'}

                  </div>

                </Popup>

              </Marker>

            )}

        </MapContainer>

      </div>

      {/* ==================================================
          LÉGENDE
      ================================================== */}

      <div className="map-legend">

        <div className="legend-item">
          <span className="dot safe"></span>
          Bébé en sécurité
        </div>

        <div className="legend-item">
          <span className="dot alert"></span>
          Bébé en alerte
        </div>

        <div className="legend-item">
          <span className="dot zone"></span>
          Zone autorisée
        </div>

      </div>

    </div>
  )
}

export default MapView