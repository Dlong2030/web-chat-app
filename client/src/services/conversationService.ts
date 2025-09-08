import axiosInstance from "../api/axios";
import { ConversationResponse } from "../types/chat.types";

interface ApiResponse {
    success: boolean;
    data: ConversationResponse[];
    message?: string;
}

const conversationService = {
    getUserConversations: async (accessToken: string): Promise<ConversationResponse[]> => {
        try {
            const response = await axiosInstance.get<ApiResponse>('/conversations', {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });

            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to fetch conversations');
            }

            return response.data.data;
        } catch (error: any) {
            console.error('Error fetching user conversations:', error);
            throw new Error(error.response?.data?.message || error.message || 'Network error');
        }
    }
};

export default conversationService;