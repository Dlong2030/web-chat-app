import React from 'react';
import { ChatListProps } from '../../types/sidebar.types';
import ChatItem from './ChatItem';

const ChatList: React.FC<ChatListProps> = ({
    items,
    selectedId,
    onItemClick,
    currentUserId
}) => {
    if (items.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-soft flex items-center justify-center">
                        <svg className="w-10 h-10 text-warm-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    </div>
                    <p className="text-warm-500 text-sm">Chưa có cuộc trò chuyện nào</p>
                    <p className="text-warm-400 text-xs mt-1">Bắt đầu chat với bạn bè ngay!</p>
                </div>
            </div>
        );
    }

    console.log('items', items.map(item => item));

    return (
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-warm-300 scrollbar-track-transparent">
            <div className="space-y-2 p-2">
                {items.map((item) => (
                    <ChatItem
                        key={item.conversation._id}
                        item={item}
                        isSelected={selectedId === item.conversation._id}
                        onClick={() => onItemClick(item.conversation._id)}
                        currentUserId={currentUserId}
                    />
                ))}
            </div>
        </div>
    );
};

export default ChatList;