import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom'

import Login from './pages/Login'
import Home from './pages/Home'
import { AuthProvider } from './context/AuthProvider'
import { ProtectedRoute } from './components/ProtectedRoute'
import { NavBar } from './components/Navbar'
import NewProject from './pages/Project/NewProject'
import ProjectView from './pages/Project/ProjectView'
import Registration from './pages/Registration'
import ErrorPage from './pages/ErrorPage'
import UserManagement from './pages/UserManagement'
import StakeholdersView from './pages/Project/StakeholdersView'
import StakeholderDetailView from './pages/Project/stakeholder/StakeholderDetailView'
import NonFunctionalRequirementsView from './pages/Project/NonFunctionalRequirementsView'
import NonFunctionalRequirementDetailView from './pages/Project/nfr/NonFunctionalRequirementDetailView'
import FunctionalityView from './pages/Project/FunctionalityView'

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
          <Route path="/registration" element={<Registration />} />
          <Route path="/error" element={<ErrorPage />}/>
          <Route element={<ProtectedRoute />}>
            <Route element={<WindowLayout />}>
              <Route path="/" element={<Home />}/>
              <Route path="/home" element={<Home />}/>
              <Route path="/projects/new" element={<NewProject />}/>
              <Route path="/project/:id" element={<ProjectView/>}/>
              <Route path="/project/:projectId/functionalities/:functionalityId" element={<FunctionalityView/>}/>
              <Route path="/project/:projectId/stakeholders" element={<StakeholdersView/>}/>
              <Route path="/project/:projectId/stakeholders/:stakeholderId" element={<StakeholderDetailView/>}/>
              <Route path="/project/:projectId/nfr" element={<NonFunctionalRequirementsView/>}/>
              <Route path="/project/:projectId/nfr/:nfrId" element={<NonFunctionalRequirementDetailView/>}/>
              
            </Route>
          </Route>
          <Route element={<ProtectedRoute adminOnly={true}/>}>
            <Route element={<WindowLayout />}>
              <Route path="/admin/users" element={<UserManagement />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/error" state={{ from: location.pathname, errorType: "route" }} replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
