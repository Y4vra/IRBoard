import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'

import Login from './Login'
import Home from './Home'
import { AuthProvider } from './context/AuthProvider'
import { ProtectedRoute } from './components/ProtectedRoute'
import { NavBar } from './components/Navbar'
import NewProject from './newProject'

const WindowLayout = () => (
  <div className="min-h-screen flex flex-col bg-background">
    <NavBar /> 
    <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
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
