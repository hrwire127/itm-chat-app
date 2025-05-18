"use client";

import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Loader from "../../components/Loader";
import io, { Socket } from "socket.io-client";

type Message = {
    sender: string;
    text: string;
};

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
        // Verifică dacă utilizatorul este logat
        const token = localStorage.getItem("token");
        const name = localStorage.getItem("username");
        if (!token || !name) {
            router.push("/login");
            return;
        }
        setUsername(name);
        setIsLoggedIn(true);
        setLoading(false);
    }, [router]);

    useEffect(() => {
        if (!isLoggedIn || !username) return;

        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");

        // Conectare la socket cu autentificare
        const socketIo = io("http://localhost:3001", {
            auth: { token, username, role },
        });

        setSocket(socketIo);

        // Primește mesaje noi de la server
        socketIo.on("message", (message: Message) => {
            setMessages((prev) => [...prev, message]);
        });

        // Primește lista utilizatorilor activi
        socketIo.on("activeUsers", (users: ActiveUser[]) => {
            setActiveUsers(users);
        });

        // Cleanup la demontare componentă
        return () => {
            socketIo.disconnect();
        };
    }, [isLoggedIn, username]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

   const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputValue.trim() && socket && username) {
        const newMessage = { sender: username, text: inputValue };
        socket.emit("message", newMessage);
        setMessages((prev) => [...prev, newMessage]); // adaugă local
        setInputValue("");
    }
};


    if (loading) return <Loader />;
    if (!isLoggedIn) return null;

    return (
        <div className="p-5 font-sans max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-2">Chat</h1>
            {username && (
                <p className="mb-4">
                    You are logged in as <b>{username}</b>
                </p>
            )}

            <h4 className="font-semibold">Active Users:</h4>
            <ul className="mb-4 list-disc list-inside">
                {activeUsers
                    .filter((user) => user.username !== "none")
                    .map((user, index) => (
                        <li key={index}>{user.username} is online</li>
                    ))}
            </ul>

            <div className="border border-gray-300 p-3 mb-4 h-64 overflow-y-auto rounded bg-white shadow-sm">
                {messages.length === 0 && <p>No messages yet.</p>}
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`mb-2 ${msg.sender === username ? "text-right" : "text-left"
                            }`}
                    >
                        <span
                            className={`inline-block px-3 py-1 rounded ${msg.sender === username
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-300"
                                }`}
                        >
                            <b>{msg.sender}:</b> {msg.text}
                        </span>
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
