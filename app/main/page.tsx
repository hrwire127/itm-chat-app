"use client";

import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { verifyLogin } from "../verifyLogin";
import Loader from "../components/Loader";
import io, { Socket } from "socket.io-client";

type Message = string;
type ActiveUser = {
  username: string;
  token: string;
  role: string;
};

export default function Main() {
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    verifyLogin().then((valid) => {
      setIsLoggedIn(valid);
      setLoading(false);

      if (!valid) {
        router.push("/login");
      } else {
        const name = localStorage.getItem("username");
        setUsername(name);
      }
    });
  }, [router]);

  useEffect(() => {
    if (!isLoggedIn) return;

    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");
    const role = localStorage.getItem("role");

    const socketIo = io("http://localhost:3001", {
      auth: { token, username, role },
    });

    setSocket(socketIo);

    socketIo.on("message", (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    socketIo.on("activeUsers", (users: ActiveUser[]) => {
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

  if (loading) return <Loader />;
  if (!isLoggedIn) return null;

  return (
    <div className="p-5 font-sans">
      <h1 className="text-2xl font-bold mb-2">Chat</h1>
      {username && (
        <p className="mb-4">
          You are logged in as <b>{username}</b>
        </p>
      )}

      <h4 className="font-semibold">Active Users:</h4>
      <ul className="mb-4 list-disc list-inside">
        {activeUsers.map(
          (user, index) =>
            user.username !== "none" && <li key={index}>{user.username} is online</li>
        )}
      </ul>

      <div className="border border-gray-300 p-3 mb-4 h-52 overflow-y-auto rounded bg-white shadow-sm">
        {messages.map((msg, index) => (
          <div key={index} className="mb-1">
            {msg}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Type your message..."
          value={inputValue}
          onChange={handleChange}
          required
          className="p-2 w-full border border-gray-300 rounded"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Send
        </button>
      </form>
    </div>
  );
}
