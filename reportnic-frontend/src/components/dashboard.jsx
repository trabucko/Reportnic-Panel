import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getFirestore,
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { app, auth } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const { claims, user } = useAuth();
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const db = getFirestore(app);
  const navigate = useNavigate();

  // Guardar token en localStorage
  useEffect(() => {
    if (user) {
      user.getIdToken().then((token) => {
        localStorage.setItem("token", token);
      });
    }
  }, [user]);

  const filtrarAlertasRecientes = (alertasList) => {
    const ahora = new Date();
    const diezMinutosEnMs = 10 * 60 * 1000;
    return alertasList.filter((alerta) => {
      if (!alerta.fecha) return false;
      const tiempoTranscurrido = ahora - alerta.fecha;
      return tiempoTranscurrido <= diezMinutosEnMs;
    });
  };

  useEffect(() => {
    if (!claims || !claims.hospitalId) return;

    setAlertas([]);
    setLoading(true);

    const q = query(
      collection(db, "Alertas"),
      where("hospital_id", "==", claims.hospitalId),
      orderBy("fecha", "desc"),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const todasLasAlertas = snapshot.docs.map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          ...d,
          fecha: d.fecha?.toDate ? d.fecha.toDate() : d.fecha,
        };
      });

      const alertasRecientes = filtrarAlertasRecientes(todasLasAlertas);
      setAlertas(alertasRecientes);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [claims]);

  useEffect(() => {
    const intervalo = setInterval(() => {
      setAlertas((alertasActuales) => filtrarAlertasRecientes(alertasActuales));
    }, 60000);
    return () => clearInterval(intervalo);
  }, []);

  const calcularTiempoRestante = (fechaAlerta) => {
    if (!fechaAlerta) return "Sin fecha";
    const ahora = new Date();
    const tiempoTranscurrido = ahora - fechaAlerta;
    const diezMinutosEnMs = 10 * 60 * 1000;
    const tiempoRestante = diezMinutosEnMs - tiempoTranscurrido;
    if (tiempoRestante <= 0) return "Expirando...";
    const minutosRestantes = Math.floor(tiempoRestante / 60000);
    const segundosRestantes = Math.floor((tiempoRestante % 60000) / 1000);
    return `${minutosRestantes}m ${segundosRestantes}s restantes`;
  };

  if (claims === undefined || loading) return <p>Cargando alertas...</p>;
  if (!claims) return <p>No tienes hospital asignado</p>;

  const handleLogout = async () => {
    await auth.signOut();
    localStorage.removeItem("token");
    navigate("/"); // redirige al login
  };

  return (
    <div>
      <h1>Bienvenido al panel del hospital</h1>
      <p>Hospital ID: {claims.hospitalId}</p>
      <p>Rol: {claims.role}</p>

      <button onClick={handleLogout} style={{ marginBottom: "20px" }}>
        Cerrar sesión
      </button>

      {/* Botón solo para administradores */}
      {claims.role === "hospital_manager" && (
        <button
          onClick={() => navigate("/crear-monitor")}
          style={{ marginBottom: "20px", marginLeft: "10px" }}
        >
          Crear Usuario Monitor
        </button>
      )}

      <h2>Alertas recientes (últimos 10 minutos)</h2>
      {alertas.length === 0 ? (
        <p>No hay alertas nuevas</p>
      ) : (
        <ul>
          {alertas.map((alerta) => (
            <li
              key={alerta.id}
              style={{
                marginBottom: "1rem",
                padding: "1rem",
                border: "1px solid #ccc",
                borderRadius: "8px",
                backgroundColor: "#191a10ff",
              }}
            >
              <p>
                <strong>{alerta.titulo}</strong>
              </p>
              {alerta.descripcion && (
                <p>
                  <strong>Descripción:</strong> {alerta.descripcion}
                </p>
              )}
              {alerta.afectaciones && (
                <p>
                  <strong>Afectaciones:</strong> {alerta.afectaciones}
                </p>
              )}
              <p>
                <strong>Fecha:</strong>{" "}
                {alerta.fecha ? alerta.fecha.toLocaleString() : "Sin fecha"}
              </p>
              <p
                style={{
                  color: "#c21717ff",
                  fontSize: "0.9em",
                  fontStyle: "italic",
                }}
              >
                {calcularTiempoRestante(alerta.fecha)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Dashboard;
