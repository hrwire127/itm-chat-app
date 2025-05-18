"use client";

import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { verifyLogin } from "../verifyLogin";
import Loader from "../components/Loader";
import io, { Socket } from "socket.io-client";

type Message = string;
type UserId = string;

export default function Main() {
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [activeUsers, setActiveUsers] = useState<UserId[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  const router = useRouter();

  // Verifică login-ul
  useEffect(() => {
    verifyLogin().then((valid) => {
      setIsLoggedIn(valid);
      setLoading(false);

      if (!valid) {
        router.push("/login");
      }
    });
  }, [router]);

  // Conectează socket.io doar după autentificare
  useEffect(() => {
    if (!isLoggedIn) return;

    const token = localStorage.getItem("token");
    const socketIo = io("http://localhost:3001", {
      auth: { token },
    });

    setSocket(socketIo);

    socketIo.on("message", (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    socketIo.on("activeUsers", (users: UserId[]) => {
      setActiveUsers(users);
    });

    return () => {
      socketIo.disconnect();
    };
  }, [isLoggedIn]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputValue.trim() && socket) {
      socket.emit("message", inputValue);
      setInputValue("");
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1><b>Chat</b></h1>
      <h4>Active Users:</h4>
      <ul>
        {activeUsers.map((userId) => (
          <li key={userId}>{userId} is online</li>
        ))}
      </ul>

      <div style={{
        border: "1px solid #ccc",
        padding: "10px",
        marginBottom: "10px",
        height: "200px",
        overflowY: "auto",
      }}>
        {messages.map((msg, index) => (
          <div key={index} style={{ marginBottom: "5px" }}>
            {msg}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Type your message..."
          value={inputValue}
          onChange={handleChange}
          required
          style={{ padding: "8px", width: "70%" }}
        />
        <button type="submit" style={{ padding: "8px 12px", marginLeft: "10px" }}>
          Send
        </button>
      </form>
    </div>
  );
}
