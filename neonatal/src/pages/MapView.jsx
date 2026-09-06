import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
} from 'react-leaflet'

import {
  useNavigate,
  useLocation,
} from 'react-router-dom'

import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

import './MapView.css'

// ==========================================================
// CORRECTION DES ICÔNES LEAFLET + VITE
// ==========================================================

const defaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

L.Marker.prototype.options.icon = defaultIcon

const alertIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [30, 48],
  iconAnchor: [15, 48],
  className: 'marker-alert',
})

// ==========================================================
// COMPOSANT CARTE
// ==========================================================

function MapView() {
  const navigate = useNavigate()
  const location = useLocation()

  // ========================================================
  // DÉTERMINER LE DASHBOARD D'ORIGINE
  // ========================================================

  const getDashboardPath = () => {

    // ------------------------------------------------------
    // 1. PRIORITÉ AU PARAMÈTRE DANS L'URL
    // ------------------------------------------------------

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

    // ------------------------------------------------------
    // 2. COMPATIBILITÉ AVEC L'ANCIEN SYSTÈME
    // ------------------------------------------------------

    if (location.state?.fromDashboard) {
      return location.state.fromDashboard
    }

    // ------------------------------------------------------
    // 3. DERNIER RECOURS : RÔLE DU COMPTE
    // ------------------------------------------------------

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

  // ========================================================
  // RETOUR AU DASHBOARD
  // ========================================================

  const handleRetourDashboard = () => {
    const dashboardPath = getDashboardPath()

    navigate(dashboardPath)
  }

  // ========================================================
  // CENTRE DE L'HÔPITAL
  // ========================================================

  const hospitalCenter = [
    3.8480,
    11.5021,
  ]

  const safeZoneRadius = 300

  // ========================================================
  // DONNÉES GPS DE TEST
  // ========================================================

  const babies = [
    {
      id: 1,
      name: 'Bébé A - BR-001',
      position: [
        3.8483,
        11.5030,
      ],
      status: 'alert',
    },

    {
      id: 2,
      name: 'Bébé B - BR-002',
      position: [
        3.8478,
        11.5018,
      ],
      status: 'safe',
    },

    {
      id: 3,
      name: 'Bébé C - BR-003',
      position: [
        3.8481,
        11.5024,
      ],
      status: 'safe',
    },
  ]

  // ========================================================
  // AFFICHAGE
  // ========================================================

  return (
    <div className="map-view">

      {/* ================================================== */}
      {/* EN-TÊTE */}
      {/* ================================================== */}

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


      {/* ================================================== */}
      {/* CARTE */}
      {/* ================================================== */}

      <div className="map-wrapper">

        <MapContainer
          center={hospitalCenter}
          zoom={17}
          style={{
            height: '100%',
            width: '100%',
          }}
        >

          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* ============================================== */}
          {/* ZONE AUTORISÉE */}
          {/* ============================================== */}

          <Circle
            center={hospitalCenter}
            radius={safeZoneRadius}
            pathOptions={{
              color: '#2b6cb0',
              fillColor: '#2b6cb0',
              fillOpacity: 0.08,
            }}
          />

          {/* ============================================== */}
          {/* MARQUEURS DES BÉBÉS */}
          {/* ============================================== */}

          {babies.map((baby) => (
            <Marker
              key={baby.id}
              position={baby.position}
              icon={
                baby.status === 'alert'
                  ? alertIcon
                  : defaultIcon
              }
            >

              <Popup>

                <strong>
                  {baby.name}
                </strong>

                <br />

                {baby.status === 'alert'
                  ? 'Hors zone !'
                  : 'Dans la zone autorisée'
                }

              </Popup>

            </Marker>
          ))}

        </MapContainer>

      </div>


      {/* ================================================== */}
      {/* LÉGENDE */}
      {/* ================================================== */}

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

