import { create } from 'zustand';

const useMessageStore = create((set) => ({
  conversations: [],
  currentConversation: null,
  messages: [],
  loading: false,

  // Set conversations list
  setConversations: (conversations) => set({ conversations }),

  // Set current conversation
  setCurrentConversation: (conversation) =>
    set({ currentConversation: conversation }),

  // Set messages for current conversation
  setMessages: (messages) => set({ messages }),

  // Add a new message (from socket or send)
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  // Update conversation with new message
  updateConversation: (userId, lastMessage) =>
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.user._id === userId
          ? { ...conv, lastMessage, updatedAt: new Date() }
          : conv
      ),
    })),

  // Mark messages as seen
  markAsSeen: (userId) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.sender === userId ? { ...msg, seen: true } : msg
      ),
    })),

  // Set loading state
  setLoading: (loading) => set({ loading }),

  // Clear messages
  clearMessages: () =>
    set({ messages: [], currentConversation: null, loading: false }),
}));

export default useMessageStore;
