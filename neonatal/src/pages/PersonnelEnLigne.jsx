import { useEffect, useState } from 'react'
import { Users, Circle } from 'lucide-react'
import './PersonnelEnLigne.css'

function PersonnelEnLigne() {

  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)

  // =========================
  // RÉCUPÉRER LE PERSONNEL
  // =========================

  const loadStaff = () => {

    fetch('http://127.0.0.1:5000/api/personnel')
      .then((response) => response.json())
      .then((data) => {

        if (Array.isArray(data)) {
          setStaff(data)
        } else {
          setStaff([])
        }

      })
      .catch((error) => {

        console.error(
          'Erreur récupération du personnel :',
          error
        )

        setStaff([])

      })
      .finally(() => {
        setLoading(false)
      })
  }

  // =========================
  // CHARGEMENT AUTOMATIQUE
  // =========================

  useEffect(() => {

    loadStaff()

    const interval = setInterval(() => {
      loadStaff()
    }, 10000)

    return () => {
      clearInterval(interval)
    }

  }, [])

  return (

    <div className="staff-page">

      {/* ========================= */}
      {/* EN-TÊTE */}
      {/* ========================= */}

      <header className="staff-header">

        <div>

          <h1>
            <Users size={24} />
            Personnel en ligne
          </h1>

          <p>
            {loading
              ? 'Chargement...'
              : `${staff.length} personne${staff.length > 1 ? 's' : ''} actuellement enregistrée${staff.length > 1 ? 's' : ''}`
            }
          </p>

        </div>

      </header>


      {/* ========================= */}
      {/* LISTE DU PERSONNEL */}
      {/* ========================= */}

      <div className="staff-list">

        {loading ? (

          <p>
            Chargement du personnel...
          </p>

        ) : staff.length === 0 ? (

          <p>
            Aucun personnel enregistré.
          </p>

        ) : (

          staff.map((person) => (

            <div
              className="staff-card"
              key={person.id}
            >

              {/* AVATAR */}

              <div className="staff-avatar">

                {`${person.prenom || ''} ${person.nom || ''}`
                  .trim()
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()
                }

              </div>


              {/* INFORMATIONS */}

              <div className="staff-info">

                <strong>
                  {person.prenom} {person.nom}
                </strong>

                <span>
                  {person.email || person.telephone || 'Personnel'}
                </span>

              </div>


              {/* STATUT */}

              <div className="staff-status">

                <Circle
                  size={10}
                  fill="#0d9488"
                  color="#0d9488"
                />

                En ligne

              </div>

            </div>

          ))

        )}

      </div>

    </div>

  )
}

export default PersonnelEnLigne