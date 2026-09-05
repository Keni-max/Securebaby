import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import DashboardParent from './pages/DashboardParent'
import MapView from './pages/MapView'
import PersonnelEnLigne from './pages/PersonnelEnLigne'
import GestionBebes from './pages/GestionBebes'
import Historique from './pages/Historique'
import NouveauBebe from './pages/NouveauBebe'
import NouvelUtilisateur from './pages/NouvelUtilisateur'
import DashboardPersonnel from './pages/DashboardPersonnel'
function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard/admin" element={<Dashboard />} />
      <Route path="/dashboard/parent" element={<DashboardParent />} />
      <Route path="/carte" element={<MapView />} />
      <Route path="/personnel" element={<PersonnelEnLigne />} />
      <Route path="/gestion" element={<GestionBebes />} />
      <Route path="/historique" element={<Historique />} />
      <Route path="/nouveau-bebe" element={<NouveauBebe />} />
      <Route path="/nouvel-utilisateur" element={<NouvelUtilisateur />}/>
      <Route path="/dashboard/personnel" element={<DashboardPersonnel />} />
    </Routes>
  )
}

export default App