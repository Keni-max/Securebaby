import { useState } from 'react'
import { Baby, Search, Plus, Radio } from 'lucide-react'
import './GestionBebes.css'

function GestionBebes() {
  const [search, setSearch] = useState('')

  const babies = [
    { id: 1, name: 'Bébé A', bracelet: 'BR-001', mother: 'Maman A', status: 'active' },
    { id: 2, name: 'Bébé B', bracelet: 'BR-002', mother: 'Maman B', status: 'active' },
    { id: 3, name: 'Bébé C', bracelet: 'BR-003', mother: 'Maman C', status: 'alert' },
    { id: 4, name: '—', bracelet: 'BR-004', mother: '—', status: 'available' },
  ]

  const filtered = babies.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.bracelet.toLowerCase().includes(search.toLowerCase())
  )

  const statusLabel = {
    active: 'Actif',
    alert: 'Alerte',
    available: 'Disponible',
  }

  return (
    <div className="gestion-page">
      <header className="gestion-header">
        <div>
          <h1><Baby size={24} /> Gestion des bébés &amp; bracelets</h1>
          <p>{babies.length} bracelets enregistrés</p>
        </div>
        <button className="add-button">
          <Plus size={16} /> Nouveau bébé
        </button>
      </header>

      <div className="search-bar">
        <Search size={16} />
        <input
          type="text"
          placeholder="Rechercher un bébé ou un bracelet..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="gestion-list">
        {filtered.map((b) => (
          <div className="gestion-card" key={b.id}>
            <div className="gestion-icon">
              <Radio size={18} />
            </div>
            <div className="gestion-info">
              <strong>{b.name}</strong>
              <span>{b.bracelet} — {b.mother}</span>
            </div>
            <span className={`status-badge ${b.status}`}>
              {statusLabel[b.status]}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default GestionBebes