import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import './App.css'
import Login from './Login'
import Home from './Home'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<Navigate to="/home" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
