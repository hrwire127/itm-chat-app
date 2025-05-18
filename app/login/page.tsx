"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import "./Login.css";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleToggle = () => {
    setIsLogin(!isLogin);
    // Clear inputs on toggle
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !password || (!isLogin && password !== confirmPassword)) {
      alert("Please fill all fields correctly");
      return;
    }
    if (isLogin) {
      alert(`Logging in with ${email}`);
    } else {
      alert(`Signing up with ${email}`);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>{isLogin ? "Login" : "Sign Up"}</h2>
        <form onSubmit={handleSubmit} className="login-form">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setEmail(e.target.value)
            }
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setPassword(e.target.value)
            }
            required
          />

          {!isLogin && (
            <>
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setConfirmPassword(e.target.value)
                }
                required
              />
            </>
          )}

          <button type="submit" className="btn-submit">
            {isLogin ? "Login" : "Sign Up"}
          </button>
        </form>

        <p className="toggle-text">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button onClick={handleToggle} className="toggle-btn" type="button">
            {isLogin ? "Sign Up" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
}
