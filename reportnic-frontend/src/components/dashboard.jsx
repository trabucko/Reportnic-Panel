import { useAuth } from "../context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../firebaseConfig";

function Dashboard({ claims }) {
  const { user } = useAuth();

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (!user) return <p>No hay usuario logueado</p>;

  return (
    <div>
      <h1>Bienvenido al panel del hospital</h1>
      <p>Usuario: {user.email}</p>
      <p>Hospital ID: {claims?.hospitalId || "No asignado"}</p>
      <p>Rol: {claims?.role || "No asignado"}</p>
      <button onClick={handleLogout}>Cerrar sesión</button>
    </div>
  );
}

export default Dashboard;
