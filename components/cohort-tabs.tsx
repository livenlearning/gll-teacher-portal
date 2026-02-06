"use client";

import { useState, type ReactNode } from "react";

type CohortTabsProps = {
  weeklyContent: ReactNode;
  messages: ReactNode;
};

export default function CohortTabs({ weeklyContent, messages }: CohortTabsProps) {
  const [activeTab, setActiveTab] = useState<"content" | "messages">("content");

  return (
    <div>
      {/* Tab Headers */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-4">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("content")}
            className={`flex-1 px-5 py-3 text-sm font-semibold transition-colors ${
              activeTab === "content"
                ? "text-navy-900 border-b-2 border-navy-600 bg-navy-50"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            Weekly Content
          </button>
          <button
            onClick={() => setActiveTab("messages")}
            className={`flex-1 px-5 py-3 text-sm font-semibold transition-colors ${
              activeTab === "messages"
                ? "text-navy-900 border-b-2 border-navy-600 bg-navy-50"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            Messages
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "content" && weeklyContent}
        {activeTab === "messages" && messages}
      </div>
    </div>
  );
}
