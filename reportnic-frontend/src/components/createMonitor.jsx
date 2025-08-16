import { useState } from "react";

function CrearMonitor() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token"); // tu token de Firebase
      if (!token) {
        setMensaje("No hay token disponible. Haz login primero.");
        return;
      }

      const res = await fetch("http://localhost:3000/monitores/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // token para verifyAuth
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setMensaje(`Monitor creado: ${data.email}`);
        setEmail("");
        setPassword("");
      } else {
        setMensaje(`Error: ${data.error || data.message}`);
      }
    } catch (error) {
      setMensaje("Error en la conexión con el servidor.");
      console.error(error);
    }
  };

  return (
    <div>
      <h2>Crear Usuario Monitor</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email del monitor:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Contraseña:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Crear Monitor</button>
      </form>
      {mensaje && <p>{mensaje}</p>}
    </div>
  );
}

export default CrearMonitor;
