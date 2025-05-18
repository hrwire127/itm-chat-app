"use client";

import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import io from "socket.io-client";

// Tipul mesajului — poate fi string sau un obiect, în funcție de aplicația ta
type Message = string;
type UserId = string;

const socket = io("http://localhost:3001");

export default function Main() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [activeUsers, setActiveUsers] = useState<UserId[]>([]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputValue.trim()) {
      socket.emit("message", inputValue);
      setInputValue("");
    }
  };

  useEffect(() => {
    socket.on("message", (message: Message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    socket.on("activeUsers", (users: UserId[]) => {
      setActiveUsers(users);
    });

    return () => {
      socket.off("message");
      socket.off("activeUsers");
    };
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1 ><b>Chat</b></h1>

      <h4>Active Users:</h4>
      <ul>
        {activeUsers.map((userId) => (
          <li key={userId}>{userId} is online</li>
        ))}
      </ul>

      <div
        style={{
          border: "1px solid #ccc",
          padding: "10px",
          marginBottom: "10px",
          height: "200px",
          overflowY: "auto",
        }}
      >
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
        <button
          type="submit"
          style={{ padding: "8px 12px", marginLeft: "10px" }}
        >
          Send
        </button>
      </form>
    </div>
  );
}