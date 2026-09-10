import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MoreVertical,
  Pencil,
  Plus,
  CheckCircle,
  XCircle,
  Radio,
  Baby,
} from 'lucide-react'
import './GestionBebes.css'
import { API_URL } from '../api'

function GestionBebes() {
  const navigate = useNavigate()

  const [admissions, setAdmissions] = useState([])
  const [openMenu, setOpenMenu] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // ============================================================
  // RECUPERER LES ADMISSIONS
  // ============================================================
  const fetchAdmissions = async () => {
    try {
      setError('')

      const response = await fetch(
  `${API_URL}/api/admissions`
       )

      const data = await response.json()

      if (response.ok) {
        setAdmissions(data)
      } else {
        setError(
          data.message ||
            'Impossible de récupérer les admissions.'
        )
      }
    } catch (error) {
      console.error(error)
      setError(
        'Impossible de contacter le serveur.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAdmissions()
  }, [])

  // ============================================================
  // MODIFIER LE BRACELET
  // ============================================================
  const handleModifierBracelet = async (admission) => {
    setOpenMenu(null)

    const nouveauBracelet = window.prompt(
      `Modifier le bracelet de ${admission.nom_mere}\n\nBracelet actuel : ${admission.bracelet}\n\nEntrez le nouvel identifiant :`,
      admission.bracelet
    )

    if (!nouveauBracelet) {
      return
    }

    try {
      const response = await fetch(
       `${API_URL}/api/admissions/${admission.id}/modifier-bracelet`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            bracelet: nouveauBracelet,
          }),
        }
      )

      const data = await response.json()

      if (response.ok && data.success) {
        alert('Bracelet modifié avec succès.')
        fetchAdmissions()
      } else {
        alert(
          data.message ||
            'Impossible de modifier le bracelet.'
        )
      }
    } catch (error) {
      console.error(error)
      alert(
        'Impossible de contacter le serveur.'
      )
    }
  }

  // ============================================================
  // AJOUTER UN BRACELET
  // ============================================================
  const handleAjouterBracelet = async (admission) => {
    setOpenMenu(null)

    const nouveauBracelet = window.prompt(
      `Ajouter un bracelet pour ${admission.nom_mere}\n\nEntrez l'identifiant du nouveau bracelet :`
    )

    if (!nouveauBracelet) {
      return
    }

    try {
      const response = await fetch(
        `${API_URL}/api/admissions/${admission.id}/ajouter-bracelet`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            bracelet: nouveauBracelet,
          }),
        }
      )

      const data = await response.json()

      if (response.ok && data.success) {
        alert('Bracelet ajouté avec succès.')
        fetchAdmissions()
      } else {
        alert(
          data.message ||
            'Impossible d’ajouter le bracelet.'
        )
      }
    } catch (error) {
      console.error(error)
      alert(
        'Impossible de contacter le serveur.'
      )
    }
  }

  // ============================================================
  // ACTIVER LE BRACELET
  // ============================================================
  const handleActiverBracelet = (admission) => {
    setOpenMenu(null)

    const confirmation = window.confirm(
      `Enregistrer la naissance et activer le bracelet ${admission.bracelet} pour ${admission.nom_mere} ?`
    )

    if (!confirmation) {
      return
    }

    navigate(
      `/nouveau-bebe?admission=${admission.id}`
    )
  }

  // ============================================================
  // RETIRER LE BRACELET
  // ============================================================
  const handleRetirerBracelet = async (admission) => {
    setOpenMenu(null)

    const confirmation = window.confirm(
      `La maman ${admission.nom_mere} quitte-t-elle l'hôpital ?\n\nLe bracelet ${admission.bracelet} sera retiré et son attribution sera conservée dans l'historique.`
    )

    if (!confirmation) {
      return
    }

    let motif = window.prompt(
      'Motif du retrait :',
      'Sortie de l’hôpital'
    )

    if (motif === null) {
      return
    }

    motif = motif.trim()

    if (!motif) {
      motif = 'Sortie de l’hôpital'
    }

    try {
      const response = await fetch(
        `${API_URL}/api/admissions/${admission.id}/retirer`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            motif_retrait: motif,
          }),
        }
      )

      const data = await response.json()

      if (response.ok && data.success) {
        alert(
          `Le bracelet ${admission.bracelet} a été retiré et enregistré dans l'historique.`
        )

        fetchAdmissions()
      } else {
        alert(
          data.message ||
            'Impossible de retirer le bracelet.'
        )
      }
    } catch (error) {
      console.error(error)

      alert(
        'Impossible de contacter le serveur.'
      )
    }
  }

  // ============================================================
  // STATUT
  // ============================================================
  const getStatut = (statut) => {
    if (statut === 'reserve') {
      return {
        label: 'Réservé',
        className: 'status-reserve',
      }
    }

    if (statut === 'actif') {
      return {
        label: 'Actif',
        className: 'status-active',
      }
    }

    if (statut === 'retire') {
      return {
        label: 'Retiré',
        className: 'status-retired',
      }
    }

    return {
      label: statut,
      className: '',
    }
  }

  // ============================================================
  // AFFICHAGE
  // ============================================================
  return (
    <div className="gestion-bebes-page">

      <div className="gestion-header">

        <div>
          <h1>
            <Baby size={26} />
            Gestion des bébés
          </h1>

          <p>
            Gestion des admissions et des bracelets de sécurité
          </p>
        </div>

        <button
          className="add-button"
          onClick={() => navigate('/nouvelle-admission')}
        >
          <Plus size={18} />
          Nouvelle admission
        </button>

      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading">
          Chargement des admissions...
        </div>
      ) : admissions.length === 0 ? (
        <div className="empty-state">
          <Radio size={40} />

          <h2>
            Aucune admission
          </h2>

          <p>
            Aucune admission n'a encore été enregistrée.
          </p>
        </div>
      ) : (

        <div className="admissions-list">

          {admissions.map((admission) => {

            const statut = getStatut(
              admission.statut
            )

            return (
              <div
                className="admission-card"
                key={admission.id}
              >

                {/* INFORMATIONS */}
                <div className="admission-info">

                  <div className="mother-icon">
                    <Baby size={24} />
                  </div>

                  <div className="mother-details">

                    <h3>
                      {admission.nom_mere}
                    </h3>

                    <p>
                      ID mère :{' '}
                      {admission.identifiant_mere ||
                        'Non renseigné'}
                    </p>

                    <p>
                      Téléphone :{' '}
                      {admission.telephone_mere}
                    </p>

                    {admission.parent_email && (
                      <p>
                        Email :{' '}
                        {admission.parent_email}
                      </p>
                    )}

                  </div>

                </div>

                {/* BRACELET */}
                <div className="bracelet-info">

                  <span className="bracelet-label">
                    Bracelet
                  </span>

                  <strong>
                    <Radio size={17} />
                    {admission.bracelet}
                  </strong>

                </div>

                {/* STATUT */}
                <div className="status-container">

                  <span
                    className={`status-badge ${statut.className}`}
                  >
                    {admission.statut === 'actif' && (
                      <CheckCircle size={15} />
                    )}

                    {admission.statut === 'reserve' && (
                      <Radio size={15} />
                    )}

                    {admission.statut === 'retire' && (
                      <XCircle size={15} />
                    )}

                    {statut.label}
                  </span>

                </div>

                {/* ACTIONS */}
                <div className="actions">

                  {/* BOUTON RETIRER DIRECTEMENT A COTE DU STATUT ACTIF */}
                  {admission.statut === 'actif' && (
                    <button
                      className="retirer-button"
                      onClick={() =>
                        handleRetirerBracelet(
                          admission
                        )
                      }
                    >
                      <XCircle size={16} />
                      Retirer
                    </button>
                  )}

                  {/* MENU */}
                  <div className="menu-container">

                    <button
                      className="menu-button"
                      onClick={() =>
                        setOpenMenu(
                          openMenu === admission.id
                            ? null
                            : admission.id
                        )
                      }
                    >
                      <MoreVertical size={20} />
                    </button>

                    {openMenu === admission.id && (
                      <div className="dropdown-menu">

                        <button
                          onClick={() =>
                            handleModifierBracelet(
                              admission
                            )
                          }
                        >
                          <Pencil size={16} />
                          Modifier le bracelet
                        </button>

                        <button
                          onClick={() =>
                            handleAjouterBracelet(
                              admission
                            )
                          }
                        >
                          <Plus size={16} />
                          Ajouter un bracelet
                        </button>

                        {admission.statut ===
                          'reserve' && (
                          <button
                            onClick={() =>
                              handleActiverBracelet(
                                admission
                              )
                            }
                          >
                            <CheckCircle size={16} />
                            Activer le bracelet
                          </button>
                        )}

                        {admission.statut ===
                          'actif' && (
                          <button
                            className="danger-action"
                            onClick={() =>
                              handleRetirerBracelet(
                                admission
                              )
                            }
                          >
                            <XCircle size={16} />
                            Retirer le bracelet
                          </button>
                        )}

                      </div>
                    )}

                  </div>

                </div>

              </div>
            )
          })}

        </div>
      )}

    </div>
  )
}

export default GestionBebes