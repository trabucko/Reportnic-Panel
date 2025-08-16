import admin from "../config/firebase.js";

const db = admin.firestore();

export const createMonitor = async (req, res) => {
  try {
    const { email, password } = req.body; // El frontend manda solo esto
    const authUser = req.user; // El usuario que hace la petición (admin)

    // Validar que quien crea sea admin
    if (authUser.role !== "hospital_manager") {
      return res
        .status(403)
        .json({ error: "No autorizado. Debes ser administrador." });
    }

    const hospitalId = authUser.hospitalId; // Heredamos el hospitalId del admin

    // Crear usuario monitor
    const userRecord = await admin.auth().createUser({ email, password });

    // Asignar claims personalizados
    await admin.auth().setCustomUserClaims(userRecord.uid, {
      role: "monitor",
      hospitalId,
    });

    // Guardar en Firestore
    await db.collection("usuarios_hospitales").doc(userRecord.uid).set({
      email,
      role: "monitor",
      hospitalId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.status(201).json({
      message: "Usuario monitor creado con éxito",
      email,
      hospitalId,
    });
  } catch (error) {
    console.error("Error creando monitor:", error);
    return res.status(500).json({ error: error.message });
  }
};
