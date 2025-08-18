import React, { useState, useEffect } from "react";
import "./Navbar.css";
import logo from "../../assets/img/logo_blanco.png"; // logo de reportnic
import Hamburguer from "../menu_hamburguesa/menu.jsx";
import { FaHistory, FaUserCog, FaSignOutAlt, FaHospital } from "react-icons/fa";
import { GiPc } from "react-icons/gi"; // NUEVO icono Panel
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "../../firebaseConfig";

const db = getFirestore(app);

const Navbar = ({ claims, navigate, handleLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hospitalName, setHospitalName] = useState("Nombre del hospital");
  const toggleMenu = () => setIsOpen(!isOpen);

  const isManager = claims?.role === "hospital_manager";
  const firstName = claims?.firstName || "Nombre usuario";
  const lastName = claims?.lastName || "Apellido usuario";
  const role = claims?.role || "Rol";

  useEffect(() => {
    if (claims?.hospitalId) {
      const fetchHospital = async () => {
        try {
          const docRef = doc(db, "hospitales_reportnic", claims.hospitalId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setHospitalName(docSnap.data().name);
          }
        } catch (err) {
          console.error("Error obteniendo hospital:", err);
        }
      };
      fetchHospital();
    }
  }, [claims?.hospitalId]);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <img src={logo} alt="Logo" className="logo" />
        </div>

        <div className="navbar-links">
          <a className="navbar-btn" onClick={() => navigate("/panel")}>
            Panel
          </a>
          <a className="navbar-btn" onClick={() => navigate("/historial")}>
            Historial
          </a>
          {isManager && (
            <a
              className="navbar-btn"
              onClick={() => navigate("/administracion")}
            >
              Administración
            </a>
          )}
        </div>

        <Hamburguer onClick={toggleMenu} isOpen={isOpen} />
      </div>

      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        {/* Encabezado con logo y texto */}
        <div className="sidebar_head"></div>
        <div className="sidebar-header">
          <img src={logo} alt="Reportnic Logo" className="sidebar-logo" />
          <div className="sidebar-title">
            <span className="report">
              ReportNic<span className="panel"> Panel</span>
            </span>
          </div>
        </div>

        {/* Perfil */}
        <div className="sidebar-profile">
          <div className="user-info-item">
            <div className="info-icon">
              <FaUserCog className="sidebar-icon" />
            </div>
            <div className="info-content">
              <div className="info-label">Usuario</div>
              <div className="info-value">
                {firstName} {lastName}
              </div>
            </div>
          </div>

          <div className="user-info-item hospital">
            <div className="info-icon">
              <FaHospital className="sidebar-icon" />
            </div>
            <div className="info-content">
              <div className="info-label">Hospital</div>
              <div className="info-value">{hospitalName}</div>
            </div>
          </div>

          <div className="user-info-item role">
            <div className="info-icon">
              <FaUserCog className="sidebar-icon" />
            </div>
            <div className="info-content">
              <div className="info-label">Rol</div>
              <div className="info-value">{role}</div>
            </div>
          </div>
        </div>

        {/* Botones navegación */}
        <button className="sidebar-btn" onClick={() => navigate("/panel")}>
          <GiPc className="sidebar-icon" /> Panel
        </button>
        <button className="sidebar-btn" onClick={() => navigate("/historial")}>
          <FaHistory className="sidebar-icon" /> Historial
        </button>
        {isManager && (
          <button
            className="sidebar-btn"
            onClick={() => navigate("/administracion")}
          >
            <FaUserCog className="sidebar-icon" /> Administración
          </button>
        )}
        <button className="sidebar-btn logout-btn" onClick={handleLogout}>
          <FaSignOutAlt className="sidebar-icon" /> Cerrar sesión
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
