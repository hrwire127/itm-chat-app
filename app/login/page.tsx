"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import "./Login.css";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const handleToggle = () => {
    setIsLogin(!isLogin);
    setEmail("");
    setUsername("");
    setPassword("");
    setConfirmPassword("");
    setError(null);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!email || !password || (!isLogin && (!username || password !== confirmPassword))) {
      setError("Verifică câmpurile completate!");
      return;
    }

    const endpoint = isLogin ? "login" : "register";
    const payload = isLogin
      ? { email, password }
      : { username, email, password };


    try {
      const res = await fetch(`http://localhost:3001/api/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Eroare la autentificare");

      localStorage.setItem("token", data.token); // JWT simplu
      router.push("/"); // Redirect către homepage
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>{isLogin ? "Login" : "Sign Up"}</h2>

        {error && <p style={{ color: "red", marginBottom: "10px" }}>{error}</p>}

        <form onSubmit={handleSubmit} className="login-form">
          {!isLogin && (
            <>
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </>
          )}

          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {!isLogin && (
            <>
              <label htmlFor="confirm">Confirm Password</label>
              <input
                id="confirm"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </>
          )}

          <button type="submit" className="btn-submit">
            {isLogin ? "Login" : "Sign Up"}
          </button>
        </form>

        <p className="toggle-text">
          {isLogin ? "Nu ai cont?" : "Ai deja cont?"}{" "}
          <button className="toggle-btn" onClick={handleToggle}>
            {isLogin ? "Înregistrează-te" : "Autentifică-te"}
          </button>
        </p>
      </div>
    </div>
  );
}
