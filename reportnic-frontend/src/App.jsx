import { Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/dashboard";
import CrearMonitor from "./components/createMonitor.jsx";
import { useAuth } from "./context/AuthContext";
import { auth } from "./firebaseConfig";

function App() {
  const { user, claims, loading } = useAuth();

  if (loading || (user && claims === undefined)) return <p>Cargando...</p>;

  if (!user) return <Login />;

  if (!claims?.hospitalId) {
    return (
      <div>
        <p>No tienes hospital asignado. Contacta al administrador.</p>
        <button onClick={() => auth.signOut()}>Volver al login</button>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Dashboard claims={claims} />} />
      <Route path="/crear-monitor" element={<CrearMonitor claims={claims} />} />
    </Routes>
  );
}

export default App;
