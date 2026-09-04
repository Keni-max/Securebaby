import { Users, Circle } from 'lucide-react'
import './PersonnelEnLigne.css'

function PersonnelEnLigne() {
  const staff = [
    { id: 1, name: 'Dr. Ngono Marie', role: 'Pédiatre', status: 'online' },
    { id: 2, name: 'Infirmière Ateba Sarah', role: 'Infirmière en chef', status: 'online' },
    { id: 3, name: 'Infirmier Mbarga Paul', role: 'Infirmier', status: 'online' },
    { id: 4, name: 'Agent Fouda Jean', role: 'Sécurité', status: 'online' },
    { id: 5, name: 'Réceptionniste Biya Claire', role: 'Accueil', status: 'online' },
  ]

  return (
    <div className="staff-page">
      <header className="staff-header">
        <div>
          <h1><Users size={24} /> Personnel en ligne</h1>
          <p>{staff.length} personnes actuellement connectées</p>
        </div>
      </header>

      <div className="staff-list">
        {staff.map((person) => (
          <div className="staff-card" key={person.id}>
            <div className="staff-avatar">
              {person.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </div>
            <div className="staff-info">
              <strong>{person.name}</strong>
              <span>{person.role}</span>
            </div>
            <div className="staff-status">
              <Circle size={10} fill="#0d9488" color="#0d9488" />
              En ligne
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PersonnelEnLigne