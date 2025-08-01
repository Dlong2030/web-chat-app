import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useSocket } from '../../hooks/useSocket'
import Sidebar from './Sidebar'
import { SidebarProps } from '../../types/sidebar.types'
import { mockData } from './mockData';

const ChatApp = () => {
  // const { connected, error, reconnecting } = useSelector((state: any) => state.socket);
  // const { socketService } = useSocket();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    console.log('Search query:', query);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        currentUser={mockData.currentUser}
        conversations={mockData.chatItems}
        onConversationSelect={setSelectedConversationId}
        selectedConversationId={selectedConversationId ?? undefined}
        onSearch={handleSearch}
        searchQuery={searchQuery}
        isLoading={false}
      />

      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">Chat Area</h1>

        {selectedConversationId ? (
          <div>
            <h2 className="text-xl font-semibold mb-4">
              Selected Conversation: {selectedConversationId}
            </h2>
            <div className="bg-white p-6 rounded-lg shadow">
              <p>This is where the chat messages would appear</p>
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-500">
              Select a conversation from the sidebar to start chatting
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatApp
