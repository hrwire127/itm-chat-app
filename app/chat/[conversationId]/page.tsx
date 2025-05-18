"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import Loader from "../../components/Loader";

type MessageType = {
    sender: string;
    text: string;
    createdAt: string;
};

type ConversationType = {
    _id: string;
    participants: { _id: string; username: string }[];
    messages: MessageType[];
};

export default function ChatPage() {
    const router = useRouter();
    const { conversationId } = useParams();

    const [loading, setLoading] = useState(true);
    const [conversation, setConversation] = useState<ConversationType | null>(null);
    const [friend, setFriend] = useState<Object | null>(null);
    const [inputValue, setInputValue] = useState("");
    const [hydrated, setHydrated] = useState(false);
    const [username, setUsername] = useState<string | null>(null);

    useEffect(() => {
        setHydrated(true);
    }, []);

    useEffect(() => {
        if (!hydrated) return;

        const token = localStorage.getItem("token");
        const name = localStorage.getItem("username");
        setUsername(name);

        if (!token) {
            router.push("/login");
            return;
        }

        const fetchConversation = async () => {
            try {
                const res = await fetch(`http://localhost:3001/chat/conversation`, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ conversationId }),
                });

                console.log(res);

                if (!res.ok) {
                    alert("Conversație inexistentă");
                    router.push("/");
                    return;
                }

                const data = await res.json();
                console.log(data);
                setConversation(data.conversation);
                setFriend(data.friend)
            } catch (e) {
                alert("Eroare la încărcare conversație");
            } finally {
                setLoading(false);
            }
        };

        fetchConversation();
    }, [conversationId, hydrated, router]);

    const sendMessage = async (e: FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || !conversation) return;

        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
            return;
        }

        try {
            const res = await fetch("http://localhost:3001/chat/message", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ conversationId, text: inputValue }),
            });

            if (!res.ok) {
                alert("Eroare la trimiterea mesajului");
                return;
            }

            const updatedConv = await res.json();
            setConversation(updatedConv);
            setInputValue("");
        } catch {
            alert("Eroare");
        }
    };

    if (!hydrated) return null;

    if (loading) return <Loader />;

    if (!conversation) return <div>Conversație inexistentă.</div>;

    // Calculez friend dinamic pe baza conversation și username
    // const friend = conversation.participants.find((p) => p.username !== username) ?? null;

    return (
        <div className="p-5 max-w-3xl mx-auto font-sans">
            <h1 className="text-2xl font-bold mb-4">Chat cu {friend?.username}</h1>

            <div className="border p-4 mb-4 h-64 overflow-y-auto bg-white rounded shadow-sm">
                {conversation.messages.length === 0 && <p>Nu există mesaje încă.</p>}
                {conversation.messages.map((msg, idx) => (
                    <div key={idx} className={`mb-2 ${msg.sender === username ? "text-right" : "text-left"}`}>
                        <span
                            className={`inline-block px-3 py-1 rounded ${msg.sender === username ? "bg-blue-500 text-white" : "bg-gray-300"
                                }`}
                        >
                            {msg.text}
                        </span>
                    </div>
                ))}
            </div>

            <form onSubmit={sendMessage} className="flex gap-2">
                <input
                    type="text"
                    placeholder="Scrie un mesaj..."
                    value={inputValue}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
                    className="flex-grow p-2 border rounded"
                    required
                />
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                    Trimite
                </button>
            </form>
        </div>
    );
}
