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
import { Baby, Radio, AlertTriangle, Users, MapPin } from 'lucide-react'
import './Dashboard.css'

function Dashboard() {
  const navigate = useNavigate()
  const stats = [
    { label: 'Bébés surveillés', value: 12, icon: Baby, color: 'blue' },
    { label: 'Bracelets connectés', value: 12, icon: Radio, color: 'teal' },
    { label: 'Alertes actives', value: 1, icon: AlertTriangle, color: 'red' },
    { label: 'Personnel en ligne', value: 5, icon: Users, color: 'purple' },
  ]

  const recentAlerts = [
    { id: 1, baby: 'Bébé A - BR-001', type: 'Zone dépassée', time: 'Il y a 4 min', level: 'high' },
    { id: 2, baby: 'Bébé C - BR-003', type: 'Bracelet retiré', time: 'Il y a 1h', level: 'high' },
    { id: 3, baby: 'Bébé F - BR-006', type: 'Batterie faible', time: 'Il y a 3h', level: 'medium' },
  ]

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Tableau de bord</h1>
          <p>Vue d'ensemble en temps réel</p>
        </div>
        <div className="user-badge">Admin</div>
      </header>

      <section className="stats-grid">
        {stats.map((stat) => {
  const Icon = stat.icon
  const clickable = stat.label === 'Personnel en ligne' || stat.label === 'Bébés surveillés' || stat.label === 'Bracelets connectés'
  return (
    <div
      className="stat-card"
      key={stat.label}
      onClick={
  clickable
    ? () => navigate(stat.label === 'Personnel en ligne' ? '/personnel' : '/gestion')
    : undefined
}
      style={clickable ? { cursor: 'pointer' } : undefined}
    >
      <div className={`stat-icon icon-${stat.color}`}>
        <Icon size={20} strokeWidth={2.2} />
      </div>
      <div>
        <div className="stat-value">{stat.value}</div>
        <div className="stat-label">{stat.label}</div>
      </div>
    </div>
  )
})}
      </section>

      <section className="dashboard-content">
        <div className="panel">
          <h2>Alertes récentes</h2>
          <ul className="alert-list">
            {recentAlerts.map((alert) => (
              <li key={alert.id} className={`alert-item ${alert.level}`}>
                <div className="alert-icon">
                  <AlertTriangle size={16} />
                </div>
                <div className="alert-body">
                  <strong>{alert.baby}</strong>
                  <span>{alert.type}</span>
                </div>
                <span className="alert-time">{alert.time}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="panel">
  <h2>Aperçu carte</h2>
  <div className="mini-map" onClick={() => navigate('/carte')} style={{ cursor: 'pointer' }}>
    <MapContainer center={[3.8480, 11.5021]} zoom={16} style={{ height: '100%', width: '100%' }} zoomControl={false} dragging={false} scrollWheelZoom={false}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={[3.8483, 11.5030]} />
      <Marker position={[3.8478, 11.5018]} />
      <Marker position={[3.8481, 11.5024]} />
    </MapContainer>
  </div>
</div>
      </section>
    </div>
  )
}

export default Dashboard