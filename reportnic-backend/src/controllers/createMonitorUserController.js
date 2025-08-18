export const createMonitor = async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    const authUser = req.user;

    // Validar que quien crea sea admin
    if (authUser.role !== "hospital_manager") {
      return res
        .status(403)
        .json({ error: "No autorizado. Debes ser administrador." });
    }

    const hospitalId = authUser.hospitalId;

    // Crear usuario monitor
    const userRecord = await admin.auth().createUser({ email, password });

    // Asignar claims personalizados
    await admin.auth().setCustomUserClaims(userRecord.uid, {
      role: "monitor",
      hospitalId,
    });

    // Crear nombre completo
    const fullName = lastName ? `${firstName} ${lastName}` : firstName || "";

    // Guardar en Firestore
    await db.collection("usuarios_hospitales").doc(userRecord.uid).set({
      email,
      role: "monitor",
      hospitalId,
      fullName, // <-- guardamos el nombre completo
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.status(201).json({
      message: "Usuario monitor creado con éxito",
      email,
      hospitalId,
      fullName,
    });
  } catch (error) {
    console.error("Error creando monitor:", error);
    return res.status(500).json({ error: error.message });
  }
};
