import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useSocket } from '../../hooks/useSocket'
import Sidebar from './Sidebar'
import { mockData } from './mockData';
import { useAppSelector } from '../../store'
import getToken from '../../utils/getToken'
import { useConversations } from '../../hooks/useConversations'
import { selectUser } from '../../store/slices/authSlices'

const ChatApp = () => {
  const { connected, error, reconnecting } = useSelector((state: any) => state.socket);
  const { socketService } = useSocket();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const conversations = useConversations(getToken());
  const currentUser = useAppSelector(selectUser);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    console.log('Search query:', query);
  };

  // console.log('Token:', getToken());
  console.log('Conversations from Redux:', conversations);
  console.log('Current User:', currentUser);

  if (!currentUser) {
    return (
      <div className="flex h-screen bg-gray-100 items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
          <p className="text-gray-600">Đang tải thông tin người dùng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        currentUser={currentUser}
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
