
import './App.css'
import { Routes, Route } from "react-router"
import Navbar from './components/navbar'
function App() {


  return (
    <div className='text-red-500'> <Routes>
      <Route path="/" element={<Navbar />} />
    </Routes></div>
  )
}

export default App
