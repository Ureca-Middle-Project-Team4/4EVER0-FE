import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Message, ChatSession } from '@/types/chat';

interface ChatStore {
  sessions: Record<string, ChatSession>;
  currentSessionId: string | null;

  // Actions
  createSession: () => string;
  addMessage: (sessionId: string, content: string, type: 'user' | 'bot') => string;
  updateLastBotMessage: (sessionId: string, content: string) => void;
  incrementUsage: (sessionId: string) => boolean;
  endSession: (sessionId: string) => void;
  getCurrentSession: () => ChatSession | null;
}

export const useChatStore = create<ChatStore>()((set, get) => ({
  sessions: {},
  currentSessionId: null,

  createSession: () => {
    const sessionId = uuidv4();
    set((state) => ({
      sessions: {
        ...state.sessions,
        [sessionId]: {
          sessionId,
          messages: [],
          usageCount: 0,
          isCompleted: false,
        },
      },
      currentSessionId: sessionId,
    }));
    return sessionId;
  },

  addMessage: (sessionId, content, type) => {
    const message: Message = {
      id: uuidv4(),
      content,
      type,
      timestamp: new Date(),
    };

    set((state) => {
      const session = state.sessions[sessionId];
      if (!session) return state;

      return {
        ...state,
        sessions: {
          ...state.sessions,
          [sessionId]: {
            ...session,
            messages: [...session.messages, message],
          },
        },
      };
    });

    return message.id;
  },

  updateLastBotMessage: (sessionId, content) => {
    set((state) => {
      const session = state.sessions[sessionId];
      if (!session) return state;

      const messages = [...session.messages];
      let updated = false;

      // 마지막 봇 메시지 찾아서 업데이트
      for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].type === 'bot') {
          messages[i] = {
            ...messages[i],
            content,
            timestamp: new Date(),
          };
          updated = true;
          break;
        }
      }

      if (!updated) return state;

      return {
        ...state,
        sessions: {
          ...state.sessions,
          [sessionId]: {
            ...session,
            messages,
          },
        },
      };
    });
  },

  incrementUsage: (sessionId) => {
    const state = get();
    const session = state.sessions[sessionId];

    if (!session) return false;

    if (session.usageCount >= 5) {
      // 세션 종료
      set((currentState) => ({
        ...currentState,
        sessions: {
          ...currentState.sessions,
          [sessionId]: {
            ...currentState.sessions[sessionId],
            isCompleted: true,
          },
        },
        currentSessionId: null,
      }));
      return false;
    }

    set((currentState) => ({
      ...currentState,
      sessions: {
        ...currentState.sessions,
        [sessionId]: {
          ...currentState.sessions[sessionId],
          usageCount: currentState.sessions[sessionId].usageCount + 1,
        },
      },
    }));

    return true;
  },

  endSession: (sessionId) => {
    set((state) => {
      const session = state.sessions[sessionId];
      if (!session) return state;

      return {
        ...state,
        sessions: {
          ...state.sessions,
          [sessionId]: {
            ...session,
            isCompleted: true,
          },
        },
        currentSessionId: null,
      };
    });
  },

  getCurrentSession: () => {
    const state = get();
    const id = state.currentSessionId;
    if (!id) return null;
    return state.sessions[id] || null;
  },
}));
