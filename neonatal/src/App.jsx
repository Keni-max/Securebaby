import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import DashboardParent from './pages/DashboardParent'
import MapView from './pages/MapView'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard/admin" element={<Dashboard />} />
      <Route path="/dashboard/parent" element={<DashboardParent />} />
      <Route path="/carte" element={<MapView />} />
    </Routes>
  )
}

export default App