import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import DashboardParent from './pages/DashboardParent'
import MapView from './pages/MapView'
import PersonnelEnLigne from './pages/PersonnelEnLigne'
import GestionBebes from './pages/GestionBebes'
function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard/admin" element={<Dashboard />} />
      <Route path="/dashboard/parent" element={<DashboardParent />} />
      <Route path="/carte" element={<MapView />} />
      <Route path="/personnel" element={<PersonnelEnLigne />} />
      <Route path="/gestion" element={<GestionBebes />} />
    </Routes>
  )
}

export default App