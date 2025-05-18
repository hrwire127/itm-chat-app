"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { verifyLogin } from "./verifyLogin";
import ConversationList from "./components/ConversationList";
import io, { Socket } from "socket.io-client";
import Loader from "./components/Loader";

type Conversation = {
  id: string;
  title: string;
  lastMessage: string;
};

const mockConversations: Conversation[] = [
  { id: "1", title: "Chat cu Andrei", lastMessage: "Hai la lucru champ)!" },
  { id: "2", title: "Grupul de muncă", lastMessage: "Ședința începe la 10" },
  { id: "3", title: "Prietenii", lastMessage: "Hai la film?" },
];

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [searchTerm, setSearchTerm] = useState("");

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



  const filteredConversations = conversations.filter((conv) =>
    conv.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  if (loading) return <Loader />;
  if (!isLoggedIn) return null;

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8 font-sans">
      <h1 className="text-3xl font-bold mb-6">Conversații</h1>

      <SearchBar value={searchTerm} onChange={handleSearchChange} />

      <div className="flex flex-wrap gap-4 mt-6">
        <NewConversation />
        <CreateGroup />
        <AddFriendButton onClick={() => router.push("/friends")} />
      </div>

      <ConversationList conversations={filteredConversations} />

    </div>
  );
}

// ---------- Subcomponente ----------

function SearchBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <input
      type="text"
      placeholder="Caută conversații..."
      value={value}
      onChange={onChange}
      className="w-full p-2 border border-gray-300 rounded"
    />
  );
}

// În Home component, înlocuiește funcția din <NewConversation />

function NewConversation() {
  const router = useRouter();
  const [friendUsername, setFriendUsername] = useState("");

  const handleCreate = async () => {
    if (!friendUsername.trim()) {
      alert("Introdu username-ul prietenului");
      return;
    }

    try {
      const token = localStorage.getItem("token");


      const res = await fetch("http://localhost:3001/chat/conversation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ friendUsername }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(`Eroare: ${data.msg || res.statusText}`);
        return;
      }

      const data = await res.json();

      // console.log(data)

      window.location.href = `/chat/${data.conversation._id}`;
    } catch (err) {
      alert("Eroare la creare conversație");
      console.error(err);
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Username prieten"
        value={friendUsername}
        onChange={(e) => setFriendUsername(e.target.value)}
        className="p-1 border rounded mr-2"
      />
      <button
        onClick={handleCreate}
        className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        + Creează conversație nouă
      </button>
    </div>
  );
}


function CreateGroup() {
  const handleClick = () => {
    alert("Funcționalitate creare grup");
  };
  return (
    <button
      onClick={handleClick}
      className="cursor-pointer px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
    >
      + Creează grup
    </button>
  );
}
function AddFriendButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="cursor-pointer px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
    >
      + Adaugă prieten
    </button>
  );
}

