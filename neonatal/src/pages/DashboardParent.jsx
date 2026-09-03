import { Baby, MapPin, ShieldCheck, AlertTriangle } from 'lucide-react'
import './DashboardParent.css'

function DashboardParent() {
  const baby = {
    name: 'Bébé A',
    bracelet: 'BR-001',
    status: 'alert', // 'safe' ou 'alert'
    lastUpdate: 'Il y a 2 min',
  }

  const alerts = [
    { id: 1, type: 'Zone dépassée', time: 'Il y a 4 min', level: 'high' },
  ]

  return (
    <div className="dashboard-parent">
      <header className="dp-header">
        <div>
          <h1>Mon suivi</h1>
          <p>{baby.name} — {baby.bracelet}</p>
        </div>
        <div className="user-badge">Maman</div>
      </header>

      <section className={`status-card ${baby.status}`}>
        <div className="status-icon">
          {baby.status === 'safe' ? <ShieldCheck size={28} /> : <AlertTriangle size={28} />}
        </div>
        <div>
          <div className="status-title">
            {baby.status === 'safe' ? 'Votre bébé est en sécurité' : 'Alerte en cours'}
          </div>
          <div className="status-time">Dernière mise à jour : {baby.lastUpdate}</div>
        </div>
      </section>

      <section className="dp-content">
        <div className="panel">
          <h2><MapPin size={16} /> Position actuelle</h2>
          <div className="map-placeholder">
            <MapPin size={28} strokeWidth={1.6} />
            <span>Carte GPS — à intégrer</span>
          </div>
        </div>

        <div className="panel">
          <h2><Baby size={16} /> Fiche bébé</h2>
          <ul className="info-list">
            <li><span>Nom</span><strong>{baby.name}</strong></li>
            <li><span>Bracelet</span><strong>{baby.bracelet}</strong></li>
            <li><span>Statut</span><strong>{baby.status === 'safe' ? 'Sécurisé' : 'Alerte'}</strong></li>
          </ul>
        </div>
      </section>

      <section className="panel">
        <h2>Mes alertes</h2>
        {alerts.length === 0 ? (
          <p className="no-alert">Aucune alerte pour le moment.</p>
        ) : (
          <ul className="alert-list">
            {alerts.map((a) => (
              <li key={a.id} className={`alert-item ${a.level}`}>
                <div className="alert-icon"><AlertTriangle size={16} /></div>
                <div className="alert-body">
                  <strong>{a.type}</strong>
                </div>
                <span className="alert-time">{a.time}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

export default DashboardParent