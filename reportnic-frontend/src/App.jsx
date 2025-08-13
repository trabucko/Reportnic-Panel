import { useState } from "react";
import Login from "./components/Login";

function App() {
  const [claims, setClaims] = useState(null);

  if (!claims) {
    return <Login onLogin={setClaims} />;
  }

  return (
    <div>
      <h1>Bienvenido al panel del hospital</h1>
      <p>Hospital ID: {claims.hospitalId}</p>
      <p>Rol: {claims.role}</p>
      {/* Aquí puedes poner el dashboard o rutas protegidas */}
    </div>
  );
}

export default App;
