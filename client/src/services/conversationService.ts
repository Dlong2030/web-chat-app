import axiosInstance from "../api/axios";

const conversationService = {
    getUserConversations: async (accessToken: string) => {
        try {
            const response = await axiosInstance.get('/conversations', {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching user conversations:', error);
            throw error;
        }
    }
};

export default conversationService;
