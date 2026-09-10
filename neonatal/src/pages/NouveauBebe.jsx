import { useEffect, useState } from 'react'
import { Baby, ArrowLeft } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import './NouveauBebe.css'
import { API_URL } from '../api'

function NouveauBebe() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const admissionId = searchParams.get('admission')

  const [parents, setParents] = useState([])
  const [loadingParents, setLoadingParents] = useState(true)

  const [availableBracelets, setAvailableBracelets] = useState([])
  const [loadingBracelets, setLoadingBracelets] = useState(true)

  const [braceletChoice, setBraceletChoice] = useState('')

  const [admission, setAdmission] = useState(null)
  const [loadingAdmission, setLoadingAdmission] = useState(false)

  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    dateNaissance: '',
    heureNaissance: '',
    sexe: '',
    nomMere: '',
    telephoneMere: '',
    emailParent: '',
    parentId: '',
    bracelet: '',
    admissionId: admissionId || '',
  })

  // =========================
  // RÉCUPÉRER LES PARENTS
  // =========================
  useEffect(() => {
    fetch(`${API_URL}/api/parents`)
      .then((response) => response.json())
      .then((data) => {
        setParents(Array.isArray(data) ? data : [])
        setLoadingParents(false)
      })
      .catch((error) => {
        console.error(
          'Erreur récupération parents :',
          error
        )

        setLoadingParents(false)
      })
  }, [])

  // =========================
  // RÉCUPÉRER L'ADMISSION
  // =========================
  useEffect(() => {
    if (!admissionId) {
      return
    }

    setLoadingAdmission(true)

    fetch(
  `${API_URL}/api/admissions/${admissionId}`
)
      .then((response) => response.json())
      .then((data) => {
        if (!data.success) {
          alert(
            data.message ||
              'Admission introuvable.'
          )

          navigate('/gestion')
          return
        }

        const admissionData = data.admission

        setAdmission(admissionData)

        setFormData((previous) => ({
          ...previous,

          // Le nom de la mère vient directement
          // de l'admission
          nomMere:
            admissionData.nom_mere || '',

          // Le téléphone vient directement
          // de l'admission
          telephoneMere:
            admissionData.telephone_mere || '',

          // Le bracelet réservé est conservé
          bracelet:
            admissionData.bracelet || '',

          admissionId:
            admissionData.id,
        }))

        setBraceletChoice(
          admissionData.bracelet || ''
        )
      })
      .catch((error) => {
        console.error(
          'Erreur récupération admission :',
          error
        )

        alert(
          'Impossible de récupérer l’admission.'
        )

        navigate('/gestion')
      })
      .finally(() => {
        setLoadingAdmission(false)
      })
  }, [admissionId, navigate])

  // =========================
  // RECHERCHER AUTOMATIQUEMENT
  // SI LA MÈRE EXISTE DÉJÀ
  // PARMI LES PARENTS
  // =========================
  useEffect(() => {
    if (!admission || parents.length === 0) {
      return
    }

    const parent = parents.find(
      (p) =>
        String(p.telephone) ===
        String(admission.telephone_mere)
    )

    if (parent) {
      setFormData((previous) => ({
        ...previous,

        parentId:
          String(parent.id),

        nomMere:
          `${parent.nom} ${parent.prenom}`,

        telephoneMere:
          parent.telephone,

        emailParent:
          parent.email || '',
      }))
    }

    // IMPORTANT :
    // S'il n'existe pas dans la liste,
    // on garde simplement les informations
    // provenant de l'admission.
  }, [admission, parents])

  // =========================
  // RÉCUPÉRER LES BRACELETS
  // DISPONIBLES
  // =========================
  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/api/history`),
      fetch(`${API_URL}/api/babies`),
    ])
      .then(async ([historyResponse, babiesResponse]) => {
        const history =
          await historyResponse.json()

        const babies =
          await babiesResponse.json()

        const braceletsUtilises = babies
          .map((baby) => baby.bracelet)
          .filter(Boolean)

        const braceletsHistorique = history
          .map((record) => record.bracelet)
          .filter(Boolean)

        const braceletsDisponibles = [
          ...new Set(braceletsHistorique),
        ].filter(
          (bracelet) =>
            !braceletsUtilises.includes(
              bracelet
            )
        )

        setAvailableBracelets(
          braceletsDisponibles
        )

        setLoadingBracelets(false)
      })
      .catch((error) => {
        console.error(
          'Erreur récupération des bracelets :',
          error
        )

        setLoadingBracelets(false)
      })
  }, [])

  // =========================
  // MODIFICATION DU FORMULAIRE
  // =========================
  const handleChange = (e) => {
    const { name, value } = e.target

    // Si on modifie manuellement le nom
    // ou le téléphone, on considère que
    // ce n'est plus forcément un parent
    // existant.
    if (
      name === 'nomMere' ||
      name === 'telephoneMere' ||
      name === 'emailParent'
    ) {
      setFormData((previous) => ({
        ...previous,
        [name]: value,

        // On retire l'association avec
        // un parent existant.
        parentId: '',
      }))

      return
    }

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))

    // =========================
    // CHOIX D'UN PARENT EXISTANT
    // =========================
    if (name === 'parentId') {
      const parent = parents.find(
        (p) =>
          String(p.id) === String(value)
      )

      if (parent) {
        setFormData((previous) => ({
          ...previous,

          parentId: value,

          nomMere:
            `${parent.nom} ${parent.prenom}`,

          telephoneMere:
            parent.telephone,

          emailParent:
            parent.email || '',
        }))
      }
    }
  }

  // =========================
  // CHOIX DU BRACELET
  // =========================
  const handleBraceletChoice = (e) => {
    const value = e.target.value

    setBraceletChoice(value)

    if (value !== 'nouveau') {
      setFormData((previous) => ({
        ...previous,
        bracelet: value,
      }))
    } else {
      setFormData((previous) => ({
        ...previous,
        bracelet: '',
      }))
    }
  }

  // =========================
  // ENREGISTRER LE BÉBÉ
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Vérification du bracelet
    if (!formData.bracelet) {
      alert(
        'Veuillez sélectionner ou saisir un bracelet.'
      )

      return
    }

    // Si l'enregistrement vient d'une admission,
    // le bracelet doit être celui qui a été réservé.
    if (admissionId && admission) {
      if (
        formData.bracelet !==
        admission.bracelet
      ) {
        alert(
          `Le bracelet doit être ${admission.bracelet} pour cette admission.`
        )

        return
      }
    }

    // Le parentId n'est PLUS obligatoire.
    //
    // Si la mère existe déjà :
    // parentId contient son identifiant.
    //
    // Si c'est une nouvelle mère :
    // parentId reste vide, mais
    // nomMere + telephoneMere sont enregistrés.

    // Vérification du nom du parent
    if (!formData.nomMere.trim()) {
      alert(
        'Veuillez saisir le nom du parent.'
      )

      return
    }

    // Vérification du téléphone
    if (!formData.telephoneMere.trim()) {
      alert(
        'Veuillez saisir le numéro de téléphone du parent.'
      )

      return
    }

    try {
      const response = await fetch(
  `${API_URL}/api/babies`,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify({
            ...formData,

            // Si aucun parent existant n'est sélectionné,
            // on envoie null au backend.
            parentId:
              formData.parentId
                ? formData.parentId
                : null,
          }),
        }
      )

      const data = await response.json()

      if (data.success) {
        alert(
          'Bébé enregistré et bracelet activé avec succès !'
        )

        navigate('/gestion')
      } else {
        alert(
          data.message ||
            'Impossible d’enregistrer le bébé.'
        )
      }
    } catch (error) {
      console.error(error)

      alert(
        'Impossible de contacter le serveur.'
      )
    }
  }

  return (
    <div className="nouveau-bebe-page">

      <header className="nouveau-bebe-header">

        <button
          className="back-button"
          onClick={() => navigate('/gestion')}
        >
          <ArrowLeft size={18} />
          Retour
        </button>

        <div>

          <h1>
            <Baby size={24} />
            Nouveau bébé
          </h1>

          {admission && (
            <p>
              Enregistrement du bébé de{' '}
              <strong>
                {admission.nom_mere}
              </strong>{' '}
              — Bracelet{' '}
              <strong>
                {admission.bracelet}
              </strong>
            </p>
          )}

        </div>

      </header>

      {loadingAdmission ? (

        <div className="gestion-empty">

          <p>
            Chargement de l'admission...
          </p>

        </div>

      ) : (

        <form
          className="bebe-form"
          onSubmit={handleSubmit}
        >

          {/* =========================
              INFORMATIONS DU BÉBÉ
          ========================= */}

          <div className="form-section">

            <h2>
              Informations du bébé
            </h2>

            <div className="form-grid">

              <div className="input-group">

                <label>
                  Nom
                </label>

                <input
                  type="text"
                  name="nom"
                  placeholder="Nom du bébé"
                  value={formData.nom}
                  onChange={handleChange}
                  required
                />

              </div>

              <div className="input-group">

                <label>
                  Prénom
                </label>

                <input
                  type="text"
                  name="prenom"
                  placeholder="Prénom du bébé"
                  value={formData.prenom}
                  onChange={handleChange}
                  required
                />

              </div>

              <div className="input-group">

                <label>
                  Date de naissance
                </label>

                <input
                  type="date"
                  name="dateNaissance"
                  value={
                    formData.dateNaissance
                  }
                  onChange={handleChange}
                  required
                />

              </div>

              <div className="input-group">

                <label>
                  Heure de naissance
                </label>

                <input
                  type="time"
                  name="heureNaissance"
                  value={
                    formData.heureNaissance
                  }
                  onChange={handleChange}
                  required
                />

              </div>

              <div className="input-group">

                <label>
                  Sexe
                </label>

                <select
                  name="sexe"
                  value={formData.sexe}
                  onChange={handleChange}
                  required
                >

                  <option value="">
                    Sélectionner
                  </option>

                  <option value="F">
                    Féminin
                  </option>

                  <option value="M">
                    Masculin
                  </option>

                </select>

              </div>

            </div>

          </div>

          {/* =========================
              INFORMATIONS DU PARENT
          ========================= */}

          <div className="form-section">

            <h2>
              Informations du parent
            </h2>

            <div className="form-grid">

              {/* MENU PARENT EXISTANT */}
              <div className="input-group">

                <label>
                  Parent existant
                </label>

                <select
                  name="parentId"
                  value={
                    formData.parentId
                  }
                  onChange={handleChange}
                >

                  <option value="">
                    {loadingParents
                      ? 'Chargement des parents...'
                      : 'Aucun / nouveau parent'}
                  </option>

                  {parents.map(
                    (parent) => (
                      <option
                        key={parent.id}
                        value={parent.id}
                      >
                        {parent.nom}{' '}
                        {parent.prenom}
                      </option>
                    )
                  )}

                </select>

                <small>
                  Si le parent n'existe pas
                  dans la liste, laissez
                  « Aucun / nouveau parent »
                  puis saisissez ses
                  informations ci-dessous.
                </small>

              </div>

              {/* NOM DU PARENT */}
              <div className="input-group">

                <label>
                  Nom complet du parent
                </label>

                <input
                  type="text"
                  name="nomMere"
                  placeholder="Ex : Marie Dupont"
                  value={
                    formData.nomMere
                  }
                  onChange={handleChange}
                  required
                />

              </div>

              {/* TÉLÉPHONE */}
              <div className="input-group">

                <label>
                  Téléphone
                </label>

                <input
                  type="tel"
                  name="telephoneMere"
                  placeholder="Téléphone du parent"
                  value={
                    formData.telephoneMere
                  }
                  onChange={handleChange}
                  required
                />

              </div>

              {/* EMAIL */}
              <div className="input-group">

                <label>
                  Email du parent
                </label>

                <input
                  type="email"
                  name="emailParent"
                  placeholder="Email du parent"
                  value={
                    formData.emailParent
                  }
                  onChange={handleChange}
                />

              </div>

            </div>

          </div>

          {/* =========================
              BRACELET
          ========================= */}

          <div className="form-section">

            <h2>
              Bracelet de sécurité
            </h2>

            <div className="input-group">

              <label>
                Bracelet attribué
              </label>

              {admission ? (

                <>
                  <input
                    type="text"
                    value={
                      admission.bracelet
                    }
                    readOnly
                  />

                  <small>
                    Ce bracelet a été réservé
                    lors de l'admission de{' '}
                    {admission.nom_mere}.
                    Il sera activé après
                    l'enregistrement du bébé.
                  </small>
                </>

              ) : (

                <>

                  <select
                    value={
                      braceletChoice
                    }
                    onChange={
                      handleBraceletChoice
                    }
                    required
                  >

                    <option value="">
                      {loadingBracelets
                        ? 'Chargement...'
                        : 'Sélectionner une option'}
                    </option>

                    {availableBracelets.length >
                      0 && (

                      <optgroup
                        label="Bracelets disponibles"
                      >

                        {availableBracelets.map(
                          (bracelet) => (

                            <option
                              key={bracelet}
                              value={bracelet}
                            >
                              {bracelet} — Disponible
                            </option>

                          )
                        )}

                      </optgroup>

                    )}

                    <option value="nouveau">
                      + Nouveau bracelet
                    </option>

                  </select>

                  {braceletChoice ===
                    'nouveau' && (

                    <div
                      className="input-group"
                      style={{
                        marginTop: '15px',
                      }}
                    >

                      <label>
                        Identifiant du nouveau bracelet
                      </label>

                      <input
                        type="text"
                        name="bracelet"
                        placeholder="Ex : BR-005"
                        value={
                          formData.bracelet
                        }
                        onChange={
                          handleChange
                        }
                        required
                      />

                    </div>

                  )}

                </>

              )}

            </div>

          </div>

          {/* =========================
              BOUTONS
          ========================= */}

          <div className="form-actions">

            <button
              type="button"
              className="cancel-button"
              onClick={() =>
                navigate('/gestion')
              }
            >
              Annuler
            </button>

            <button
              type="submit"
              className="save-button"
            >
              {admission
                ? 'Enregistrer le bébé et activer'
                : 'Enregistrer le bébé'}
            </button>

          </div>

        </form>

      )}

    </div>
  )
}

export default NouveauBebe