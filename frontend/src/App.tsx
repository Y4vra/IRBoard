import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'

import './App.css'
import Login from './Login'
import Home from './Home'
import { AuthProvider } from './context/AuthProvider'
import { ProtectedRoute } from './components/ProtectedRoute'
import { NavBar } from './components/Navbar'
import NewProject from './newProject'

const WindowLayout = () => (
  <div className="min-h-screen flex flex-col">
    <NavBar /> 
    <main className="p-4">
      <Outlet />
    </main>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<WindowLayout />}>
              <Route path="/" element={<Home />}/>
              <Route path="/home" element={<Home />}/>
              <Route path="/projects/new" element={<NewProject />}/>
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
