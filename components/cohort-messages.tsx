"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type Message = {
  id: string;
  message: string;
  createdAt: string;
  user: {
    name: string;
    schoolName: string | null;
  };
};

type CohortMessagesProps = {
  cohortId: string;
  messages: Message[];
  currentUserId: string;
};

export default function CohortMessages({ cohortId, messages, currentUserId }: CohortMessagesProps) {
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setLoading(true);

    try {
      const response = await fetch("/api/cohort-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cohortId, message: newMessage }),
      });

      if (response.ok) {
        setNewMessage("");
        router.refresh(); // Refresh to show new message
      }
    } catch (error) {
      console.error("Failed to post message:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Message input form */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Write a message to your cohort team..."
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 resize-none"
            disabled={loading}
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || !newMessage.trim()}
              className="bg-navy-600 text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-navy-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Posting..." : "Post Message"}
            </button>
          </div>
        </form>
      </div>

      {/* Messages list */}
      <div className="space-y-3">
        {messages.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
            <p className="text-gray-400 text-sm">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isCurrentUser = msg.user && currentUserId === msg.user.name; // This will be fixed with proper userId comparison
            const messageDate = new Date(msg.createdAt);
            const formattedDate = messageDate.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit"
            });

            return (
              <div
                key={msg.id}
                className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="font-semibold text-navy-900 text-sm">
                      {msg.user.name}
                    </span>
                    {msg.user.schoolName && (
                      <span className="text-gray-500 text-xs ml-2">
                        {msg.user.schoolName}
                      </span>
                    )}
                  </div>
                  <span className="text-gray-400 text-xs">{formattedDate}</span>
                </div>
                <p className="text-gray-700 text-sm whitespace-pre-wrap">{msg.message}</p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
