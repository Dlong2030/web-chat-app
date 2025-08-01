import { User } from './auth.types';
import { IConversation } from './chat.types';

// Online Status
export type OnlineStatus = 'online' | 'offline' | 'away' | 'busy';

// Chat Item for Sidebar
export interface IChatItem {
    conversation: IConversation;
    otherParticipant?: User; // For direct chats
    unreadCount: number;
    lastActivity: Date;
    isOnline?: boolean;
    isTyping?: boolean;
}

// Sidebar Props
export interface SidebarProps {
    currentUser: User;
    conversations: IChatItem[];
    onConversationSelect: (conversationId: string) => void;
    selectedConversationId?: string;
    onSearch: (query: string) => void;
    searchQuery?: string;
    isLoading?: boolean;
}

// Search Props
export interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

// Chat List Props
export interface ChatListProps {
    items: IChatItem[];
    selectedId?: string;
    onItemClick: (conversationId: string) => void;
    currentUserId: string;
}

// Chat Item Props
export interface ChatItemProps {
    item: IChatItem;
    isSelected: boolean;
    onClick: () => void;
    currentUserId: string;
}

// Logo Props
export interface LogoProps {
    size?: 'sm' | 'md' | 'lg';
    showText?: boolean;
    className?: string;
}