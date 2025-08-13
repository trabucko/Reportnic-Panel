import { useAuth } from "./context/AuthContext";
import Login from "./components/Login";
import Dashboard from "./components/dashboard";
import { auth } from "./firebaseConfig";

function App() {
  const { user, claims, loading } = useAuth();

  if (loading || (user && claims === undefined)) return <p>Cargando...</p>;

  // Usuario logueado pero sin hospital
  if (user && !claims?.hospitalId) {
    const handleLogout = async () => {
      await auth.signOut();
    };

    return (
      <div>
        <p>No tienes hospital asignado. Contacta al administrador.</p>
        <button onClick={handleLogout}>Volver al login</button>
      </div>
    );
  }

  return user && claims ? <Dashboard claims={claims} /> : <Login />;
}

export default App;
