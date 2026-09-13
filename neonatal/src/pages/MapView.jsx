import {
MapContainer,
TileLayer,
Marker,
Popup,
Circle,
useMap,
} from 'react-leaflet'

import {
useNavigate,
useLocation,
} from 'react-router-dom'

import {
useEffect,
useState,
} from 'react'

import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

import './MapView.css'
import { API_URL } from '../api'

const defaultIcon = L.icon({
iconUrl: icon,
shadowUrl: iconShadow,
iconSize: [25, 41],
iconAnchor: [12, 41],
})

L.Marker.prototype.options.icon = defaultIcon

function MapController({ position }) {

const map = useMap()

useEffect(() => {

if (
  Array.isArray(position) &&
  position.length === 2 &&
  Number.isFinite(position[0]) &&
  Number.isFinite(position[1])
) {

  map.setView(position, 17)

}

}, [position, map])

return null
}

export default function MapView() {

const navigate = useNavigate()
const location = useLocation()

const [baby, setBaby] = useState(null)
const [error, setError] = useState('')

const bracelet = 'BR-073'

const hospitalCenter = [3.8480, 11.5021]
const safeZoneRadius = 300

const fetchBabyPosition = async () => {

try {

  const response = await fetch(
    `${API_URL}/api/bracelet/${bracelet}/telemetry`
  )


  if (!response.ok) {

    throw new Error(
      `Erreur serveur : ${response.status}`
    )

  }


  const data = await response.json()


  console.log(
    '📡 RÉPONSE API GPS :',
    data
  )


  let telemetry = []


  if (Array.isArray(data)) {

    telemetry = data

  } else if (
    data &&
    Array.isArray(data.data)
  ) {

    telemetry = data.data

  } else if (
    data &&
    data.value
  ) {

    if (Array.isArray(data.value)) {

      telemetry = data.value

    } else {

      telemetry = [data.value]

    }

  }


  if (telemetry.length === 0) {

    console.log(
      '⚠️ Aucune donnée GPS disponible'
    )

    setBaby(null)

    setError(
      'Position GPS non disponible'
    )

    return

  }


  const latest = telemetry[0]


  console.log(
    '📍 DERNIÈRE DONNÉE GPS :',
    latest
  )


  const latitude = Number(
    latest.latitude
  )


  const longitude = Number(
    latest.longitude
  )


  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude === 0 ||
    longitude === 0 ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {

    console.log(
      '⚠️ Position GPS non disponible'
    )

    setBaby(null)

    setError(
      'Position GPS non disponible'
    )

    return

  }


  const babyData = {

    id:
      latest.baby_id ||
      bracelet,

    name:
      latest.baby_name ||
      'Bébé',

    bracelet:
      latest.baby_id ||
      bracelet,

    latitude,

    longitude,

    position: [
      latitude,
      longitude,
    ],

  }


  console.log(
    '📍 POSITION DU BRACELET :',
    babyData.position
  )


  setBaby(babyData)

  setError('')


} catch (err) {

  console.error(
    '❌ ERREUR GPS :',
    err
  )


  setError(
    'Impossible de récupérer la position GPS.'
  )

}

}

useEffect(() => {

fetchBabyPosition()


const interval = setInterval(() => {

  fetchBabyPosition()

}, 3000)


return () => {

  clearInterval(interval)

}

}, [])

const mapCenter =
baby &&
Array.isArray(baby.position) &&
baby.position.length === 2 &&
Number.isFinite(baby.position[0]) &&
Number.isFinite(baby.position[1])
? baby.position
: hospitalCenter

const handleBack = () => {

const params =
  new URLSearchParams(
    location.search
  )


const role =
  params.get('role')


if (role === 'parent') {

  navigate(
    '/dashboard/parent'
  )

} else {

  navigate(
    '/dashboard/admin'
  )

}

}

return (

<div className="map-page">


  <header className="map-header">

    <button
      className="back-button"
      onClick={handleBack}
    >
      ← Retour
    </button>


    <div>

      <h1>
        Carte GPS TEST
      </h1>

      <p>
        Position du bracelet en temps réel
      </p>

    </div>

  </header>


  {error && (

    <div className="map-error">

      {error}

    </div>

  )}


  <div className="map-container">


    <MapContainer
      center={mapCenter}
      zoom={17}
      scrollWheelZoom={true}
      style={{
        height: '100%',
        width: '100%',
      }}
    >


      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />


      <MapController
        position={
          baby?.position ||
          hospitalCenter
        }
      />


      <Circle
        center={hospitalCenter}
        radius={safeZoneRadius}
      />


      {baby &&
        Array.isArray(baby.position) &&
        baby.position.length === 2 && (

        <Marker
          position={baby.position}
          icon={defaultIcon}
        >

          <Popup>

            <div>

              <h3>
                📍 Position du bracelet
              </h3>


              <p>

                <strong>
                  Bracelet :
                </strong>{' '}

                {baby.bracelet}

              </p>


              <p>

                <strong>
                  Latitude :
                </strong>{' '}

                {baby.latitude}

              </p>


              <p>

                <strong>
                  Longitude :
                </strong>{' '}

                {baby.longitude}

              </p>

            </div>

          </Popup>

        </Marker>

      )}

    </MapContainer>

  </div>

</div>

)

}