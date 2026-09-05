import { useEffect, useState } from 'react'
import { History, Search, Radio, Calendar } from 'lucide-react'
import './Historique.css'

function Historique() {
  const [search, setSearch] = useState('')
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)

  // Récupérer l'historique depuis le backend
  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/history')
      .then((response) => response.json())
      .then((data) => {
        console.log('Historique récupéré :', data)
        setRecords(data)
        setLoading(false)
      })
      .catch((error) => {
        console.error(
          "Erreur récupération de l'historique :",
          error
        )
        setLoading(false)
      })
  }, [])

  // Recherche
  const filtered = records.filter((record) => {
    const bracelet = (record.bracelet || '').toLowerCase()
    const baby = (record.baby || '').toLowerCase()
    const mother = (record.mother || '').toLowerCase()

    const searchText = search.toLowerCase()

    return (
      bracelet.includes(searchText) ||
      baby.includes(searchText) ||
      mother.includes(searchText)
    )
  })

  return (
    <div className="historique-page">

      {/* =========================
          EN-TÊTE
      ========================= */}
      <header className="historique-header">

        <div>
          <h1>
            <History size={24} />
            Historique des attributions
          </h1>

          <p>
            {records.length}{' '}
            {records.length > 1
              ? 'anciennes attributions archivées'
              : 'ancienne attribution archivée'}
          </p>
        </div>

      </header>


      {/* =========================
          RECHERCHE
      ========================= */}
      <div className="search-bar">

        <Search size={16} />

        <input
          type="text"
          placeholder="Rechercher un bracelet, un bébé ou une mère..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

      </div>


      {/* =========================
          CHARGEMENT
      ========================= */}
      {loading && (
        <div className="historique-empty">
          <p>Chargement de l'historique...</p>
        </div>
      )}


      {/* =========================
          AUCUN HISTORIQUE
      ========================= */}
      {!loading && records.length === 0 && (
        <div className="historique-empty">

          <History size={40} />

          <h2>Aucune attribution archivée</h2>

          <p>
            Aucun bracelet n'a encore été archivé dans
            l'historique.
          </p>

        </div>
      )}


      {/* =========================
          AUCUN RESULTAT
      ========================= */}
      {!loading &&
        records.length > 0 &&
        filtered.length === 0 && (
          <div className="historique-empty">

            <Search size={32} />

            <h2>Aucun résultat</h2>

            <p>
              Aucun bracelet, bébé ou parent ne correspond
              à votre recherche.
            </p>

          </div>
        )}


      {/* =========================
          LISTE HISTORIQUE
      ========================= */}
      {!loading && filtered.length > 0 && (
        <div className="historique-list">

          {filtered.map((record) => (

            <div
              className="historique-card"
              key={record.id}
            >

              <div className="historique-icon">
                <Radio size={18} />
              </div>


              <div className="historique-info">

                <strong>
                  {record.bracelet} — {record.baby}
                </strong>

                <span>
                  {record.mother}
                </span>

              </div>


              <div className="historique-dates">

                <Calendar size={14} />

                <span>
                  {record.start_date} → {record.end_date}
                </span>

              </div>


              <span className="historique-reason">
                {record.reason}
              </span>

            </div>

          ))}

        </div>
      )}

    </div>
  )
}

export default Historique