"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { verifyLogin } from "../verifyLogin";
import Loader from "../components/Loader";

export default function FriendsPage() {
    const [username, setUsername] = useState("");
    const [touser, setToUser] = useState("");
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    const [hydrated, setHydrated] = useState(false); // pentru a preveni mismatch

    // Așteaptă montarea clientului

    const router = useRouter();

    useEffect(() => {
        verifyLogin().then((valid) => {
            setIsLoggedIn(valid);
            setLoading(false);

            if (!valid) {
                router.push("/login");
            } else {
                const name = localStorage.getItem("username") || "none";
                setUsername(name);
                const token = localStorage.getItem("token") || null;
                setToken(token);
            }
        });
    }, [router]);

    useEffect(() => {
        setHydrated(true);

        fetchRequests();
    }, []);

    // Fetch requests după ce avem userId
    useEffect(() => {
        if (!token) return;

        fetchRequests();
    }, [token]);


    // async function fetchRequests() {
    //     const res = await fetch(`/api/friends/requests?userId=${token}`);
    //     const data = await res.json();
    //     console.log(requests)
    //     setRequests(data);
    //     setLoading(false);
    // }

    // Nu randa nimic până nu știm că suntem pe client
    if (!hydrated) return null;

    async function fetchRequests() {
        if (!token) return;
        setLoading(true);
        const res = await fetch("http://localhost:3001/api/friends/requests", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
                body: JSON.stringify({ username }),

            },
        });
        if (res.ok) {
            const data = await res.json();
            setRequests(data);
        } else {
            setRequests([]);
        }
        setLoading(false);
    }


    async function handleAddFriend(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        const res = await fetch("http://localhost:3001/api/friends/request", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,  // aici trimiți tokenul
            },
            body: JSON.stringify({ toUsername: touser, fromUserName: username }),
        });

        if (res.ok) {
            setToUser("");
            // Re-fetch friend requests pentru actualizare
            fetchRequests();
        } else {
            const error = await res.json();
            alert(error.msg || "Failed to send friend request");
        }

        setLoading(false);
    }


    async function respondToRequest(fromUserId: string, accept: boolean) {
        await fetch("http://localhost:3001/api/friends/respond", {
            method: "POST",
            body: JSON.stringify({
                token,
                fromUserId,
                action: accept ? "accept" : "reject",
            }),
            headers: { "Content-Type": "application/json" },
        });
        setRequests((prev) => prev.filter((req) => req._id !== fromUserId));
    }


    // if (loading) return <Loader />;
    if (!isLoggedIn) return null;

    return (
        <div className="p-6 max-w-xl mx-auto space-y-10">
            {/* Add Friend Section */}
            <div className="bg-white dark:bg-zinc-900 p-4 rounded shadow">
                <h2 className="text-lg font-semibold mb-2">Add a Friend</h2>
                <form onSubmit={handleAddFriend} className="flex gap-2">
                    <input
                        type="text"
                        value={touser}
                        onChange={(e) => setToUser(e.target.value)}
                        placeholder="Friend's username"
                        className="flex-1 p-2 border rounded dark:bg-zinc-800"
                        required
                    />
                    <button
                        type="submit"
                        className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        disabled={loading}
                    >
                        {loading ? "Sending..." : "Add"}
                    </button>
                </form>
            </div>

            {/* Friend Requests Section */}
            <div className="bg-white dark:bg-zinc-900 p-4 rounded shadow">
                <h2 className="text-lg font-semibold mb-4">Friend Requests</h2>
                {loading ? (
                    <p>Loading...</p>
                ) : requests.length === 0 ? (
                    <p className="text-gray-500">No requests.</p>
                ) : (
                    <ul className="space-y-3">
                        {requests.map((req) => (
                            <li
                                key={req._id}
                                className="flex justify-between items-center border-b pb-2"
                            >
                                <span>{req.senderName}</span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => respondToRequest(req._id, true)}
                                        className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                                    >
                                        Accept
                                    </button>
                                    <button
                                        onClick={() => respondToRequest(req._id, false)}
                                        className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                                    >
                                        Reject
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
