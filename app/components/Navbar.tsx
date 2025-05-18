// components/Navbar.tsx

import Link from "next/link";

export default function Navbar() {
    return (
        <nav className="w-full border-b border-gray-200 px-6 py-4 flex justify-between items-center">
            <Link href="/" className="text-xl font-semibold">
                Itm-chat-app
            </Link>
            <div className="flex space-x-4 text-sm font-medium">
                <Link href="/" className="hover:underline">Home</Link>
                <Link href="/main" className="hover:underline">Main</Link>
                <Link href="/login" className="hover:underline">Login</Link>
            </div>
        </nav>
    );
}
