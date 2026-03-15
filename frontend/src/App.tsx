import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import './App.css'
import Login from './Login'
import Home from './Home'
import { AuthProvider } from './context/AuthProvider'
import { ProtectedRoute } from './components/ProtectedRoute'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
          
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>}/>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
