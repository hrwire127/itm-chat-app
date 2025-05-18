"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    router.push("/login");
  };

  return (
    <nav className="w-full border-b border-gray-200 px-6 py-4 flex justify-between items-center">
      <Link href="/" className="text-xl font-semibold">
        Itm-chat-app
      </Link>
      <div className="flex space-x-4 text-sm font-medium items-center">
        <Link href="/" className="hover:underline">Home</Link>
        {isLoggedIn && <Link href="/main" className="hover:underline">Main</Link>}

        {!isLoggedIn && (
          <Link href="/login" className="hover:underline">
            Login
          </Link>
        )}

        {isLoggedIn && (
          <button
            onClick={handleLogout}
            className="hover:underline cursor-pointer bg-transparent border-none p-0 text-sm font-medium text-blue-600"
            type="button"
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}
