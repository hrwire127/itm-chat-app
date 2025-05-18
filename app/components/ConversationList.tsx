import React from "react";

type Conversation = {
  id: string;
  title: string;
  lastMessage: string;
};

export default function ConversationList({ conversations }: { conversations: Conversation[] }) {
    if (conversations.length === 0) {
        return <p className="text-gray-500">Nu există conversații.</p>;
    }

    return (
        <ul className="border border-gray-300 rounded max-h-96 overflow-y-auto">
            {conversations.map((conv) => (
                <li
                    key={conv.id}
                    className="p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-100"
                >
                    <h3 className="font-semibold">{conv.title}</h3>
                    <p className="text-gray-600 text-sm">{conv.lastMessage}</p>
                </li>
            ))}
        </ul>
    );
}