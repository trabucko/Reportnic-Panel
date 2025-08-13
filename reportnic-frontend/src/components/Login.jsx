import { useState } from "react";
import { auth } from "../../src/firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Forzar refresh token para obtener claims
      const tokenResult = await userCredential.user.getIdTokenResult(true);

      // En lugar de cerrar sesión aquí, solo pasamos las claims
      onLogin(tokenResult.claims);
    } catch (err) {
      if (
        err.code === "auth/wrong-password" ||
        err.code === "auth/user-not-found"
      ) {
        setError("Correo o contraseña incorrecta , vuelva a intentarlo");
      } else if (err.code === "auth/invalid-email") {
        setError("Correo inválido, vuelva a intentarlo");
      } else if (err.code === "auth/invalid-credential") {
        setError("Correo o contraseña incorrecta, vuelva a intentarlo");
      } else {
        setError(err.message);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Correo"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit">Entrar</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </form>
  );
}
