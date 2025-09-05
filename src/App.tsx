import "./App.css";
import { Routes, Route, useLocation } from "react-router";
import Navbar from "./components/navbar";
import Sidebar from "./components/sidebar";
import Dashboard from "./pages/dashboard";
import Test from "./pages/speedTests";
import Login from "./pages/login";
import Backup from "./pages/backup";
import Monitoreo from "./pages/monitoreo";

function App() {
  const locationNow = useLocation();
  return (
    <div className="flex">
      {locationNow.pathname !== "/" && <Sidebar />}
      <div className="flex flex-col w-full">
        {locationNow.pathname !== "/" && <Navbar />}
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/speedtest" element={<Test />} />
          <Route path="/backup" element={<Backup />} />
          <Route path="/monitor" element={<Monitoreo />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
