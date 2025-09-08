import React from 'react';
import { ChatItemProps } from '../../types/sidebar.types';

const ChatItem: React.FC<ChatItemProps> = ({
    item,
    isSelected,
    onClick,
    currentUserId
}) => {
    const { conversation, otherParticipant, unreadCount, lastActivity, isOnline, isTyping } = item;

    console.log('item', otherParticipant);
    

    // Get display name and avatar
    const displayName = conversation.type === 'group'
        ? conversation.name || 'Nhóm chat'
        : otherParticipant?.displayName || 'Người dùng';

    const avatarUrl = conversation.type === 'group'
        ? null
        : otherParticipant?.avatarUrl;

    // Format time
    const formatTime = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Vừa xong';
        if (minutes < 60) return `${minutes}p`;
        if (hours < 24) return `${hours}h`;
        if (days < 7) return `${days}d`;
        return date.toLocaleDateString('vi-VN');
    };

    // Get last message preview
    const getMessagePreview = () => {
        if (isTyping) return 'Đang nhập...';
        if (!conversation.lastMessage) return 'Không có tin nhắn';

        const { content, type, senderId } = conversation.lastMessage;
        const isCurrentUser = senderId === currentUserId;
        const prefix = isCurrentUser ? 'Bạn: ' : '';

        switch (type) {
            case 'image':
                return `${prefix}Đã gửi ảnh`;
            case 'voice':
                return `${prefix}Tin nhắn thoại`;
            case 'video':
                return `${prefix}Đã gửi video`;
            case 'file':
                return `${prefix}Đã gửi file`;
            case 'sticker':
                return `${prefix}Đã gửi sticker`;
            default:
                return `${prefix}${content?.slice(0, 50)}${content && content.length > 50 ? '...' : ''}`;
        }
    };

    return (
        <div
            onClick={onClick}
            className={`
        relative p-4 rounded-xl cursor-pointer transition-all duration-200 group
        ${isSelected
                    ? 'bg-gradient-brand shadow-brand text-white'
                    : 'hover:bg-white/60 hover:shadow-soft'
                }
      `}
        >
            {/* Avatar Section */}
            <div className="flex items-start gap-3">
                <div className="relative flex-shrink-0">
                    {avatarUrl ? (
                        <img
                            src={avatarUrl}
                            alt={displayName}
                            className="w-12 h-12 rounded-full object-cover shadow-soft"
                        />
                    ) : (
                        <div className={`
              w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold
              ${conversation.type === 'group'
                                ? 'bg-gradient-coral'
                                : 'bg-gradient-button'
                            }
            `}>
                            {conversation.type === 'group' ? (
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zM4 18v-4c0-2.21 1.79-4 4-4s4 1.79 4 4v4H4zM13 12c0-2.21-1.79-4-4-4S5 9.79 5 12v6h8v-6z" />
                                </svg>
                            ) : (
                                displayName.charAt(0).toUpperCase()
                            )}
                        </div>
                    )}

                    {/* Online Status */}
                    {conversation.type === 'direct' && isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-soft"></div>
                    )}
                </div>

                {/* Content Section */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                        <h3 className={`font-semibold truncate ${isSelected ? 'text-white' : 'text-warm-900'}`}>
                            {displayName}
                        </h3>
                        <span className={`text-xs flex-shrink-0 ml-2 ${isSelected ? 'text-white/80' : 'text-warm-500'}`}>
                            {formatTime(lastActivity)}
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <p className={`
              text-sm truncate flex-1
              ${isSelected ? 'text-white/90' : 'text-warm-600'}
              ${isTyping ? 'italic text-brand-500' : ''}
            `}>
                            {getMessagePreview()}
                        </p>

                        {/* Unread Badge */}
                        {unreadCount > 0 && (
                            <div className="flex-shrink-0 ml-2">
                                <span className={`
                  inline-flex items-center justify-center px-2 py-1 text-xs font-bold rounded-full
                  ${isSelected
                                        ? 'bg-white text-brand-500'
                                        : 'bg-gradient-button text-white shadow-brand'
                                    }
                  min-w-[20px] h-5
                `}>
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Typing Indicator */}
                    {isTyping && (
                        <div className="flex items-center gap-1 mt-1">
                            <div className="flex gap-1">
                                <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Selection Indicator */}
            {isSelected && (
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"></div>
            )}
        </div>
    );
};

export default ChatItem;