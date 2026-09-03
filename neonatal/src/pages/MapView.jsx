import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'
import './MapView.css'

// Fix des icônes par défaut (bug connu Leaflet + Vite)
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

function MapView() {
  // Coordonnées de test autour de Yaoundé
  const hospitalCenter = [3.8480, 11.5021]
  const safeZoneRadius = 300 // en mètres

  const babies = [
    { id: 1, name: 'Bébé A - BR-001', position: [3.8483, 11.5030], status: 'alert' },
    { id: 2, name: 'Bébé B - BR-002', position: [3.8478, 11.5018], status: 'safe' },
    { id: 3, name: 'Bébé C - BR-003', position: [3.8481, 11.5024], status: 'safe' },
  ]

  return (
    <div className="map-view">
      <header className="map-header">
        <div>
          <h1>Carte GPS</h1>
          <p>Suivi en temps réel des bébés</p>
        </div>
      </header>

      <div className="map-wrapper">
        <MapContainer
          center={hospitalCenter}
          zoom={17}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <Circle
            center={hospitalCenter}
            radius={safeZoneRadius}
            pathOptions={{ color: '#2b6cb0', fillColor: '#2b6cb0', fillOpacity: 0.08 }}
          />

          {babies.map((baby) => (
            <Marker
              key={baby.id}
              position={baby.position}
              icon={baby.status === 'alert' ? alertIcon : defaultIcon}
            >
              <Popup>
                <strong>{baby.name}</strong>
                <br />
                {baby.status === 'alert' ? 'Hors zone !' : 'Dans la zone autorisée'}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div className="map-legend">
        <div className="legend-item">
          <span className="dot safe"></span> Bébé en sécurité
        </div>
        <div className="legend-item">
          <span className="dot alert"></span> Bébé en alerte
        </div>
        <div className="legend-item">
          <span className="dot zone"></span> Zone autorisée
        </div>
      </div>
    </div>
  )
}

export default MapView