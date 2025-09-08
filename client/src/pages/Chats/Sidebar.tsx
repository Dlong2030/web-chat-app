import React, { useState, useMemo } from 'react';
import { SidebarProps } from '../../types/sidebar.types';
import Logo from '../../components/chat/Logo';
import SearchBar from '../../components/ui/SearchBar';
import ChatList from '../../components/chat/ChatList';

const Sidebar: React.FC<SidebarProps> = ({
    currentUser,
    conversations,
    onConversationSelect,
    selectedConversationId,
    onSearch,
    searchQuery = '',
    isLoading = false
}) => {
    const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

    // Handle search with debouncing
    const handleSearch = (query: string) => {
        setLocalSearchQuery(query);
        onSearch(query);
    };

    // Filter conversations based on search query
    const filteredConversations = useMemo(() => {
        if (!localSearchQuery.trim()) return conversations;

        return conversations.filter((item) => {
            const searchTerm = localSearchQuery.toLowerCase();

            // Search in conversation name (for groups)
            if (item.conversation.name?.toLowerCase().includes(searchTerm)) {
                return true;
            }

            // Search in participant name (for direct chats)
            if (item.otherParticipant?.displayName?.toLowerCase().includes(searchTerm)) {
                return true;
            }

            // Search in last message content
            if (item.conversation.lastMessage?.content?.toLowerCase().includes(searchTerm)) {
                return true;
            }

            return false;
        });
    }, [conversations, localSearchQuery]);

    // Sort conversations by last activity
    const sortedConversations = useMemo(() => {
        return [...filteredConversations].sort((a, b) => {
            return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
        });
    }, [filteredConversations]);

    console.log('Filtered and sorted conversations:', sortedConversations);

    return (
        <div className="h-full w-80 bg-gradient-soft border-r border-warm-200 flex flex-col backdrop-blur-sm">
            {/* Header Section */}
            <div className="p-6 border-b border-warm-200/50">
                <Logo size="md" showText={true} className="mb-6" />
                <SearchBar
                    value={localSearchQuery}
                    onChange={handleSearch}
                    placeholder="Search conversations..."
                />
            </div>

            {/* User Status */}
            <div className="px-6 py-4 border-b border-warm-200/30">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        {currentUser.avatarUrl ? (
                            <img
                                src={currentUser.avatarUrl}
                                alt={currentUser.displayName}
                                className="w-10 h-10 rounded-full object-cover shadow-soft"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-button flex items-center justify-center text-white font-semibold">
                                {currentUser.displayName.charAt(0).toUpperCase()}
                            </div>
                        )}

                        {/* Status Indicator */}
                        <div className={`
              absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-soft
              ${currentUser.status === 'online' ? 'bg-green-400' :
                                currentUser.status === 'away' ? 'bg-yellow-400' :
                                    currentUser.status === 'busy' ? 'bg-red-400' : 'bg-gray-400'}
            `}></div>
                    </div>

                    <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-warm-900 truncate">
                            {currentUser.displayName}
                        </h4>
                        <p className="text-sm text-warm-500 capitalize">
                            {currentUser.status}
                        </p>
                    </div>

                    {/* Settings Button */}
                    <button className="p-2 rounded-lg hover:bg-white/50 transition-colors duration-200 text-warm-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Search Results Header */}
            {localSearchQuery && (
                <div className="px-6 py-3 border-b border-warm-200/30 bg-white/30">
                    <p className="text-sm text-warm-600">
                        {sortedConversations.length} kết quả cho "{localSearchQuery}"
                    </p>
                </div>
            )}

            {/* Loading State */}
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="flex items-center gap-3">
                        <div className="w-6 h-6 border-2 border-brand-400 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-warm-600">Đang tải...</span>
                    </div>
                </div>
            ) : (
                /* Chat List */
                <ChatList
                    items={sortedConversations}
                    selectedId={selectedConversationId}
                    onItemClick={onConversationSelect}
                    currentUserId={currentUser._id}
                />
            )}

            {/* New Chat Button */}
            <div className="p-4 border-t border-warm-200/50">
                <button className="
          w-full py-3 px-4 
          bg-gradient-button 
          hover:bg-gradient-button-hover 
          text-white font-semibold rounded-xl 
          shadow-brand 
          transition-all duration-200 
          hover:shadow-brand-lg 
          hover:scale-105
          flex items-center justify-center gap-2
        ">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Cuộc trò chuyện mới
                </button>
            </div>
        </div>
    );
};

export default Sidebar;