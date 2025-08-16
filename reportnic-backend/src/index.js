import express from "express"; // Framework para crear un servidor web y manejar rutas HTTP (peticiones del Frontend al Backend)
import cors from "cors"; // Middleware para permitir solicitudes desde otros orígenes (CORS)
import dotenv from "dotenv"; //para cargar variables de entorno (para mantener una seguridad en datos valiosos)
import { createMonitor } from "./controllers/createMonitorUserController.js";
import MonitoresRouter from "./routes/monitorUserRoutes.js"; // 👈 Importas tu nuevo router

//se cargan las variables de entorno del archivo .env
dotenv.config();

// Inicializar la aplicación de Express (servidor)
const app = express();

//Middlewares
// Habilitar CORS para permitir peticiones desde otros dominios/puertos
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true, // si envías cookies o headers
  })
);
// Habilitar el parseo de datos JSON en el cuerpo de las peticiones (req.body)

app.use(express.json()); //hace que estas peticiones , puedan ser facilmente procesadas en formato JSON

app.use("/monitores", MonitoresRouter);

//Ruta de Prueba
app.get("/", (req, res) => {
  res.send("Bienvenido a ReportNic Backend");
});

//puerto
// Si existe process.env.PORT (definido en .env), usarlo, si no usar 3000
const PORT = process.env.PORT || 3000;

// --- Iniciar servidor ---
// Escuchar conexiones entrantes en el puerto definido
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
