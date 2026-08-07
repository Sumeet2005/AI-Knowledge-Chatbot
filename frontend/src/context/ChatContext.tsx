/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import axios from 'axios';
import { formatBytes, getChunkCount } from '../utils/helpers';

export interface Document {
  id: number;
  filename: string;
  original_filename: string;
  file_type: string;
  file_size: number;
  uploaded_at: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  sources?: Array<{ filename: string; chunk_index: number }>;
  retrieved_chunks?: number;
  response_time_ms?: number;
}

export interface Conversation {
  id: number;
  created_at: string;
  message_count: number;
  title: string;
}

interface BackendConversationSummary {
  id: number;
  created_at: string;
  message_count: number;
}

interface BackendMessage {
  role: string;
  content: string;
  created_at: string;
}

interface ChatContextType {
  documents: Document[];
  conversations: Conversation[];
  activeThreadId: number | null;
  currentMessages: Message[];
  loadingDocs: boolean;
  loadingHistory: boolean;
  loadingChat: boolean;
  uploading: boolean;
  fetchDocuments: () => Promise<void>;
  fetchHistory: () => Promise<void>;
  selectThread: (id: number) => Promise<void>;
  startNewThread: () => void;
  sendMessage: (question: string) => Promise<void>;
  uploadFile: (file: File, onProgress?: (pct: number) => void) => Promise<boolean>;
  deleteDocument: (id: number) => Promise<void>;
  renameThread: (id: number, newTitle: string) => void;
  deleteThread: (id: number) => void;
  totalChunks: number;
  totalSizeFormatted: string;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Helper function to safely extract array from any API payload structure
const safeExtractArray = (data: any): any[] => {
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === 'object') {
    if (Array.isArray(data.data)) {
      return data.data;
    }
    if (Array.isArray(data.items)) {
      return data.items;
    }
  }
  return [];
};

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<number | null>(null);
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
  
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Safe array guards for calculations
  const safeDocs = Array.isArray(documents) ? documents : [];
  const totalChunks = safeDocs.reduce((sum, doc) => sum + getChunkCount(doc?.original_filename || '', doc?.file_size || 0), 0);
  const totalBytes = safeDocs.reduce((sum, doc) => sum + (doc?.file_size || 0), 0);
  const totalSizeFormatted = formatBytes(totalBytes);

  const fetchDocuments = async () => {
    setLoadingDocs(true);
    try {
      const res = await axios.get('/api/documents');
      const docs = safeExtractArray(res.data);
      setDocuments(docs);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setDocuments([]);
    } finally {
      setLoadingDocs(false);
    }
  };

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await axios.get('/api/history');
      const summaries = safeExtractArray(res.data);

      // Load local overrides
      const deletedThreadsStr = localStorage.getItem('atlas_deleted_threads');
      const deletedThreads: number[] = deletedThreadsStr ? JSON.parse(deletedThreadsStr) : [];
      const safeDeletedThreads = Array.isArray(deletedThreads) ? deletedThreads : [];
      
      const customTitlesStr = localStorage.getItem('atlas_thread_titles');
      const customTitles: Record<number, string> = customTitlesStr ? JSON.parse(customTitlesStr) : {};

      // Filter out deleted threads with guard
      const filteredSummaries = summaries.filter((c) => c && typeof c === 'object' && !safeDeletedThreads.includes(c.id));
      
      // Resolve thread titles asynchronously from the first message
      const resolvedConversations = await Promise.all(
        filteredSummaries.map(async (c: BackendConversationSummary) => {
          if (!c || typeof c !== 'object') {
            return { id: 0, created_at: new Date().toISOString(), message_count: 0, title: 'Unknown Thread' };
          }
          // Check custom titles mapping override
          if (customTitles[c.id]) {
            return {
              id: c.id,
              created_at: c.created_at || new Date().toISOString(),
              message_count: c.message_count || 0,
              title: customTitles[c.id],
            };
          }

          let title = `Thread ${c.id}`;
          try {
            const detailRes = await axios.get(`/api/history/${c.id}`);
            const messagesList = detailRes.data && detailRes.data.messages ? detailRes.data.messages : [];
            const messages = safeExtractArray(messagesList);
            if (messages.length > 0) {
              const firstUserMsg = messages.find((m: BackendMessage) => m && m.role === 'user');
              if (firstUserMsg && firstUserMsg.content) {
                title = firstUserMsg.content;
              } else if (messages[0] && messages[0].content) {
                title = messages[0].content;
              }
            }
          } catch (e) {
            console.error(`Error resolving title for conversation ${c.id}:`, e);
          }
          return {
            id: c.id,
            created_at: c.created_at || new Date().toISOString(),
            message_count: c.message_count || 0,
            title: title.length > 30 ? title.substring(0, 30) + '...' : title,
          };
        })
      );
      
      setConversations(resolvedConversations.filter(c => c.id !== 0));
    } catch (err) {
      console.error('Error fetching history:', err);
      setConversations([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const selectThread = async (id: number) => {
    setActiveThreadId(id);
    setLoadingChat(true);
    try {
      const res = await axios.get(`/api/history/${id}`);
      const rawMessages = res.data && res.data.messages ? res.data.messages : [];
      const safeMessages = safeExtractArray(rawMessages);
      // Format backend messages to client structure
      const msgs = safeMessages.map((m: BackendMessage) => ({
        role: (m?.role || 'user') as 'user' | 'assistant',
        content: m?.content || '',
        created_at: m?.created_at || new Date().toISOString(),
      }));
      setCurrentMessages(msgs);
    } catch (err) {
      console.error('Error loading conversation detail:', err);
      setCurrentMessages([]);
    } finally {
      setLoadingChat(false);
    }
  };

  const startNewThread = () => {
    setActiveThreadId(null);
    setCurrentMessages([]);
  };

  const sendMessage = async (question: string) => {
    if (!question.trim()) return;

    // 1. Add user message locally
    const userMsg: Message = {
      role: 'user',
      content: question,
      created_at: new Date().toISOString(),
    };
    
    const safePrevMessages = Array.isArray(currentMessages) ? currentMessages : [];
    const updatedMessages = [...safePrevMessages, userMsg];
    setCurrentMessages(updatedMessages);
    setLoadingChat(true);

    try {
      const res = await axios.post('/api/chat', {
        question,
        conversation_id: activeThreadId,
      });

      // Start typing simulation on the frontend
      const fullAnswer = res.data?.answer || '';
      let typedContent = "";
      const tokens = fullAnswer.match(/[^ ]+ +|[^ ]+/g) || [fullAnswer]; // Split by words keeping trailing space
      let tokenIndex = 0;

      const assistantMsg: Message = {
        role: 'assistant',
        content: '',
        created_at: new Date().toISOString(),
        sources: safeExtractArray(res.data?.sources),
        retrieved_chunks: res.data?.retrieved_chunks || 0,
        response_time_ms: res.data?.response_time_ms || 0,
      };

      setCurrentMessages([...updatedMessages, assistantMsg]);
      setLoadingChat(false); // Done loading, now typing

      await new Promise<void>((resolve) => {
        const typeInterval = setInterval(() => {
          if (tokenIndex < tokens.length) {
            typedContent += tokens[tokenIndex];
            tokenIndex++;
            setCurrentMessages((prev) => {
              const copy = Array.isArray(prev) ? [...prev] : [];
              if (copy.length > 0) {
                copy[copy.length - 1] = {
                  ...assistantMsg,
                  content: typedContent,
                };
              }
              return copy;
            });
          } else {
            clearInterval(typeInterval);
            // Once typing finishes, update active thread and history
            if (!activeThreadId && res.data?.conversation_id) {
              setActiveThreadId(res.data.conversation_id);
              fetchHistory();
            }
            resolve();
          }
        }, 22); // 22ms per word makes it stream very smoothly
      });

    } catch (err) {
      console.error('Error sending message:', err);
      // Append an error indicator message
      setCurrentMessages([
        ...updatedMessages,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error while processing your request.',
          created_at: new Date().toISOString(),
        },
      ]);
      setLoadingChat(false);
    }
  };

  const uploadFile = async (file: File, onProgress?: (pct: number) => void): Promise<boolean> => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onProgress) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percentCompleted);
          }
        }
      });
      await fetchDocuments();
      return true;
    } catch (err) {
      console.error('Error uploading document:', err);
      return false;
    } finally {
      setUploading(false);
    }
  };

  const deleteDocument = async (id: number) => {
    try {
      await axios.delete(`/api/documents/${id}`);
      await fetchDocuments();
    } catch (err) {
      console.error('Error deleting document:', err);
    }
  };

  const renameThread = (id: number, newTitle: string) => {
    const customTitlesStr = localStorage.getItem('atlas_thread_titles');
    const customTitles: Record<number, string> = customTitlesStr ? JSON.parse(customTitlesStr) : {};
    customTitles[id] = newTitle.length > 30 ? newTitle.substring(0, 30) + '...' : newTitle;
    localStorage.setItem('atlas_thread_titles', JSON.stringify(customTitles));
    
    // Optimistic update of local state
    setConversations((prev) => {
      const safePrev = Array.isArray(prev) ? prev : [];
      return safePrev.map((c) => (c && c.id === id ? { ...c, title: customTitles[id] } : c));
    });
  };

  const deleteThread = (id: number) => {
    const deletedThreadsStr = localStorage.getItem('atlas_deleted_threads');
    const deletedThreads: number[] = deletedThreadsStr ? JSON.parse(deletedThreadsStr) : [];
    const safeDeletedThreads = Array.isArray(deletedThreads) ? deletedThreads : [];
    if (!safeDeletedThreads.includes(id)) {
      safeDeletedThreads.push(id);
    }
    localStorage.setItem('atlas_deleted_threads', JSON.stringify(safeDeletedThreads));
    
    // Optimistic update of local state
    setConversations((prev) => {
      const safePrev = Array.isArray(prev) ? prev : [];
      return safePrev.filter((c) => c && c.id !== id);
    });
    
    // If active thread is deleted, go to a new thread
    if (activeThreadId === id) {
      startNewThread();
    }
  };

  // Initial fetches
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDocuments();
    fetchHistory();
  }, []);

  return (
    <ChatContext.Provider
      value={{
        documents,
        conversations,
        activeThreadId,
        currentMessages,
        loadingDocs,
        loadingHistory,
        loadingChat,
        uploading,
        fetchDocuments,
        fetchHistory,
        selectThread,
        startNewThread,
        sendMessage,
        uploadFile,
        deleteDocument,
        renameThread,
        deleteThread,
        totalChunks,
        totalSizeFormatted,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
