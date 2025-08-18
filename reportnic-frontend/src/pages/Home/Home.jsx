import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { app, auth } from "../../firebaseConfig";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/navbar.jsx";
import "./Home.css";

function Dashboard() {
  const { claims, user } = useAuth();
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hospitalName, setHospitalName] = useState(""); // ✅ Estado para nombre
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

  // Obtener nombre del hospital
  useEffect(() => {
    const fetchHospitalName = async () => {
      if (!claims?.hospitalId) return;
      try {
        const hospitalDoc = await getDoc(
          doc(db, "hospitales_reportnic", claims.hospitalId)
        );
        if (hospitalDoc.exists()) {
          setHospitalName(hospitalDoc.data().name); // 🔹 usa el campo correcto en Firestore
        } else {
          setHospitalName("Desconocido");
        }
      } catch (error) {
        console.error("Error al obtener el nombre del hospital:", error);
        setHospitalName("Error");
      }
    };

    fetchHospitalName();
  }, [claims, db]);

  // Filtrar alertas recientes (últimos 10 min)
  const filtrarAlertasRecientes = (alertasList) => {
    const ahora = new Date();
    const diezMinutosEnMs = 10 * 60 * 1000;
    return alertasList.filter((alerta) => {
      if (!alerta.fecha) return false;
      const tiempoTranscurrido = ahora - alerta.fecha;
      return tiempoTranscurrido <= diezMinutosEnMs;
    });
  };

  // Obtener alertas de Firestore
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
  }, [claims, db]);

  // Actualizar alertas cada minuto
  useEffect(() => {
    const intervalo = setInterval(() => {
      setAlertas((alertasActuales) => filtrarAlertasRecientes(alertasActuales));
    }, 60000);
    return () => clearInterval(intervalo);
  }, []);

  // Calcular tiempo restante para mostrar en alertas
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

  const handleLogout = async () => {
    await auth.signOut();
    localStorage.removeItem("token");
    navigate("/"); // redirige al login
  };

  if (claims === undefined || loading) return <p>Cargando alertas...</p>;
  if (!claims) return <p>No tienes hospital asignado</p>;

  return (
    <div>
      {/* Navbar con nombre del hospital */}
      <Navbar
        claims={claims}
        handleLogout={handleLogout}
        navigate={navigate}
        hospitalName={hospitalName}
      />

      <h1>Bienvenido al panel del hospital</h1>
      <p>Hospital: {hospitalName || "Cargando..."}</p>
      <p>Rol: {claims.role}</p>

      {/* Botones */}
      <button onClick={handleLogout} style={{ marginBottom: "20px" }}>
        Cerrar sesión
      </button>

      {claims.role === "hospital_manager" && (
        <button
          onClick={() => navigate("/crear-monitor")}
          style={{ marginBottom: "20px", marginLeft: "10px" }}
        >
          Crear Usuario Monitor
        </button>
      )}

      {/* Alertas */}
      <h2>Alertas recientes (últimos 10 minutos)</h2>
      {alertas.length === 0 ? (
        <p>No hay alertas nuevas</p>
      ) : (
        <ul>
          {alertas.map((alerta) => {
            let alertClass = "alert-high";
            if (alerta.nivel === "medio") alertClass = "alert-medium";
            if (alerta.nivel === "bajo") alertClass = "alert-low";

            return (
              <li key={alerta.id} className={alertClass}>
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
                <p className="alert-time">
                  {calcularTiempoRestante(alerta.fecha)}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default Dashboard;
